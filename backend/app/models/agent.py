from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
from ..database import Base

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    age = Column(Integer)
    location = Column(String, nullable=False)
    nin_number = Column(String, unique=True, nullable=False)  # National ID Number
    specialization = Column(String)  # Optional specialization
    notes = Column(Text)  # Optional notes
    is_active = Column(Boolean, default=True)
    
    # Photo fields - store as base64 or file paths
    profile_picture = Column(Text)  # Base64 encoded image or file path
    nin_front_image = Column(Text)  # Base64 encoded image or file path
    nin_back_image = Column(Text)   # Base64 encoded image or file path
    
    # Performance tracking
    assigned_units_count = Column(Integer, default=0)  # Renamed to avoid conflict with relationship
    completed_inspections = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    units = relationship("Unit", back_populates="agent")  # Renamed from assigned_units
    rental_units = relationship("RentalUnit", back_populates="agent")
    # inspections = relationship("InspectionBooking", back_populates="agent", cascade="all, delete-orphan")
    
    @hybrid_property
    def assigned_units(self):
        """Compute assigned_units from the actual units relationship"""
        return len(self.units) if self.units else self.assigned_units_count
