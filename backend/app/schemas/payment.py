from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime, date
from decimal import Decimal
from ..models import PaymentStatus, PaymentType

# Payment Schemas
class PaymentBase(BaseModel):
    amount: Decimal
    payment_type: PaymentType
    status: PaymentStatus = PaymentStatus.PENDING
    due_date: date
    paid_date: Optional[date] = None
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    unit_id: int
    payer_id: int
    tenant_id: Optional[int] = None
    utility_id: Optional[int] = None
    unit_utility_id: Optional[int] = None

class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    payment_type: Optional[PaymentType] = None
    status: Optional[PaymentStatus] = None
    due_date: Optional[date] = None
    paid_date: Optional[date] = None
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    utility_id: Optional[int] = None
    unit_utility_id: Optional[int] = None

class PaymentResponse(PaymentBase):
    id: int
    unit_id: int
    tenant_id: Optional[int]
    payer_id: int
    utility_id: Optional[int]
    unit_utility_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PaymentWithDetails(PaymentResponse):
    unit_number: Optional[str] = None
    property_name: Optional[str] = None
    payer_name: Optional[str] = None
    tenant_name: Optional[str] = None
    
    class Config:
        from_attributes = True
