from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

# Account Schemas
class AccountBase(BaseModel):
    code: str
    name: str
    type: str  # asset, liability, equity, revenue, expense
    parent_account_id: Optional[int] = None
    description: Optional[str] = None
    is_active: bool = True

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class AccountResponse(AccountBase):
    id: int
    is_system_account: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseBase(BaseModel):
    property_id: int
    category: str
    amount: Decimal
    date: date
    vendor: Optional[str] = None
    description: str
    account_id: Optional[int] = None
    is_recurring: bool = False
    recurrence_frequency: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[Decimal] = None
    date: Optional[date] = None
    vendor: Optional[str] = None
    description: Optional[str] = None
    account_id: Optional[int] = None
    is_recurring: Optional[bool] = None
    recurrence_frequency: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: int
    receipt_image: Optional[str]
    transaction_id: Optional[int]
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Transaction Schemas
class AccountingTransactionBase(BaseModel):
    date: date
    description: str
    reference: Optional[str] = None
    notes: Optional[str] = None
    property_id: Optional[int] = None

class AccountingTransactionCreate(AccountingTransactionBase):
    pass

class AccountingTransactionResponse(AccountingTransactionBase):
    id: int
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Journal Entry Schemas
class JournalEntryBase(BaseModel):
    account_id: int
    debit_amount: Decimal = 0
    credit_amount: Decimal = 0
    description: Optional[str] = None

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryResponse(JournalEntryBase):
    id: int
    transaction_id: int
    
    class Config:
        from_attributes = True

# Financial Report Request
class FinancialReportRequest(BaseModel):
    property_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    as_of_date: Optional[date] = None








