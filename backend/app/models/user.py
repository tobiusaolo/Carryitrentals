from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import UserRole

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.TENANT)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - using string references to avoid circular imports
    properties = relationship("Property", back_populates="owner", lazy="select")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="requester", lazy="select")
    payments = relationship("Payment", back_populates="payer", lazy="select")
    qr_payments = relationship("QRCodePayment", back_populates="payer", lazy="select")
    mobile_payments = relationship("MobilePayment", back_populates="payer", lazy="select")
    tenant_inspections = relationship("InspectionBooking", foreign_keys="InspectionBooking.tenant_id", back_populates="tenant", lazy="select")
    owner_inspections = relationship("InspectionBooking", foreign_keys="InspectionBooking.owner_id", back_populates="owner", lazy="select")
    airbnbs = relationship("Airbnb", back_populates="owner", lazy="select")
