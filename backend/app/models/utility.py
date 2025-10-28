from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from .enums import UtilityType

class Utility(Base):
    __tablename__ = "utilities"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    utility_type = Column(SQLEnum(UtilityType), nullable=False)
    provider_name = Column(String, nullable=False)
    account_number = Column(String)
    monthly_cost = Column(Numeric(10, 2), default=0)
    is_included_in_rent = Column(Boolean, default=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = relationship("Property", back_populates="utilities")
    payments = relationship("Payment", back_populates="utility")
