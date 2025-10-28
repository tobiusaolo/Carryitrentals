from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Personal Information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    national_id = Column(String, unique=True, nullable=False, index=True)  # NIN number
    
    # Location Information
    previous_address = Column(Text, nullable=False)
    previous_city = Column(String, nullable=False)
    previous_state = Column(String, nullable=False)
    previous_country = Column(String, nullable=False)
    
    # Employment Information
    occupation = Column(String, nullable=False)
    employer_name = Column(String)
    monthly_income = Column(Numeric(10, 2))
    
    # Family Information
    number_of_family_members = Column(Integer, default=1)
    family_details = Column(Text)  # JSON string for additional family info
    
    # Document Information
    national_id_front_image = Column(String)  # File path to front image
    national_id_back_image = Column(String)   # File path to back image
    
    # Rental Information
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    move_in_date = Column(Date, nullable=False)
    move_out_date = Column(Date)
    monthly_rent = Column(Numeric(10, 2), nullable=False)
    deposit_paid = Column(Numeric(10, 2), default=0)
    
    # Status Information
    is_active = Column(Boolean, default=True)
    rent_payment_status = Column(String, default="pending")  # pending, paid, overdue, partial
    last_payment_date = Column(Date)
    next_payment_due = Column(Date)
    
    # Additional Information
    emergency_contact_name = Column(String)
    emergency_contact_phone = Column(String)
    emergency_contact_relationship = Column(String)
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = relationship("Property", back_populates="tenants")
    unit = relationship("Unit", back_populates="tenants")
    payments = relationship("Payment", back_populates="tenant")
    qr_payments = relationship("QRCodePayment", back_populates="tenant")
    mobile_payments = relationship("MobilePayment", back_populates="tenant")
