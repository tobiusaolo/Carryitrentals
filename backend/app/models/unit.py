from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import UnitStatus, UnitType, Currency

class Unit(Base):
    __tablename__ = "units"
    
    id = Column(Integer, primary_key=True, index=True)
    unit_number = Column(String, nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    unit_type = Column(SQLEnum(UnitType), nullable=False)
    floor = Column(Integer)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    square_feet = Column(Numeric(10, 2))
    monthly_rent = Column(Numeric(10, 2), nullable=False)
    deposit_amount = Column(Numeric(10, 2), default=0)
    currency = Column(SQLEnum(Currency), default=Currency.USD, nullable=False)
    status = Column(SQLEnum(UnitStatus), default=UnitStatus.AVAILABLE)
    description = Column(Text)
    amenities = Column(Text)  # JSON string of amenities
    images = Column(Text)  # JSON string of image paths
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)  # For rental units
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = relationship("Property", back_populates="units")
    tenants = relationship("Tenant", back_populates="unit", cascade="all, delete-orphan")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="unit")
    payments = relationship("Payment", back_populates="unit")
    qr_payments = relationship("QRCodePayment", back_populates="unit")
    mobile_payments = relationship("MobilePayment", back_populates="unit")
    utilities = relationship("UnitUtility", back_populates="unit", cascade="all, delete-orphan")
    inspection_bookings = relationship("InspectionBooking", back_populates="unit", cascade="all, delete-orphan")
    agent = relationship("Agent", back_populates="units")
