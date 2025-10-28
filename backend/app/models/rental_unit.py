from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import UnitStatus, UnitType, Currency

class RentalUnit(Base):
    __tablename__ = "rental_units"
    
    id = Column(Integer, primary_key=True, index=True)
    # No unit_number or property_id for standalone rental units
    unit_type = Column(SQLEnum(UnitType), nullable=False)
    floor = Column(Integer)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    square_feet = Column(Numeric(10, 2))
    monthly_rent = Column(Numeric(10, 2), nullable=False)
    deposit_amount = Column(Numeric(10, 2), default=0)
    inspection_fee = Column(Numeric(10, 2), nullable=False, default=0)
    currency = Column(SQLEnum(Currency), default=Currency.USD, nullable=False)
    status = Column(SQLEnum(UnitStatus), default=UnitStatus.AVAILABLE)
    description = Column(Text)
    amenities = Column(Text)  # JSON string of amenities
    images = Column(Text)  # JSON string of image paths
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)  # Assigned agent
    location = Column(String, nullable=False)  # Location/address for rental unit
    title = Column(String, nullable=False)  # Title/name for the rental unit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agent = relationship("Agent", back_populates="rental_units")
    inspection_bookings = relationship("InspectionBooking", back_populates="rental_unit", cascade="all, delete-orphan")
    # No property relationship since these are standalone units
