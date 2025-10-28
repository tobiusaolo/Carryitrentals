from pydantic import BaseModel, validator, EmailStr
from typing import Optional, List, Any
from datetime import datetime, date
from decimal import Decimal

# Tenant Schemas
class TenantBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: str
    age: int
    national_id: str  # NIN number
    
    # Location Information
    previous_address: str
    previous_city: str
    previous_state: str
    previous_country: str
    
    # Employment Information
    occupation: str
    employer_name: Optional[str] = None
    monthly_income: Optional[Decimal] = None
    
    # Family Information
    number_of_family_members: int = 1
    family_details: Optional[str] = None
    
    # Rental Information
    property_id: int
    unit_id: int
    move_in_date: date
    monthly_rent: Decimal
    deposit_paid: Optional[Decimal] = 0
    
    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    
    # Additional Information
    notes: Optional[str] = None

class TenantCreate(TenantBase):
    @validator('age')
    def validate_age(cls, v):
        if v < 18 or v > 100:
            raise ValueError('Age must be between 18 and 100')
        return v
    
    @validator('national_id')
    def validate_national_id(cls, v):
        if len(v) < 8:
            raise ValueError('National ID must be at least 8 characters')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if len(v) < 10:
            raise ValueError('Phone number must be at least 10 characters')
        return v

class TenantUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    national_id: Optional[str] = None
    
    # Location Information
    previous_address: Optional[str] = None
    previous_city: Optional[str] = None
    previous_state: Optional[str] = None
    previous_country: Optional[str] = None
    
    # Employment Information
    occupation: Optional[str] = None
    employer_name: Optional[str] = None
    monthly_income: Optional[Decimal] = None
    
    # Family Information
    number_of_family_members: Optional[int] = None
    family_details: Optional[str] = None
    
    # Rental Information
    property_id: Optional[int] = None
    unit_id: Optional[int] = None
    move_in_date: Optional[date] = None
    move_out_date: Optional[date] = None
    monthly_rent: Optional[Decimal] = None
    deposit_paid: Optional[Decimal] = None
    
    # Status Information
    is_active: Optional[bool] = None
    rent_payment_status: Optional[str] = None
    last_payment_date: Optional[date] = None
    next_payment_due: Optional[date] = None
    
    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    
    # Additional Information
    notes: Optional[str] = None

class TenantResponse(TenantBase):
    id: int
    national_id_front_image: Optional[str] = None
    national_id_back_image: Optional[str] = None
    move_out_date: Optional[date] = None
    is_active: bool
    rent_payment_status: str
    last_payment_date: Optional[date] = None
    next_payment_due: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TenantWithPropertyAndUnit(TenantResponse):
    property_name: str
    unit_number: str
    property_address: str

class TenantPaymentStatus(BaseModel):
    tenant_id: int
    tenant_name: str
    unit_number: str
    property_name: str
    monthly_rent: Decimal
    rent_payment_status: str
    last_payment_date: Optional[date] = None
    next_payment_due: Optional[date] = None
    days_overdue: Optional[int] = None
    total_paid: Decimal = 0
    balance_due: Decimal = 0
