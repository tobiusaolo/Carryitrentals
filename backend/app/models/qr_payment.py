from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from ..database import Base
from .enums import QRCodeStatus, PaymentMethod

class QRCodePayment(Base):
    __tablename__ = "qr_code_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    account_number = Column(String, nullable=False)  # Account number for payment
    mobile_money_provider = Column(SQLEnum(PaymentMethod))  # MTN or Airtel
    qr_code_data = Column(Text, nullable=False)  # QR code content
    qr_code_image_path = Column(String)  # Path to QR code image
    status = Column(SQLEnum(QRCodeStatus), default=QRCodeStatus.ACTIVE)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))
    used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    unit = relationship("Unit", back_populates="qr_payments")
    tenant = relationship("Tenant", back_populates="qr_payments")
    payer = relationship("User", back_populates="qr_payments")
    mobile_payments = relationship("MobilePayment", back_populates="qr_payment", cascade="all, delete-orphan")
