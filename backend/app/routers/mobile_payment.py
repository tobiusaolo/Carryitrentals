from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import uuid

from ..database import get_db
from ..auth import get_current_active_user
from ..schemas.qr_payment import QRCodePaymentResponse
from ..crud.qr_payment import qr_payment_crud
from ..crud.unit import unit_crud
from ..crud.property import property_crud
from ..services.mobile_money_service import mobile_money_service
from ..models.user import User
from ..models.mobile_payment import MobilePayment
from ..models.payment import Payment
from ..models.enums import PaymentStatus

router = APIRouter(prefix="/mobile-payment", tags=["Mobile Payment"])

# Templates for mobile web interface
templates = Jinja2Templates(directory="templates")

@router.get("/form/{qr_payment_id}", response_class=HTMLResponse)
async def mobile_payment_form(
    qr_payment_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Display mobile payment form."""
    # Get QR payment details
    qr_payment = qr_payment_crud.get_qr_payment_by_id(db, qr_payment_id)
    if not qr_payment:
        return HTMLResponse("<h1>Payment not found</h1>", status_code=404)
    
    # Check if QR code is still valid
    if qr_payment.status != "active" or qr_payment.expires_at < datetime.utcnow():
        return HTMLResponse("<h1>This payment link has expired</h1>", status_code=400)
    
    # Get unit and property details
    unit = unit_crud.get_unit_by_id(db, qr_payment.unit_id)
    property = property_crud.get_property_by_id(db, unit.property_id)

    # Fetch all units for this property for selection
    units = unit_crud.get_units_by_property(db, property.id)

    # Suggest amount: default to due rent for this unit if there is a pending/overdue payment
    suggested_amount = float(qr_payment.amount)
    try:
        due_payment = (
            db.query(Payment)
            .filter(
                Payment.unit_id == unit.id,
                Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.OVERDUE])
            )
            .order_by(Payment.due_date.asc())
            .first()
        )
        if due_payment:
            suggested_amount = float(due_payment.amount)
    except Exception:
        pass
    
    # Get property owner's mobile money number
    payee_number = None
    if qr_payment.mobile_money_provider == "mtn_mobile_money":
        payee_number = property.mtn_mobile_money_number
    elif qr_payment.mobile_money_provider == "airtel_money":
        payee_number = property.airtel_money_number
    
    if not payee_number:
        return HTMLResponse("<h1>Payment method not configured for this property</h1>", status_code=400)
    
    return templates.TemplateResponse("mobile_payment_form.html", {
        "request": request,
        "qr_payment": qr_payment,
        "unit": unit,
        "property": property,
        "payee_number": payee_number,
        "units": units,
        "suggested_amount": suggested_amount
    })

@router.post("/initiate/{qr_payment_id}")
async def initiate_mobile_payment(
    qr_payment_id: int,
    phone_number: str,
    unit_id: int,
    amount: float,
    request: Request,
    months_advance: int = 1,
    is_prepayment: bool = False,
    db: Session = Depends(get_db)
):
    """Initiate mobile money payment."""
    # Get QR payment details
    qr_payment = qr_payment_crud.get_qr_payment_by_id(db, qr_payment_id)
    if not qr_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Check if QR code is still valid
    if qr_payment.status != "active" or qr_payment.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Payment link has expired")
    
    # Get unit and property details (use the unit selected by user)
    unit = unit_crud.get_unit_by_id(db, unit_id)
    property = property_crud.get_property_by_id(db, unit.property_id)
    
    # Get property owner's mobile money number
    payee_number = None
    if qr_payment.mobile_money_provider == "mtn_mobile_money":
        payee_number = property.mtn_mobile_money_number
    elif qr_payment.mobile_money_provider == "airtel_money":
        payee_number = property.airtel_money_number
    
    if not payee_number:
        raise HTTPException(status_code=400, detail="Payment method not configured")
    
    # Generate unique transaction ID
    external_id = str(uuid.uuid4())
    
    # Create mobile payment record
    mobile_payment = MobilePayment(
        qr_payment_id=qr_payment_id,
        unit_id=unit.id,
        tenant_id=qr_payment.tenant_id,
        payer_id=qr_payment.payer_id,
        amount=amount,
        provider=qr_payment.mobile_money_provider,
        external_id=external_id,
        payer_phone_number=phone_number,
        payee_phone_number=payee_number,
        reference=f"Rent-{unit.unit_number}-{datetime.utcnow().strftime('%Y%m%d')}",
        description=f"Rent payment for {unit.unit_number} at {property.name}",
        months_advance=max(1, int(months_advance)),
        is_prepayment=bool(is_prepayment)
    )
    
    db.add(mobile_payment)
    db.commit()
    db.refresh(mobile_payment)
    
    # Initiate payment with mobile money provider
    payment_result = mobile_money_service.initiate_payment(
        provider=qr_payment.mobile_money_provider,
        phone_number=phone_number,
        amount=float(amount),
        external_id=external_id,
        reference=mobile_payment.reference
    )
    
    if payment_result["success"]:
        # Update mobile payment with transaction ID
        mobile_payment.transaction_id = payment_result.get("transaction_id")
        mobile_payment.provider_status = payment_result.get("status")
        db.commit()
        
        return {
            "success": True,
            "message": "Payment request sent to your mobile money app",
            "transaction_id": external_id,
            "status": "pending",
            "months_advance": mobile_payment.months_advance,
            "is_prepayment": mobile_payment.is_prepayment
        }
    else:
        # Update mobile payment with error
        mobile_payment.status = "failed"
        mobile_payment.failure_reason = payment_result.get("error")
        mobile_payment.failed_at = datetime.utcnow()
        db.commit()
        
        raise HTTPException(status_code=400, detail=payment_result.get("error"))

@router.get("/status/{transaction_id}")
async def check_payment_status(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """Check payment status."""
    mobile_payment = db.query(MobilePayment).filter(MobilePayment.external_id == transaction_id).first()
    if not mobile_payment:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "transaction_id": transaction_id,
        "status": mobile_payment.status,
        "amount": str(mobile_payment.amount),
        "provider": mobile_payment.provider,
        "created_at": mobile_payment.created_at.isoformat()
    }

@router.post("/webhook/{provider}")
async def mobile_money_webhook(
    provider: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle mobile money webhook callbacks."""
    try:
        body = await request.json()
        
        # Extract transaction details from webhook
        external_id = body.get("externalId") or body.get("reference")
        status = body.get("status", "unknown")
        
        if not external_id:
            return JSONResponse({"status": "error", "message": "Missing transaction ID"})
        
        # Find mobile payment record
        mobile_payment = db.query(MobilePayment).filter(MobilePayment.external_id == external_id).first()
        if not mobile_payment:
            return JSONResponse({"status": "error", "message": "Transaction not found"})
        
        # Update payment status
        if status.lower() in ["successful", "completed", "success"]:
            mobile_payment.status = "paid"
            mobile_payment.completed_at = datetime.utcnow()
            mobile_payment.provider_status = status
            
            # Mark QR payment as used
            qr_payment = qr_payment_crud.get_qr_payment_by_id(db, mobile_payment.qr_payment_id)
            if qr_payment:
                qr_payment.status = "used"
                qr_payment.used_at = datetime.utcnow()
        else:
            mobile_payment.status = "failed"
            mobile_payment.failed_at = datetime.utcnow()
            mobile_payment.failure_reason = body.get("reason", "Payment failed")
        
        mobile_payment.provider_response = str(body)
        db.commit()
        
        return JSONResponse({"status": "success", "message": "Webhook processed", "months_advance": mobile_payment.months_advance, "is_prepayment": mobile_payment.is_prepayment})
        
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)})

@router.get("/success/{transaction_id}", response_class=HTMLResponse)
async def payment_success(
    transaction_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Display payment success page."""
    mobile_payment = db.query(MobilePayment).filter(MobilePayment.external_id == transaction_id).first()
    if not mobile_payment:
        return HTMLResponse("<h1>Transaction not found</h1>", status_code=404)
    
    return templates.TemplateResponse("payment_success.html", {
        "request": request,
        "mobile_payment": mobile_payment
    })

@router.get("/failed/{transaction_id}", response_class=HTMLResponse)
async def payment_failed(
    transaction_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Display payment failed page."""
    mobile_payment = db.query(MobilePayment).filter(MobilePayment.external_id == transaction_id).first()
    if not mobile_payment:
        return HTMLResponse("<h1>Transaction not found</h1>", status_code=404)
    
    return templates.TemplateResponse("payment_failed.html", {
        "request": request,
        "mobile_payment": mobile_payment
    })
