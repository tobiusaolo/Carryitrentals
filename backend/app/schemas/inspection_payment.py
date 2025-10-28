from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ..models.inspection_payment import PaymentStatus

class InspectionPaymentBase(BaseModel):
    inspection_booking_id: int
    payment_method_id: int
    amount: Decimal
    currency: str = "USD"
    status: PaymentStatus = PaymentStatus.PENDING

class InspectionPaymentCreate(InspectionPaymentBase):
    pass

class InspectionPaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    transaction_id: Optional[str] = None
    payment_reference: Optional[str] = None
    payment_date: Optional[datetime] = None
    failure_reason: Optional[str] = None

class InspectionPaymentResponse(InspectionPaymentBase):
    id: int
    transaction_id: Optional[str] = None
    payment_reference: Optional[str] = None
    payment_date: Optional[datetime] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    payment_method_name: Optional[str] = None
    
    class Config:
        from_attributes = True
