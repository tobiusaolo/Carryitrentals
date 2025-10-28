from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import Currency

class Airbnb(Base):
    __tablename__ = "airbnbs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    location = Column(String, nullable=False)
    price_per_night = Column(Numeric(10, 2), nullable=False)
    currency = Column(SQLEnum(Currency), default=Currency.USD, nullable=False)
    max_guests = Column(Integer, nullable=False, default=2)
    bedrooms = Column(Integer, nullable=False, default=1)
    bathrooms = Column(Integer, nullable=False, default=1)
    amenities = Column(Text)  # JSON string of amenities
    house_rules = Column(Text)  # House rules
    images = Column(Text)  # Base64 images separated by |||IMAGE_SEPARATOR|||
    is_available = Column(SQLEnum('available', 'booked', 'unavailable', name='airbnb_status'), default='available')
    
    # Owner information
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="airbnbs")
    bookings = relationship("AirbnbBooking", back_populates="airbnb", cascade="all, delete-orphan")

