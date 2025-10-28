from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ..models.enums import QRCodeStatus, PaymentMethod

class QRCodePaymentCreate(BaseModel):
    unit_id: int
    tenant_id: Optional[int] = None
    payer_id: int
    amount: Decimal = Field(..., gt=0, description="Payment amount")
    account_number: str = Field(..., min_length=1, description="Account number for payment")
    mobile_money_provider: PaymentMethod
    expires_in_days: int = Field(default=7, ge=1, le=30, description="Days until QR code expires")

class QRCodePaymentResponse(BaseModel):
    id: int
    unit_id: int
    tenant_id: Optional[int]
    payer_id: int
    amount: Decimal
    account_number: str
    mobile_money_provider: PaymentMethod
    qr_code_data: str
    qr_code_image_path: Optional[str]
    qr_image: Optional[str] = None  # Base64 encoded QR image
    status: QRCodeStatus
    expires_at: datetime
    used_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class QRCodePaymentUpdate(BaseModel):
    status: Optional[QRCodeStatus] = None
    used_at: Optional[datetime] = None

class QRCodePaymentWithDetails(QRCodePaymentResponse):
    unit_number: Optional[str] = None
    property_name: Optional[str] = None
    tenant_name: Optional[str] = None
    payer_name: Optional[str] = None

class QRCodeGenerateRequest(BaseModel):
    unit_id: int
    tenant_id: Optional[int] = None
    amount: Decimal = Field(..., gt=0, description="Payment amount")
    account_number: str = Field(..., min_length=1, description="Account number for payment")
    mobile_money_provider: PaymentMethod
    expires_in_days: int = Field(default=7, ge=1, le=30, description="Days until QR code expires")
