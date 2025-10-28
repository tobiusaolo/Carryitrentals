"""
Chart of Accounts Model
Implements accounting account structure for double-entry bookkeeping
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from ...database import Base

class AccountType(str, Enum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    REVENUE = "revenue"
    EXPENSE = "expense"

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False, index=True)  # 1000, 1100, etc.
    name = Column(String, nullable=False)
    type = Column(SQLEnum(AccountType), nullable=False)
    parent_account_id = Column(Integer, ForeignKey("accounts.id"))
    description = Column(String)
    is_active = Column(Boolean, default=True)
    is_system_account = Column(Boolean, default=False)  # Can't be deleted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent_account = relationship("Account", remote_side=[id], back_populates="sub_accounts")
    sub_accounts = relationship("Account", back_populates="parent_account")
    journal_entries = relationship("JournalEntry", back_populates="account")
    expenses = relationship("Expense", back_populates="account")








