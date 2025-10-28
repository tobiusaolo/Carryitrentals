from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import PaymentStatus, PaymentType

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    utility_id = Column(Integer, ForeignKey("utilities.id"))  # Link to property utility
    unit_utility_id = Column(Integer, ForeignKey("unit_utilities.id"))  # Link to unit utility
    amount = Column(Numeric(10, 2), nullable=False)
    payment_type = Column(SQLEnum(PaymentType), nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    due_date = Column(Date, nullable=False)
    paid_date = Column(Date)
    payment_method = Column(String)  # cash, check, bank_transfer, online
    reference_number = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    unit = relationship("Unit", back_populates="payments")
    tenant = relationship("Tenant", back_populates="payments")
    payer = relationship("User", back_populates="payments")
    utility = relationship("Utility", back_populates="payments")
    unit_utility = relationship("UnitUtility", back_populates="payments")
