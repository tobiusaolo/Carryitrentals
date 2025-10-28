from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..models.user import User
from ..models.property import Property
from ..models.tenant import Tenant
from ..models.payment import Payment
from ..crud.property import property_crud
from ..crud.tenant import tenant_crud
from ..crud.payment import payment_crud
from ..services.pdf_generator import pdf_generator
from ..services.accounting_service import accounting_service

router = APIRouter(prefix="/reports", tags=["Reports & Statements"])

@router.get("/tenant-statement/{tenant_id}/pdf")
async def generate_tenant_statement_pdf(
    tenant_id: int,
    year: int,
    month: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate PDF rent statement for tenant"""
    try:
        # Get tenant
        tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Check access - only owners/admins can generate for their properties
        if current_user.role != "admin":
            # Non-admin users can only access tenants from their properties
            if tenant.property.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail="Access denied: You can only generate statements for your own tenants")
        
        # Get tenant data
        tenant_data = {
            "first_name": tenant.first_name,
            "last_name": tenant.last_name,
            "email": tenant.email,
            "phone": tenant.phone,
            "unit_number": tenant.unit.unit_number if tenant.unit else "N/A",
            "property_name": tenant.property.name if tenant.property else "N/A",
            "monthly_rent": float(tenant.monthly_rent),
            "utilities": []  # TODO: Add utility costs
        }
        
        # Get payments for the month
        month_start = date(year, month, 1)
        if month == 12:
            month_end = date(year + 1, 1, 1)
        else:
            month_end = date(year, month + 1, 1)
        
        payments_query = db.query(Payment).filter(
            Payment.tenant_id == tenant_id,
            Payment.paid_date >= month_start,
            Payment.paid_date < month_end
        ).all()
        
        payments = [
            {
                "date": p.paid_date.strftime('%Y-%m-%d') if p.paid_date else 'N/A',
                "method": p.payment_method or 'N/A',
                "reference": p.reference_number or 'N/A',
                "amount": float(p.amount)
            }
            for p in payments_query
        ]
        
        # Generate PDF
        pdf_buffer = pdf_generator.generate_tenant_statement(tenant_data, payments, month, year)
        
        # Return as streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=statement_{tenant.first_name}_{tenant.last_name}_{year}_{month:02d}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating statement: {str(e)}"
        )

@router.get("/property-report/{property_id}/pdf")
async def generate_property_report_pdf(
    property_id: int,
    start_date: date,
    end_date: date,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate comprehensive property performance PDF report"""
    try:
        # Get property
        property = property_crud.get_property_by_id(db, property_id)
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Check access - only owners/admins can generate for their properties
        if current_user.role != "admin":
            # Non-admin users can only access their own properties
            if property.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail="Access denied: You can only generate reports for your own properties")
        
        # Get property data
        property_data = {
            "name": property.name,
            "address": f"{property.address}, {property.city}, {property.state}",
            "total_units": property.total_units
        }
        
        # Calculate actual occupancy from units
        from ..models.unit import Unit
        from ..models.enums import UnitStatus
        
        all_units = db.query(Unit).filter(Unit.property_id == property_id).all()
        occupied_units = [u for u in all_units if u.status == UnitStatus.OCCUPIED]
        total_units_count = len(all_units)
        occupied_count = len(occupied_units)
        occupancy_rate = (occupied_count / total_units_count * 100) if total_units_count > 0 else 0
        
        # Get tenants for this property
        tenants = db.query(Tenant).filter(
            Tenant.property_id == property_id,
            Tenant.is_active == True
        ).all()
        
        # Calculate expected revenue from active tenants
        expected_monthly_revenue = sum(float(t.monthly_rent) for t in tenants)
        
        # Get payments for the period
        payments_in_period = db.query(Payment).join(Tenant).filter(
            Tenant.property_id == property_id,
            Payment.paid_date >= start_date,
            Payment.paid_date <= end_date,
            Payment.status == 'paid'
        ).all()
        
        actual_revenue = sum(float(p.amount) for p in payments_in_period)
        
        # Get financial data
        income_stmt = accounting_service.generate_income_statement(db, property_id, start_date, end_date)
        
        financial_data = {
            "occupied_units": occupied_count,
            "occupancy_rate": occupancy_rate,
            "total_revenue": actual_revenue,
            "expected_revenue": expected_monthly_revenue,
            "total_expenses": income_stmt.get("total_expenses", 0),
            "net_income": actual_revenue - income_stmt.get("total_expenses", 0),
            "profit_margin": ((actual_revenue - income_stmt.get("total_expenses", 0)) / actual_revenue * 100) if actual_revenue > 0 else 0,
            "total_tenants": len(tenants),
            "total_units": total_units_count
        }
        
        # Generate PDF
        pdf_buffer = pdf_generator.generate_property_report(property_data, financial_data, start_date, end_date)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=property_report_{property.name}_{start_date}_{end_date}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating property report: {str(e)}"
        )

@router.get("/year-end/{year}/pdf")
async def generate_year_end_report_pdf(
    year: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate year-end report PDF for owner"""
    try:
        # Get owner data
        owner_data = {
            "name": f"{current_user.first_name} {current_user.last_name}",
            "email": current_user.email
        }
        
        # Get properties based on user role
        if current_user.role == "admin":
            properties = db.query(Property).all()
        else:
            # Regular users see only their properties
            properties = property_crud.get_properties_by_owner(db, current_user.id)
        
        # Get financial data for each property
        properties_data = []
        total_revenue = 0
        total_expenses = 0
        total_occupied = 0
        total_units = 0
        
        for prop in properties:
            # Calculate actual occupancy
            from ..models.unit import Unit
            from ..models.enums import UnitStatus
            
            all_units = db.query(Unit).filter(Unit.property_id == prop.id).all()
            occupied_units = [u for u in all_units if u.status == UnitStatus.OCCUPIED]
            
            # Get tenants for this property
            tenants = db.query(Tenant).filter(
                Tenant.property_id == prop.id,
                Tenant.is_active == True
            ).all()
            
            # Get payments for the year
            year_start = date(year, 1, 1)
            year_end = date(year, 12, 31)
            
            payments_in_year = db.query(Payment).join(Tenant).filter(
                Tenant.property_id == prop.id,
                Payment.paid_date >= year_start,
                Payment.paid_date <= year_end,
                Payment.status == 'paid'
            ).all()
            
            actual_revenue = sum(float(p.amount) for p in payments_in_year)
            
            # Get expenses from accounting
            income_stmt = accounting_service.generate_income_statement(
                db, prop.id, year_start, year_end
            )
            
            property_expenses = income_stmt.get("total_expenses", 0)
            
            properties_data.append({
                "name": prop.name,
                "total_units": len(all_units),
                "occupied_units": len(occupied_units),
                "occupancy_rate": (len(occupied_units) / len(all_units) * 100) if len(all_units) > 0 else 0,
                "total_tenants": len(tenants),
                "revenue": actual_revenue,
                "expenses": property_expenses,
                "net_income": actual_revenue - property_expenses
            })
            
            total_revenue += actual_revenue
            total_expenses += property_expenses
            total_occupied += len(occupied_units)
            total_units += len(all_units)
        
        financial_summary = {
            "total_revenue": total_revenue,
            "total_expenses": total_expenses,
            "net_income": total_revenue - total_expenses,
            "avg_occupancy": (total_occupied / total_units * 100) if total_units > 0 else 0,
            "roi": ((total_revenue - total_expenses) / total_revenue * 100) if total_revenue > 0 else 0,
            "total_properties": len(properties),
            "total_units": total_units,
            "total_occupied": total_occupied
        }
        
        # Generate PDF
        pdf_buffer = pdf_generator.generate_year_end_report(owner_data, properties_data, financial_summary, year)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=year_end_report_{year}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating year-end report: {str(e)}"
        )

@router.get("/tax-report/{property_id}/{year}/pdf")
async def generate_tax_report_pdf(
    property_id: int,
    year: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate tax report PDF for property"""
    try:
        # Get property
        property = property_crud.get_property_by_id(db, property_id)
        if not property:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Check access - only owners/admins can generate for their properties
        if current_user.role != "admin":
            # Non-admin users can only access their own properties
            if property.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail="Access denied: You can only generate tax reports for your own properties")
        
        # Get property data
        property_data = {
            "name": property.name,
            "address": f"{property.address}, {property.city}, {property.state}"
        }
        
        # Get income and expense data for the year
        income_stmt = accounting_service.generate_income_statement(
            db, property_id, date(year, 1, 1), date(year, 12, 31)
        )
        
        income_data = income_stmt.get("revenues", {})
        expense_data = income_stmt.get("expenses", {})
        
        # Generate PDF
        pdf_buffer = pdf_generator.generate_tax_report(property_data, income_data, expense_data, year)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=tax_report_{property.name}_{year}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating tax report: {str(e)}"
        )


