from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.payment_method import PaymentMethodType

class PaymentMethodBase(BaseModel):
    name: str
    type: PaymentMethodType
    account_number: str
    account_name: str
    bank_name: Optional[str] = None
    bank_code: Optional[str] = None
    is_active: bool = True

class PaymentMethodCreate(PaymentMethodBase):
    pass

class PaymentMethodUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[PaymentMethodType] = None
    account_number: Optional[str] = None
    account_name: Optional[str] = None
    bank_name: Optional[str] = None
    bank_code: Optional[str] = None
    is_active: Optional[bool] = None

class PaymentMethodResponse(PaymentMethodBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
