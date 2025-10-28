from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from ..database import Base

class PaymentMethodType(str, Enum):
    MTN_MOBILE_MONEY = "mtn_mobile_money"
    AIRTEL_MONEY = "airtel_money"
    BANK_ACCOUNT = "bank_account"

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "MTN Mobile Money", "Airtel Money", "Bank Account"
    type = Column(SQLEnum(PaymentMethodType), nullable=False)
    account_number = Column(String, nullable=False)  # Phone number or bank account number
    account_name = Column(String, nullable=False)  # Account holder name
    bank_name = Column(String, nullable=True)  # For bank accounts only
    bank_code = Column(String, nullable=True)  # For bank accounts only
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    inspection_payments = relationship("InspectionPayment", back_populates="payment_method")
