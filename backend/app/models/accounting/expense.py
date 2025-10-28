"""
Expense Model
Track all property-related expenses
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Numeric, Date, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from ...database import Base

class ExpenseCategory(str, Enum):
    MAINTENANCE = "maintenance"
    UTILITIES = "utilities"
    PROPERTY_TAX = "property_tax"
    INSURANCE = "insurance"
    MANAGEMENT_FEES = "management_fees"
    REPAIRS = "repairs"
    CLEANING = "cleaning"
    LANDSCAPING = "landscaping"
    SECURITY = "security"
    LEGAL_FEES = "legal_fees"
    ADVERTISING = "advertising"
    SUPPLIES = "supplies"
    OTHER = "other"

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    category = Column(SQLEnum(ExpenseCategory), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(Date, nullable=False, index=True)
    vendor = Column(String)
    description = Column(Text, nullable=False)
    receipt_image = Column(String)  # File path to receipt
    account_id = Column(Integer, ForeignKey("accounts.id"))
    transaction_id = Column(Integer, ForeignKey("accounting_transactions.id"))
    is_recurring = Column(Boolean, default=False)
    recurrence_frequency = Column(String)  # monthly, quarterly, annually
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = relationship("Property")
    account = relationship("Account", back_populates="expenses")
    transaction = relationship("AccountingTransaction")
    created_by = relationship("User")

