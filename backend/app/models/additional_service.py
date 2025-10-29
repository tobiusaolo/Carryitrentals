from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

# Junction table for many-to-many relationship between inspection bookings and services
inspection_booking_services = Table(
    'inspection_booking_services',
    Base.metadata,
    Column('inspection_booking_id', Integer, ForeignKey('inspection_bookings.id', ondelete='CASCADE'), primary_key=True),
    Column('additional_service_id', Integer, ForeignKey('additional_services.id', ondelete='CASCADE'), primary_key=True),
    Column('created_at', DateTime, default=datetime.utcnow)
)

class AdditionalService(Base):
    __tablename__ = "additional_services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  # e.g., "Moving", "Packaging", "Cleaning"
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    inspection_bookings = relationship(
        "InspectionBooking",
        secondary=inspection_booking_services,
        back_populates="additional_services"
    )

