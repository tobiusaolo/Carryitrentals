from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import PaymentMethod, PaymentStatus

class MobilePayment(Base):
    __tablename__ = "mobile_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    qr_payment_id = Column(Integer, ForeignKey("qr_code_payments.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Payment details
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="UGX")
    provider = Column(SQLEnum(PaymentMethod), nullable=False)  # mtn_mobile_money or airtel_money
    
    # Transaction details
    external_id = Column(String, unique=True, nullable=False)  # Unique transaction ID
    transaction_id = Column(String)  # Provider's transaction ID
    payer_phone_number = Column(String, nullable=False)
    payee_phone_number = Column(String, nullable=False)  # Property owner's number
    
    # Status tracking
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    provider_status = Column(String)  # Status from mobile money provider
    failure_reason = Column(Text)
    
    # Timestamps
    initiated_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    failed_at = Column(DateTime)
    
    # Provider response data
    provider_response = Column(Text)  # JSON string of provider response
    callback_data = Column(Text)     # JSON string of callback data
    
    # Additional info
    reference = Column(String)       # Payment reference
    description = Column(Text)       # Payment description
    months_advance = Column(Integer, default=1)  # Number of months paid (>=1)
    is_prepayment = Column(Boolean, default=False)  # Paid before due date
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    qr_payment = relationship("QRCodePayment", back_populates="mobile_payments")
    unit = relationship("Unit", back_populates="mobile_payments")
    tenant = relationship("Tenant", back_populates="mobile_payments")
    payer = relationship("User", back_populates="mobile_payments")
