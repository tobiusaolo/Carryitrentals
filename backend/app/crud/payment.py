from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from ..models.payment import Payment
from ..schemas.payment import PaymentCreate, PaymentUpdate

class PaymentCRUD:
    def create_payment(self, db: Session, payment: PaymentCreate) -> Payment:
        db_payment = Payment(
            unit_id=payment.unit_id,
            tenant_id=payment.tenant_id,
            payer_id=payment.payer_id,
            utility_id=payment.utility_id,
            unit_utility_id=payment.unit_utility_id,
            amount=payment.amount,
            payment_type=payment.payment_type,
            status=payment.status,
            due_date=payment.due_date,
            paid_date=payment.paid_date,
            payment_method=payment.payment_method,
            reference_number=payment.reference_number,
            notes=payment.notes
        )
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment
    
    def get_payment_by_id(self, db: Session, payment_id: int) -> Optional[Payment]:
        return db.query(Payment).filter(Payment.id == payment_id).first()
    
    def get_payments_by_unit(self, db: Session, unit_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
        return db.query(Payment).filter(Payment.unit_id == unit_id).offset(skip).limit(limit).all()
    
    def get_payments_by_tenant(self, db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
        return db.query(Payment).filter(Payment.payer_id == tenant_id).offset(skip).limit(limit).all()
    
    def get_payments_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Payment]:
        if status == "all":
            return db.query(Payment).offset(skip).limit(limit).all()
        return db.query(Payment).filter(Payment.status == status).offset(skip).limit(limit).all()
    
    def get_payments_by_owner(self, db: Session, owner_id: int, skip: int = 0, limit: int = 1000) -> List[Payment]:
        """Get all payments for units in properties owned by a specific owner."""
        from sqlalchemy.orm import joinedload
        from ..models.property import Property
        from ..models.unit import Unit
        
        return db.query(Payment).options(
            joinedload(Payment.unit),
            joinedload(Payment.tenant),
            joinedload(Payment.payer)
        ).join(Unit).join(Property).filter(Property.owner_id == owner_id).offset(skip).limit(limit).all()
    
    def get_overdue_payments(self, db: Session, skip: int = 0, limit: int = 100) -> List[Payment]:
        return db.query(Payment).filter(
            Payment.due_date < date.today(),
            Payment.status.in_(["pending", "partial"])
        ).offset(skip).limit(limit).all()
    
    def get_payments_by_date_range(self, db: Session, start_date: date, end_date: date, skip: int = 0, limit: int = 100) -> List[Payment]:
        return db.query(Payment).filter(
            Payment.due_date >= start_date,
            Payment.due_date <= end_date
        ).offset(skip).limit(limit).all()
    
    def update_payment(self, db: Session, payment_id: int, payment_update: PaymentUpdate) -> Optional[Payment]:
        db_payment = self.get_payment_by_id(db, payment_id)
        if not db_payment:
            return None
        
        update_data = payment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_payment, field, value)
        
        db_payment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_payment)
        return db_payment
    
    def mark_payment_as_paid(self, db: Session, payment_id: int, payment_method: str, reference_number: str = None) -> Optional[Payment]:
        db_payment = self.get_payment_by_id(db, payment_id)
        if not db_payment:
            return None
        
        db_payment.status = "paid"
        db_payment.paid_date = date.today()
        db_payment.payment_method = payment_method
        db_payment.reference_number = reference_number
        db_payment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_payment)
        return db_payment
    
    def delete_payment(self, db: Session, payment_id: int) -> bool:
        db_payment = self.get_payment_by_id(db, payment_id)
        if not db_payment:
            return False
        
        db.delete(db_payment)
        db.commit()
        return True
    
    # Utility payment specific methods
    def get_utility_payments(self, db: Session, utility_id: int = None, unit_utility_id: int = None, skip: int = 0, limit: int = 100) -> List[Payment]:
        """Get payments for specific utilities"""
        from sqlalchemy.orm import joinedload
        
        query = db.query(Payment).options(
            joinedload(Payment.unit),
            joinedload(Payment.tenant),
            joinedload(Payment.payer),
            joinedload(Payment.utility),
            joinedload(Payment.unit_utility)
        ).filter(Payment.payment_type == "utility")
        
        if utility_id:
            query = query.filter(Payment.utility_id == utility_id)
        if unit_utility_id:
            query = query.filter(Payment.unit_utility_id == unit_utility_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_utility_payments_by_property(self, db: Session, property_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
        """Get all utility payments for a property"""
        from sqlalchemy.orm import joinedload
        from ..models.utility import Utility
        from ..models.unit_utility import UnitUtility
        from ..models.unit import Unit
        
        # Get property utilities and unit utilities for this property
        property_utilities = db.query(Utility).filter(Utility.property_id == property_id).all()
        property_unit_utilities = db.query(UnitUtility).join(Unit).filter(Unit.property_id == property_id).all()
        
        utility_ids = [u.id for u in property_utilities]
        unit_utility_ids = [u.id for u in property_unit_utilities]
        
        query = db.query(Payment).options(
            joinedload(Payment.unit),
            joinedload(Payment.tenant),
            joinedload(Payment.payer),
            joinedload(Payment.utility),
            joinedload(Payment.unit_utility)
        ).filter(
            Payment.payment_type == "utility",
            (Payment.utility_id.in_(utility_ids)) | (Payment.unit_utility_id.in_(unit_utility_ids))
        )
        
        return query.offset(skip).limit(limit).all()
    
    def get_utility_payments_by_unit(self, db: Session, unit_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
        """Get all utility payments for a specific unit"""
        from sqlalchemy.orm import joinedload
        from ..models.unit_utility import UnitUtility
        
        # Get unit utilities for this unit
        unit_utilities = db.query(UnitUtility).filter(UnitUtility.unit_id == unit_id).all()
        unit_utility_ids = [u.id for u in unit_utilities]
        
        query = db.query(Payment).options(
            joinedload(Payment.unit),
            joinedload(Payment.tenant),
            joinedload(Payment.payer),
            joinedload(Payment.utility),
            joinedload(Payment.unit_utility)
        ).filter(
            Payment.payment_type == "utility",
            Payment.unit_utility_id.in_(unit_utility_ids)
        )
        
        return query.offset(skip).limit(limit).all()
    
    def get_utility_payments_by_tenant(self, db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
        """Get all utility payments for a specific tenant"""
        from sqlalchemy.orm import joinedload
        
        return db.query(Payment).options(
            joinedload(Payment.unit),
            joinedload(Payment.tenant),
            joinedload(Payment.payer),
            joinedload(Payment.utility),
            joinedload(Payment.unit_utility)
        ).filter(
            Payment.payment_type == "utility",
            Payment.tenant_id == tenant_id
        ).offset(skip).limit(limit).all()

payment_crud = PaymentCRUD()
