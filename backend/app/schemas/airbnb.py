from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from ..models.enums import Currency

# Airbnb Schemas
class AirbnbBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: str
    price_per_night: Decimal
    currency: Currency = Currency.USD
    max_guests: int = 2
    bedrooms: int = 1
    bathrooms: int = 1
    amenities: Optional[str] = None
    house_rules: Optional[str] = None
    images: Optional[str] = None
    is_available: str = 'available'

class AirbnbCreate(AirbnbBase):
    owner_id: Optional[int] = None  # Will be set automatically from current user

class AirbnbUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    price_per_night: Optional[Decimal] = None
    currency: Optional[Currency] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    amenities: Optional[str] = None
    house_rules: Optional[str] = None
    images: Optional[str] = None
    is_available: Optional[str] = None

class AirbnbResponse(AirbnbBase):
    id: int
    owner_id: int
    owner_name: Optional[str] = None
    bookings_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Airbnb Booking Schemas
class AirbnbBookingBase(BaseModel):
    airbnb_id: int
    guest_name: str
    guest_email: str
    guest_phone: str
    guest_username: Optional[str] = None  # Username or ID
    guest_date_of_birth: Optional[date] = None  # Date of birth
    check_in: date
    check_out: date
    number_of_guests: int
    special_requests: Optional[str] = None

class AirbnbBookingCreate(AirbnbBookingBase):
    payment_timing: str = 'pay_now'  # pay_now or pay_later
    payment_method: str  # visa_card, mtn_mobile_money, airtel_money
    payment_method_type: str  # 'card' or 'mobile_money'
    
    # Card details (if payment_method_type = 'card')
    card_number: Optional[str] = None
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None
    card_holder_name: Optional[str] = None
    
class AirbnbBookingUpdate(BaseModel):
    status: Optional[str] = None
    special_requests: Optional[str] = None
    payment_status: Optional[str] = None
    payment_reference: Optional[str] = None

class AirbnbBookingResponse(AirbnbBookingBase):
    id: int
    number_of_nights: int
    total_amount: Decimal
    currency: str
    status: str
    payment_status: str
    payment_timing: str
    payment_method: Optional[str] = None
    payment_method_type: Optional[str] = None
    prepayment_required: bool
    prepayment_percentage: Decimal
    prepayment_amount: Optional[Decimal] = None
    remaining_amount: Optional[Decimal] = None
    payment_reference: Optional[str] = None
    payment_date: Optional[datetime] = None
    card_last_four: Optional[str] = None
    card_brand: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AirbnbBookingWithDetails(AirbnbBookingResponse):
    airbnb: Optional[dict] = None  # Airbnb property details

