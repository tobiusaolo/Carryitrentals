from pydantic import BaseModel, validator
from typing import Optional, List, Any
from datetime import datetime, date
from decimal import Decimal
from ..models import InspectionStatus

# Inspection Booking Schemas
class InspectionBookingBase(BaseModel):
    booking_date: datetime
    preferred_time_slot: Optional[str] = None  # morning, afternoon, evening
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    message: Optional[str] = None
    status: InspectionStatus = InspectionStatus.PENDING
    notes: Optional[str] = None

class InspectionBookingCreate(InspectionBookingBase):
    unit_id: int
    tenant_id: int
    owner_id: int

class InspectionBookingUpdate(BaseModel):
    booking_date: Optional[datetime] = None
    preferred_time_slot: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    message: Optional[str] = None
    status: Optional[InspectionStatus] = None
    notes: Optional[str] = None

class InspectionBookingResponse(InspectionBookingBase):
    id: int
    unit_id: int
    tenant_id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InspectionBookingWithDetails(InspectionBookingResponse):
    unit: Any
    tenant: Any
    owner: Any

# Public Inspection Booking (no login required)
class PublicInspectionBookingCreate(BaseModel):
    rental_unit_id: int
    contact_name: str
    contact_phone: str
    contact_email: Optional[str] = None
    booking_date: datetime
    preferred_time_slot: Optional[str] = None  # morning, afternoon, evening
    message: Optional[str] = None
    additional_service_ids: Optional[List[int]] = []  # IDs of selected additional services
    
    @validator('contact_phone')
    def validate_phone(cls, v):
        if not v or len(v) < 10:
            raise ValueError('Valid phone number is required')
        return v
    
    @validator('contact_name')
    def validate_name(cls, v):
        if not v or len(v) < 2:
            raise ValueError('Valid name is required')
        return v

# Additional Service Response Schema (embedded)
class AdditionalServiceInfo(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    is_active: bool
    
    class Config:
        from_attributes = True

class PublicInspectionBookingResponse(BaseModel):
    id: int
    rental_unit_id: int
    contact_name: str
    contact_phone: str
    contact_email: Optional[str] = None
    booking_date: datetime
    preferred_time_slot: Optional[str] = None
    message: Optional[str] = None
    status: InspectionStatus
    created_at: datetime
    additional_services: List[AdditionalServiceInfo] = []  # List of selected additional services
    
    class Config:
        from_attributes = True








