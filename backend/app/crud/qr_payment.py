from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.qr_payment import QRCodePayment
from ..models.enums import QRCodeStatus
from ..schemas.qr_payment import QRCodePaymentCreate, QRCodePaymentUpdate

class QRCodePaymentCRUD:
    def create_qr_payment(self, db: Session, qr_payment: QRCodePaymentCreate, qr_code_data: str, qr_code_image_path: Optional[str] = None) -> QRCodePayment:
        """Create a new QR code payment."""
        db_qr_payment = QRCodePayment(
            unit_id=qr_payment.unit_id,
            tenant_id=qr_payment.tenant_id,
            payer_id=qr_payment.payer_id,
            amount=qr_payment.amount,
            account_number=qr_payment.account_number,
            mobile_money_provider=qr_payment.mobile_money_provider,
            qr_code_data=qr_code_data,
            qr_code_image_path=qr_code_image_path,
            expires_at=datetime.utcnow() + timedelta(days=qr_payment.expires_in_days)
        )
        db.add(db_qr_payment)
        db.commit()
        db.refresh(db_qr_payment)
        return db_qr_payment

    def get_qr_payment_by_id(self, db: Session, qr_payment_id: int) -> Optional[QRCodePayment]:
        """Get QR code payment by ID."""
        return db.query(QRCodePayment).filter(QRCodePayment.id == qr_payment_id).first()

    def get_qr_payments_by_unit(self, db: Session, unit_id: int, skip: int = 0, limit: int = 100) -> List[QRCodePayment]:
        """Get QR code payments by unit."""
        return db.query(QRCodePayment).filter(QRCodePayment.unit_id == unit_id).offset(skip).limit(limit).all()

    def get_qr_payments_by_tenant(self, db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[QRCodePayment]:
        """Get QR code payments by tenant."""
        return db.query(QRCodePayment).filter(QRCodePayment.tenant_id == tenant_id).offset(skip).limit(limit).all()

    def get_qr_payments_by_payer(self, db: Session, payer_id: int, skip: int = 0, limit: int = 100) -> List[QRCodePayment]:
        """Get QR code payments by payer."""
        return db.query(QRCodePayment).filter(QRCodePayment.payer_id == payer_id).offset(skip).limit(limit).all()

    def get_active_qr_payments(self, db: Session, skip: int = 0, limit: int = 100) -> List[QRCodePayment]:
        """Get active QR code payments."""
        return db.query(QRCodePayment).filter(
            and_(
                QRCodePayment.status == QRCodeStatus.ACTIVE,
                QRCodePayment.expires_at > datetime.utcnow()
            )
        ).offset(skip).limit(limit).all()

    def get_expired_qr_payments(self, db: Session, skip: int = 0, limit: int = 100) -> List[QRCodePayment]:
        """Get expired QR code payments."""
        return db.query(QRCodePayment).filter(
            or_(
                QRCodePayment.status == QRCodeStatus.EXPIRED,
                and_(
                    QRCodePayment.status == QRCodeStatus.ACTIVE,
                    QRCodePayment.expires_at <= datetime.utcnow()
                )
            )
        ).offset(skip).limit(limit).all()

    def update_qr_payment(self, db: Session, qr_payment_id: int, qr_payment_update: QRCodePaymentUpdate) -> Optional[QRCodePayment]:
        """Update QR code payment."""
        db_qr_payment = self.get_qr_payment_by_id(db, qr_payment_id)
        if not db_qr_payment:
            return None
        
        update_data = qr_payment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_qr_payment, field, value)
        
        db.commit()
        db.refresh(db_qr_payment)
        return db_qr_payment

    def mark_qr_payment_as_used(self, db: Session, qr_payment_id: int) -> Optional[QRCodePayment]:
        """Mark QR code payment as used."""
        db_qr_payment = self.get_qr_payment_by_id(db, qr_payment_id)
        if not db_qr_payment:
            return None
        
        db_qr_payment.status = QRCodeStatus.USED
        db_qr_payment.used_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_qr_payment)
        return db_qr_payment

    def mark_qr_payment_as_expired(self, db: Session, qr_payment_id: int) -> Optional[QRCodePayment]:
        """Mark QR code payment as expired."""
        db_qr_payment = self.get_qr_payment_by_id(db, qr_payment_id)
        if not db_qr_payment:
            return None
        
        db_qr_payment.status = QRCodeStatus.EXPIRED
        
        db.commit()
        db.refresh(db_qr_payment)
        return db_qr_payment

    def delete_qr_payment(self, db: Session, qr_payment_id: int) -> bool:
        """Delete QR code payment."""
        db_qr_payment = self.get_qr_payment_by_id(db, qr_payment_id)
        if not db_qr_payment:
            return False
        
        db.delete(db_qr_payment)
        db.commit()
        return True

    def cleanup_expired_qr_payments(self, db: Session) -> int:
        """Clean up expired QR code payments."""
        expired_payments = db.query(QRCodePayment).filter(
            and_(
                QRCodePayment.status == QRCodeStatus.ACTIVE,
                QRCodePayment.expires_at <= datetime.utcnow()
            )
        ).all()
        
        for payment in expired_payments:
            payment.status = QRCodeStatus.EXPIRED
        
        db.commit()
        return len(expired_payments)

qr_payment_crud = QRCodePaymentCRUD()
