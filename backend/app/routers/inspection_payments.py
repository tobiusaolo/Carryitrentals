from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
import qrcode
import io
import base64
import os
from datetime import datetime

from ..database import get_db
from ..auth import require_roles, get_current_active_user
from ..schemas.inspection_payment import InspectionPaymentCreate, InspectionPaymentResponse, InspectionPaymentUpdate
from ..crud.inspection_payment import (
    create_inspection_payment, get_inspection_payment, get_inspection_payment_by_booking,
    get_inspection_payments, update_inspection_payment, mark_payment_as_paid, mark_payment_as_failed
)
from ..crud.payment_method import get_active_payment_methods
from ..models.user import User

router = APIRouter(prefix="/inspection-payments", tags=["Inspection Payments"])

@router.post("/", response_model=InspectionPaymentResponse)
async def create_inspection_payment_endpoint(
    payment: InspectionPaymentCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new inspection payment."""
    return create_inspection_payment(db, payment)

@router.get("/", response_model=List[InspectionPaymentResponse])
async def get_inspection_payments_endpoint(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get all inspection payments (Admin only)."""
    return get_inspection_payments(db, skip=skip, limit=limit)

@router.get("/{payment_id}", response_model=InspectionPaymentResponse)
async def get_inspection_payment_endpoint(
    payment_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get inspection payment by ID (Admin only)."""
    payment = get_inspection_payment(db, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection payment not found"
        )
    return payment

@router.put("/{payment_id}", response_model=InspectionPaymentResponse)
async def update_inspection_payment_endpoint(
    payment_id: int,
    payment_update: InspectionPaymentUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Update inspection payment (Admin only)."""
    payment = update_inspection_payment(db, payment_id, payment_update)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection payment not found"
        )
    return payment

@router.post("/{payment_id}/mark-paid")
async def mark_payment_paid_endpoint(
    payment_id: int,
    transaction_data: Dict[str, str],
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Mark payment as paid (Admin only)."""
    transaction_id = transaction_data.get("transaction_id")
    payment_reference = transaction_data.get("payment_reference")
    
    if not transaction_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction ID is required"
        )
    
    payment = mark_payment_as_paid(db, payment_id, transaction_id, payment_reference)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection payment not found"
        )
    return {"message": "Payment marked as paid successfully"}

@router.post("/{payment_id}/mark-failed")
async def mark_payment_failed_endpoint(
    payment_id: int,
    failure_data: Dict[str, str],
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Mark payment as failed (Admin only)."""
    failure_reason = failure_data.get("failure_reason", "Payment failed")
    
    payment = mark_payment_as_failed(db, payment_id, failure_reason)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection payment not found"
        )
    return {"message": "Payment marked as failed successfully"}

@router.get("/booking/{booking_id}/payment", response_model=InspectionPaymentResponse)
async def get_payment_by_booking_endpoint(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get payment by inspection booking ID."""
    payment = get_inspection_payment_by_booking(db, booking_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No payment found for this inspection booking"
        )
    return payment

@router.post("/booking/{booking_id}/generate-qr")
async def generate_payment_qr_endpoint(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate payment QR code for inspection booking."""
    # Get the payment for this booking
    payment = get_inspection_payment_by_booking(db, booking_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No payment found for this inspection booking"
        )
    
    # Get active payment methods
    payment_methods = get_active_payment_methods(db)
    if not payment_methods:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active payment methods configured"
        )
    
    # Create payment URL - use frontend URL from environment
    frontend_url = "https://carryit-frontend.onrender.com"
    payment_url = f"{frontend_url}/inspection-payment/{payment.id}"
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(payment_url)
    qr.make(fit=True)
    
    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return {
        "payment_id": payment.id,
        "amount": float(payment.amount),
        "currency": payment.currency,
        "payment_url": payment_url,
        "qr_code": f"data:image/png;base64,{qr_code_base64}",
        "payment_methods": [
            {
                "id": pm.id,
                "name": pm.name,
                "type": pm.type,
                "account_number": pm.account_number,
                "account_name": pm.account_name,
                "bank_name": pm.bank_name
            } for pm in payment_methods
        ]
    }
