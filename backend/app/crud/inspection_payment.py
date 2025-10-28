from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.inspection_payment import InspectionPayment, PaymentStatus
from ..schemas.inspection_payment import InspectionPaymentCreate, InspectionPaymentUpdate

def create_inspection_payment(db: Session, payment: InspectionPaymentCreate) -> InspectionPayment:
    """Create a new inspection payment."""
    db_payment = InspectionPayment(**payment.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_inspection_payment(db: Session, payment_id: int) -> Optional[InspectionPayment]:
    """Get inspection payment by ID."""
    return db.query(InspectionPayment).filter(InspectionPayment.id == payment_id).first()

def get_inspection_payment_by_booking(db: Session, booking_id: int) -> Optional[InspectionPayment]:
    """Get inspection payment by booking ID."""
    return db.query(InspectionPayment).filter(InspectionPayment.inspection_booking_id == booking_id).first()

def get_inspection_payments(db: Session, skip: int = 0, limit: int = 100) -> List[InspectionPayment]:
    """Get all inspection payments."""
    return db.query(InspectionPayment).offset(skip).limit(limit).all()

def update_inspection_payment(db: Session, payment_id: int, payment_update: InspectionPaymentUpdate) -> Optional[InspectionPayment]:
    """Update inspection payment."""
    db_payment = db.query(InspectionPayment).filter(InspectionPayment.id == payment_id).first()
    if db_payment:
        update_data = payment_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_payment, field, value)
        db.commit()
        db.refresh(db_payment)
    return db_payment

def mark_payment_as_paid(db: Session, payment_id: int, transaction_id: str, payment_reference: str = None) -> Optional[InspectionPayment]:
    """Mark payment as paid."""
    db_payment = db.query(InspectionPayment).filter(InspectionPayment.id == payment_id).first()
    if db_payment:
        db_payment.status = PaymentStatus.PAID
        db_payment.transaction_id = transaction_id
        db_payment.payment_reference = payment_reference
        db_payment.payment_date = datetime.utcnow()
        db.commit()
        db.refresh(db_payment)
    return db_payment

def mark_payment_as_failed(db: Session, payment_id: int, failure_reason: str) -> Optional[InspectionPayment]:
    """Mark payment as failed."""
    db_payment = db.query(InspectionPayment).filter(InspectionPayment.id == payment_id).first()
    if db_payment:
        db_payment.status = PaymentStatus.FAILED
        db_payment.failure_reason = failure_reason
        db.commit()
        db.refresh(db_payment)
    return db_payment
