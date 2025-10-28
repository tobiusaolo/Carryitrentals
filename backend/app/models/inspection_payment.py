from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from ..database import Base

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class InspectionPayment(Base):
    __tablename__ = "inspection_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    inspection_booking_id = Column(Integer, ForeignKey("inspection_bookings.id"), nullable=False)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)  # 60% of inspection fee
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id = Column(String, nullable=True)  # Mobile money transaction ID
    payment_reference = Column(String, nullable=True)  # Reference number from payment provider
    payment_date = Column(DateTime, nullable=True)
    failure_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    inspection_booking = relationship("InspectionBooking", back_populates="payment")
    payment_method = relationship("PaymentMethod", back_populates="inspection_payments")
