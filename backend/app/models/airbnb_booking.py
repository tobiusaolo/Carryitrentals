from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Date, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import PaymentStatus, PaymentMethod

class AirbnbBooking(Base):
    __tablename__ = "airbnb_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    airbnb_id = Column(Integer, ForeignKey("airbnbs.id"), nullable=False)
    
    # Guest Information
    guest_name = Column(String, nullable=False)
    guest_email = Column(String, nullable=False)
    guest_phone = Column(String, nullable=False)
    guest_username = Column(String)  # Username or ID
    guest_date_of_birth = Column(Date)  # Date of birth
    
    # Booking Dates
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    number_of_guests = Column(Integer, nullable=False)
    number_of_nights = Column(Integer, nullable=False)  # Calculated: check_out - check_in
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default='UGX')
    status = Column(String, default='pending')  # pending, confirmed, cancelled, completed
    special_requests = Column(Text)
    
    # Payment Information (following internal standard)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_timing = Column(String, default='pay_now')  # pay_now or pay_later
    payment_method = Column(String)  # visa_card, mtn_mobile_money, airtel_money
    payment_method_type = Column(String)  # 'card' or 'mobile_money'
    prepayment_required = Column(Boolean, default=True)  # Airbnb requires prepayment
    prepayment_percentage = Column(Numeric(5, 2), default=50.00)  # Default 50% prepayment
    prepayment_amount = Column(Numeric(10, 2))  # Amount paid as prepayment
    remaining_amount = Column(Numeric(10, 2))  # Amount remaining after prepayment
    payment_reference = Column(String)  # Transaction reference
    payment_date = Column(DateTime)  # When prepayment was made
    
    # Card Payment Details (if payment_method_type = 'card')
    card_last_four = Column(String(4))  # Last 4 digits of card
    card_brand = Column(String)  # Visa, Mastercard, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    airbnb = relationship("Airbnb", back_populates="bookings")

