from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional
from ..models.enums import PaymentMethod

class MobilePaymentCreate(BaseModel):
    transaction_id: str
    phone_number: str
    amount: Decimal
    currency: str = "UGX"
    provider: PaymentMethod
    status: str = "pending"
    status_message: Optional[str] = None
    payer_id: int
    unit_id: int
    tenant_id: Optional[int] = None
    months_advance: int = 1
    is_prepayment: bool = False

class MobilePaymentResponse(BaseModel):
    id: int
    transaction_id: str
    phone_number: str
    amount: Decimal
    currency: str
    provider: PaymentMethod
    status: str
    status_message: Optional[str]
    payer_id: int
    unit_id: int
    tenant_id: Optional[int]
    months_advance: int
    is_prepayment: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class MobilePaymentUpdate(BaseModel):
    status: Optional[str] = None
    status_message: Optional[str] = None
