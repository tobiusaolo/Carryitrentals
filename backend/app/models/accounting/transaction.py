"""
Accounting Transaction Model
Main transaction header for all accounting entries
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from ...database import Base

class AccountingTransaction(Base):
    __tablename__ = "accounting_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    description = Column(String, nullable=False)
    reference = Column(String)  # Invoice number, receipt number, etc.
    notes = Column(Text)
    property_id = Column(Integer, ForeignKey("properties.id"))
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = relationship("Property")
    created_by = relationship("User")
    journal_entries = relationship("JournalEntry", back_populates="transaction", cascade="all, delete-orphan")








