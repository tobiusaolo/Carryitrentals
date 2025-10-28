from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import date
from decimal import Decimal

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.accounting import (
    AccountCreate, AccountResponse, AccountUpdate,
    ExpenseCreate, ExpenseResponse, ExpenseUpdate,
    AccountingTransactionResponse,
    FinancialReportRequest
)
from ..models.accounting import Account, Expense, AccountingTransaction, JournalEntry, AccountType, ExpenseCategory
from ..models.user import User
from ..services.accounting_service import accounting_service
from ..crud.property import property_crud
from ..services.file_upload import file_upload_service

router = APIRouter(prefix="/accounting", tags=["Accounting"])

# ==================== CHART OF ACCOUNTS ====================

@router.post("/accounts", response_model=AccountResponse)
async def create_account(
    account: AccountCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new account"""
    # Check if code already exists
    existing = db.query(Account).filter(Account.code == account.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account code already exists"
        )
    
    db_account = Account(**account.dict())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/accounts", response_model=List[AccountResponse])
async def get_accounts(
    account_type: Optional[str] = None,
    is_active: bool = True,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all accounts"""
    query = db.query(Account).filter(Account.is_active == is_active)
    
    if account_type:
        query = query.filter(Account.type == AccountType(account_type))
    
    return query.all()

@router.post("/accounts/seed-defaults")
async def seed_default_accounts(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Create default chart of accounts"""
    count = accounting_service.seed_default_chart_of_accounts(db)
    return {"message": f"Created {count} default accounts", "count": count}

# ==================== EXPENSES ====================

@router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(
    expense: ExpenseCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new expense"""
    # Verify property access
    property = property_crud.get_property_by_id(db, expense.property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_expense = Expense(
        **expense.dict(),
        created_by_user_id=current_user.id
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    # Record in accounting system
    accounting_service.record_expense(db, db_expense.id)
    
    return db_expense

@router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(
    property_id: Optional[int] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get expenses with filtering"""
    query = db.query(Expense)
    
    # Filter by owner if needed
    if current_user.role == "owner":
        owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
        property_ids = [p.id for p in owner_properties]
        query = query.filter(Expense.property_id.in_(property_ids))
    
    if property_id:
        query = query.filter(Expense.property_id == property_id)
    
    if category:
        query = query.filter(Expense.category == ExpenseCategory(category))
    
    if start_date:
        query = query.filter(Expense.date >= start_date)
    
    if end_date:
        query = query.filter(Expense.date <= end_date)
    
    return query.offset(skip).limit(limit).all()

@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update an expense"""
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Check access
    property = property_crud.get_property_by_id(db, db_expense.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = expense_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_expense, field, value)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.delete("/expenses/{expense_id}")
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete an expense"""
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Check access
    property = property_crud.get_property_by_id(db, db_expense.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted successfully"}

@router.post("/expenses/{expense_id}/upload-receipt")
async def upload_expense_receipt(
    expense_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Upload receipt image for expense"""
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Check access
    property = property_crud.get_property_by_id(db, db_expense.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    file_location = await file_upload_service.upload_file(file, f"expenses/{expense_id}/receipt")
    db_expense.receipt_image = file_location
    db.commit()
    
    return {"message": "Receipt uploaded successfully", "file_path": file_location}

# ==================== FINANCIAL REPORTS ====================

@router.post("/reports/income-statement", response_model=Dict)
async def generate_income_statement(
    report_request: FinancialReportRequest,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Generate Income Statement (P&L)"""
    # Verify property access if specified
    if report_request.property_id:
        property = property_crud.get_property_by_id(db, report_request.property_id)
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        if current_user.role == "owner" and property.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return accounting_service.generate_income_statement(
        db, 
        report_request.property_id,
        report_request.start_date,
        report_request.end_date
    )

@router.post("/reports/balance-sheet", response_model=Dict)
async def generate_balance_sheet(
    report_request: FinancialReportRequest,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Generate Balance Sheet"""
    if report_request.property_id:
        property = property_crud.get_property_by_id(db, report_request.property_id)
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        if current_user.role == "owner" and property.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return accounting_service.generate_balance_sheet(
        db,
        report_request.property_id,
        report_request.as_of_date
    )

@router.post("/reports/cash-flow", response_model=Dict)
async def generate_cash_flow_statement(
    report_request: FinancialReportRequest,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Generate Cash Flow Statement"""
    if report_request.property_id:
        property = property_crud.get_property_by_id(db, report_request.property_id)
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        if current_user.role == "owner" and property.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return accounting_service.generate_cash_flow_statement(
        db,
        report_request.property_id,
        report_request.start_date,
        report_request.end_date
    )

@router.post("/reports/trial-balance", response_model=Dict)
async def generate_trial_balance(
    report_request: FinancialReportRequest,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Generate Trial Balance"""
    if report_request.property_id:
        property = property_crud.get_property_by_id(db, report_request.property_id)
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        if current_user.role == "owner" and property.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return accounting_service.get_trial_balance(
        db,
        report_request.property_id,
        report_request.as_of_date
    )

@router.get("/expenses/by-category", response_model=Dict)
async def get_expenses_by_category(
    property_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get expense breakdown by category"""
    try:
        query = db.query(Expense)
        
        # Filter by owner
        if current_user.role == "owner":
            owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
            property_ids = [p.id for p in owner_properties]
            query = query.filter(Expense.property_id.in_(property_ids))
        
        if property_id:
            query = query.filter(Expense.property_id == property_id)
        
        if start_date:
            query = query.filter(Expense.date >= start_date)
        
        if end_date:
            query = query.filter(Expense.date <= end_date)
        
        expenses = query.all()
        
        # Group by category
        by_category = {}
        for expense in expenses:
            category = expense.category.value
            if category not in by_category:
                by_category[category] = {
                    "count": 0,
                    "total": 0
                }
            by_category[category]["count"] += 1
            by_category[category]["total"] += float(expense.amount)
        
        total = sum(cat["total"] for cat in by_category.values())
        
        return {
            "by_category": by_category,
            "total_expenses": total,
            "period": {
                "start": str(start_date) if start_date else None,
                "end": str(end_date) if end_date else None
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting expenses by category: {str(e)}"
        )








