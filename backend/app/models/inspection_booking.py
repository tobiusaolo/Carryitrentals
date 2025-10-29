from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import InspectionStatus

class InspectionBooking(Base):
    __tablename__ = "inspection_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)  # For regular units
    rental_unit_id = Column(Integer, ForeignKey("rental_units.id"), nullable=True)  # For rental units
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Now nullable for public bookings
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Optional for rental units
    contact_name = Column(String)  # For public bookings without login
    booking_date = Column(DateTime, nullable=False)
    preferred_time_slot = Column(String)  # morning, afternoon, evening
    contact_phone = Column(String)
    contact_email = Column(String)
    message = Column(Text)
    status = Column(SQLEnum(InspectionStatus), default=InspectionStatus.PENDING)
    notes = Column(Text)  # Owner's notes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    unit = relationship("Unit", back_populates="inspection_bookings")
    rental_unit = relationship("RentalUnit", back_populates="inspection_bookings")
    tenant = relationship("User", foreign_keys=[tenant_id], back_populates="tenant_inspections")
    owner = relationship("User", foreign_keys=[owner_id], back_populates="owner_inspections")
    payment = relationship("InspectionPayment", back_populates="inspection_booking", uselist=False)
    additional_services = relationship(
        "AdditionalService",
        secondary="inspection_booking_services",
        back_populates="inspection_bookings"
    )



