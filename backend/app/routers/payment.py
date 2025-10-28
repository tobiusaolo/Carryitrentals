from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.payment import PaymentCreate, PaymentResponse, PaymentUpdate, PaymentWithDetails
from ..crud.payment import payment_crud
from ..crud.unit import unit_crud
from ..crud.property import property_crud
from ..services.notification import notification_service
from ..models.user import User

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new payment."""
    # Check if unit exists and user has access
    unit = unit_crud.get_unit_by_id(db, payment.unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Check if payer exists
    from ..crud.user import user_crud
    payer = user_crud.get_user_by_id(db, payment.payer_id)
    if not payer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payer not found"
        )
    
    return payment_crud.create_payment(db, payment)

@router.get("/", response_model=List[PaymentWithDetails])
async def get_payments(
    unit_id: Optional[int] = None,
    tenant_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get payments with details."""
    payments = []
    
    if unit_id:
        # Check access permissions
        unit = unit_crud.get_unit_by_id(db, unit_id)
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unit not found"
            )
        
        property = property_crud.get_property_by_id(db, unit.property_id)
        if current_user.role == "owner" and property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        payments = payment_crud.get_payments_by_unit(db, unit_id, skip=skip, limit=limit)
    elif tenant_id:
        # Check access permissions
        if current_user.role == "tenant" and current_user.id != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        payments = payment_crud.get_payments_by_tenant(db, tenant_id, skip=skip, limit=limit)
    elif status:
        if current_user.role == "owner":
            payments = payment_crud.get_payments_by_owner(db, current_user.id, skip=skip, limit=limit)
            if status != "all":
                payments = [p for p in payments if p.status == status]
        elif current_user.role == "admin":
            payments = payment_crud.get_payments_by_status(db, status, skip=skip, limit=limit)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    else:
        # Return all payments for admin/owner
        if current_user.role == "owner":
            payments = payment_crud.get_payments_by_owner(db, current_user.id, skip=skip, limit=limit)
        elif current_user.role == "admin":
            payments = payment_crud.get_payments_by_status(db, "all", skip=skip, limit=limit)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Add details to each payment
    payments_with_details = []
    for payment in payments:
        payment_dict = {
            **payment.__dict__,
            "unit_number": payment.unit.unit_number if payment.unit else "N/A",
            "property_name": payment.unit.property.name if payment.unit and payment.unit.property else "N/A",
            "payer_name": f"{payment.payer.first_name} {payment.payer.last_name}" if payment.payer else "N/A",
            "tenant_name": f"{payment.tenant.first_name} {payment.tenant.last_name}" if payment.tenant else "N/A"
        }
        payments_with_details.append(PaymentWithDetails(**payment_dict))
    
    return payments_with_details

# Utility Payment Endpoints
@router.get("/utilities", response_model=List[PaymentResponse])
async def get_utility_payments(
    property_id: Optional[int] = None,
    unit_id: Optional[int] = None,
    tenant_id: Optional[int] = None,
    utility_id: Optional[int] = None,
    unit_utility_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get utility payments with various filters."""
    if property_id:
        payments = payment_crud.get_utility_payments_by_property(db, property_id, skip, limit)
    elif unit_id:
        payments = payment_crud.get_utility_payments_by_unit(db, unit_id, skip, limit)
    elif tenant_id:
        payments = payment_crud.get_utility_payments_by_tenant(db, tenant_id, skip, limit)
    else:
        payments = payment_crud.get_utility_payments(db, utility_id, unit_utility_id, skip, limit)
    
    return payments

@router.post("/utilities", response_model=PaymentResponse)
async def create_utility_payment(
    payment: PaymentCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a utility payment."""
    # Ensure this is a utility payment
    if payment.payment_type != "utility":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment type must be 'utility'"
        )
    
    # Check if unit exists and user has access
    unit = unit_crud.get_unit_by_id(db, payment.unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check property access
    property = property_crud.get_property_by_id(db, unit.property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Validate utility references
    if payment.utility_id:
        from ..crud.utility import utility_crud
        utility = utility_crud.get_utility_by_id(db, payment.utility_id)
        if not utility or utility.property_id != unit.property_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid utility reference"
            )
    
    if payment.unit_utility_id:
        from ..crud.unit_utility import unit_utility_crud
        unit_utility = unit_utility_crud.get_unit_utility_by_id(db, payment.unit_utility_id)
        if not unit_utility or unit_utility.unit_id != payment.unit_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid unit utility reference"
            )
    
    # Create the payment
    db_payment = payment_crud.create_payment(db, payment)
    
    return db_payment

@router.get("/utilities/summary")
async def get_utility_payment_summary(
    property_id: Optional[int] = None,
    unit_id: Optional[int] = None,
    tenant_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get utility payment summary statistics."""
    from datetime import datetime, date
    from ..models.payment import PaymentStatus
    
    # Get utility payments based on filters
    if property_id:
        payments = payment_crud.get_utility_payments_by_property(db, property_id)
    elif unit_id:
        payments = payment_crud.get_utility_payments_by_unit(db, unit_id)
    elif tenant_id:
        payments = payment_crud.get_utility_payments_by_tenant(db, tenant_id)
    else:
        payments = payment_crud.get_utility_payments(db)
    
    # Calculate statistics
    total_amount = sum(float(p.amount) for p in payments)
    paid_amount = sum(float(p.amount) for p in payments if p.status == PaymentStatus.PAID)
    pending_amount = sum(float(p.amount) for p in payments if p.status == PaymentStatus.PENDING)
    overdue_amount = sum(float(p.amount) for p in payments if p.status == PaymentStatus.OVERDUE)
    
    # Current month statistics
    current_month = datetime.now().replace(day=1)
    current_month_payments = [p for p in payments if p.created_at >= current_month]
    current_month_total = sum(float(p.amount) for p in current_month_payments)
    current_month_paid = sum(float(p.amount) for p in current_month_payments if p.status == PaymentStatus.PAID)
    
    return {
        "total_payments": len(payments),
        "total_amount": total_amount,
        "paid_amount": paid_amount,
        "pending_amount": pending_amount,
        "overdue_amount": overdue_amount,
        "current_month_total": current_month_total,
        "current_month_paid": current_month_paid,
        "collection_rate": (paid_amount / total_amount * 100) if total_amount > 0 else 0,
        "current_month_collection_rate": (current_month_paid / current_month_total * 100) if current_month_total > 0 else 0
    }

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get payment by ID."""
    payment = payment_crud.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check access permissions
    if current_user.role == "tenant" and payment.payer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "owner":
        unit = unit_crud.get_unit_by_id(db, payment.unit_id)
        property = property_crud.get_property_by_id(db, unit.property_id)
        if property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return payment

@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update payment by ID."""
    payment = payment_crud.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check ownership
    unit = unit_crud.get_unit_by_id(db, payment.unit_id)
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_payment = payment_crud.update_payment(db, payment_id, payment_update)
    return updated_payment

@router.post("/{payment_id}/mark-paid")
async def mark_payment_as_paid(
    payment_id: int,
    payment_method: str,
    reference_number: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Mark payment as paid."""
    payment = payment_crud.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check ownership
    unit = unit_crud.get_unit_by_id(db, payment.unit_id)
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_payment = payment_crud.mark_payment_as_paid(db, payment_id, payment_method, reference_number)
    return updated_payment

@router.delete("/{payment_id}")
async def delete_payment(
    payment_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete payment by ID."""
    payment = payment_crud.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check ownership
    unit = unit_crud.get_unit_by_id(db, payment.unit_id)
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = payment_crud.delete_payment(db, payment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return {"message": "Payment deleted successfully"}

@router.get("/overdue/list", response_model=List[PaymentResponse])
async def get_overdue_payments(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get overdue payments."""
    return payment_crud.get_overdue_payments(db, skip=skip, limit=limit)

@router.post("/send-reminders")
async def send_payment_reminders(
    property_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Send payment reminders to tenants."""
    # Check property access
    property = property_crud.get_property_by_id(db, property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get overdue payments for the property
    units = unit_crud.get_units_by_property(db, property_id)
    overdue_payments = []
    for unit in units:
        unit_payments = payment_crud.get_payments_by_unit(db, unit.id)
        overdue_payments.extend([p for p in unit_payments if p.status in ["pending", "overdue"]])
    
    # Send reminders
    sent_count = 0
    for payment in overdue_payments:
        from ..crud.user import user_crud
        tenant = user_crud.get_user_by_id(db, payment.payer_id)
        if tenant:
            await notification_service.send_payment_reminder(
                db, tenant.id, float(payment.amount), 
                payment.due_date.strftime("%Y-%m-%d"), 
                tenant.email, tenant.phone
            )
            sent_count += 1
    
    return {"message": f"Reminders sent to {sent_count} tenants"}
