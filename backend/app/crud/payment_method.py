from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.payment_method import PaymentMethod
from ..schemas.payment_method import PaymentMethodCreate, PaymentMethodUpdate

def create_payment_method(db: Session, payment_method: PaymentMethodCreate) -> PaymentMethod:
    """Create a new payment method."""
    db_payment_method = PaymentMethod(**payment_method.model_dump())
    db.add(db_payment_method)
    db.commit()
    db.refresh(db_payment_method)
    return db_payment_method

def get_payment_method(db: Session, payment_method_id: int) -> Optional[PaymentMethod]:
    """Get payment method by ID."""
    return db.query(PaymentMethod).filter(PaymentMethod.id == payment_method_id).first()

def get_payment_methods(db: Session, skip: int = 0, limit: int = 100) -> List[PaymentMethod]:
    """Get all payment methods."""
    return db.query(PaymentMethod).offset(skip).limit(limit).all()

def get_active_payment_methods(db: Session) -> List[PaymentMethod]:
    """Get all active payment methods."""
    return db.query(PaymentMethod).filter(PaymentMethod.is_active == True).all()

def update_payment_method(db: Session, payment_method_id: int, payment_method_update: PaymentMethodUpdate) -> Optional[PaymentMethod]:
    """Update payment method."""
    db_payment_method = db.query(PaymentMethod).filter(PaymentMethod.id == payment_method_id).first()
    if db_payment_method:
        update_data = payment_method_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_payment_method, field, value)
        db.commit()
        db.refresh(db_payment_method)
    return db_payment_method

def delete_payment_method(db: Session, payment_method_id: int) -> bool:
    """Delete a payment method."""
    db_payment_method = db.query(PaymentMethod).filter(PaymentMethod.id == payment_method_id).first()
    if db_payment_method:
        db.delete(db_payment_method)
        db.commit()
        return True
    return False
