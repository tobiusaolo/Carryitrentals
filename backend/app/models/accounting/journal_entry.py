"""
Journal Entry Model
Individual debit/credit entries for double-entry bookkeeping
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from ...database import Base

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("accounting_transactions.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    debit_amount = Column(Numeric(15, 2), default=0)
    credit_amount = Column(Numeric(15, 2), default=0)
    description = Column(String)
    
    # Relationships
    transaction = relationship("AccountingTransaction", back_populates="journal_entries")
    account = relationship("Account", back_populates="journal_entries")
    
    # Constraint: Either debit or credit must be > 0, but not both
    __table_args__ = (
        CheckConstraint(
            '(debit_amount > 0 AND credit_amount = 0) OR (debit_amount = 0 AND credit_amount > 0)',
            name='check_debit_or_credit'
        ),
    )








