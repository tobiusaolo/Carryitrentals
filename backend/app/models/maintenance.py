from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import MaintenanceStatus

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"))
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="medium")  # low, medium, high, urgent
    status = Column(SQLEnum(MaintenanceStatus), default=MaintenanceStatus.PENDING)
    estimated_cost = Column(Numeric(10, 2))
    actual_cost = Column(Numeric(10, 2))
    assigned_to = Column(String)  # Contractor/maintenance person
    scheduled_date = Column(DateTime)
    completed_date = Column(DateTime)
    images = Column(Text)  # JSON string of image paths
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = relationship("Property", back_populates="maintenance_requests")
    unit = relationship("Unit", back_populates="maintenance_requests")
    requester = relationship("User", back_populates="maintenance_requests")
