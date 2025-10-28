from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Property, Unit, Payment
from ..models.user import User
from ..schemas.mobile_payment import MobilePaymentCreate
from ..services.mobile_money_service import MobileMoneyService
from datetime import datetime, timedelta
from decimal import Decimal

router = APIRouter()
templates = Jinja2Templates(directory="templates")
mobile_money_service = MobileMoneyService()

@router.get("/property/{property_id}", response_class=HTMLResponse)
async def property_payment_form(
    property_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Render payment form for property QR code."""
    
    # Get property
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        return HTMLResponse(
            content="<h1>Property not found</h1>",
            status_code=404
        )
    
    # Check if property has mobile money numbers
    if not property.mtn_mobile_money_number and not property.airtel_money_number:
        return HTMLResponse(
            content="<h1>Payment method not configured for this property</h1>",
            status_code=400
        )
    
    # Get all units for this property
    units = db.query(Unit).filter(Unit.property_id == property_id).all()
    
    # Calculate suggested amount (average rent)
    suggested_amount = 0
    if units:
        total_rent = sum(float(unit.monthly_rent) for unit in units if unit.monthly_rent)
        suggested_amount = total_rent / len(units) if units else 0
    
    return templates.TemplateResponse("property_payment_form.html", {
        "request": request,
        "property": property,
        "units": units,
        "suggested_amount": suggested_amount,
        "mtn_number": property.mtn_mobile_money_number,
        "airtel_number": property.airtel_money_number
    })

@router.post("/property/{property_id}/initiate")
async def initiate_property_payment(
    property_id: int,
    phone_number: str,
    unit_id: int,
    amount: float,
    months_advance: int = 1,
    is_prepayment: bool = False,
    db: Session = Depends(get_db)
):
    """Initiate mobile money payment for property."""
    
    # Get property and unit
    property = db.query(Property).filter(Property.id == property_id).first()
    unit = db.query(Unit).filter(Unit.id == unit_id, Unit.property_id == property_id).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or doesn't belong to this property"
        )
    
    # Determine mobile money provider and number
    provider = "mtn_mobile_money"  # Default to MTN
    account_number = property.mtn_mobile_money_number
    
    if not account_number and property.airtel_money_number:
        provider = "airtel_money"
        account_number = property.airtel_money_number
    
    if not account_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No mobile money number configured for this property"
        )
    
    try:
        # Initiate mobile money payment
        payment_result = await mobile_money_service.initiate_payment(
            phone_number=phone_number,
            amount=amount,
            account_number=account_number,
            provider=provider,
            description=f"Rent payment for {unit.unit_number} - {property.name}"
        )
        
        # Create payment record
        payment_data = MobilePaymentCreate(
            transaction_id=payment_result["transaction_id"],
            phone_number=phone_number,
            amount=Decimal(str(amount)),
            currency="UGX",
            provider=provider,
            status="pending",
            status_message="Payment initiated",
            payer_id=1,  # Anonymous payer
            unit_id=unit_id,
            tenant_id=None,
            months_advance=months_advance,
            is_prepayment=is_prepayment
        )
        
        # Save to database (you'll need to implement this)
        # mobile_payment = create_mobile_payment(db, payment_data)
        
        return {
            "success": True,
            "transaction_id": payment_result["transaction_id"],
            "status": "pending",
            "message": "Payment initiated successfully",
            "check_status_url": f"/api/v1/mobile-payment/status/{payment_result['transaction_id']}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment initiation failed: {str(e)}"
        )
