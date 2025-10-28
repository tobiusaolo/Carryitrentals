from pydantic import BaseModel, validator
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal
from ..models import UnitStatus, UnitType, Currency

# Rental Unit Schemas
class RentalUnitBase(BaseModel):
    unit_type: UnitType
    floor: Optional[int] = None
    bedrooms: int
    bathrooms: int
    square_feet: Optional[Decimal] = None
    monthly_rent: Decimal
    deposit_amount: Optional[Decimal] = 0
    inspection_fee: Decimal = 0
    currency: Currency = Currency.USD
    status: UnitStatus = UnitStatus.AVAILABLE
    description: Optional[str] = None
    amenities: Optional[str] = None
    images: Optional[str] = None
    agent_id: Optional[int] = None
    location: str
    title: str

class RentalUnitCreate(RentalUnitBase):
    pass

class RentalUnitUpdate(BaseModel):
    unit_type: Optional[UnitType] = None
    floor: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    square_feet: Optional[Decimal] = None
    monthly_rent: Optional[Decimal] = None
    deposit_amount: Optional[Decimal] = None
    inspection_fee: Optional[Decimal] = None
    currency: Optional[Currency] = None
    status: Optional[UnitStatus] = None
    description: Optional[str] = None
    amenities: Optional[str] = None
    images: Optional[str] = None
    agent_id: Optional[int] = None
    location: Optional[str] = None
    title: Optional[str] = None

class RentalUnitResponse(RentalUnitBase):
    id: int
    created_at: datetime
    updated_at: datetime
    agent_name: Optional[str] = None
    inspection_bookings_count: int = 0
    
    class Config:
        from_attributes = True
