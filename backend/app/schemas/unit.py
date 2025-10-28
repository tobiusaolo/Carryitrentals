from pydantic import BaseModel, validator
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal
from ..models import UnitStatus, UnitType, Currency

# Unit Schemas
class UnitBase(BaseModel):
    unit_number: Optional[str] = None  # Optional for rental units
    unit_type: UnitType
    floor: Optional[int] = None
    bedrooms: int
    bathrooms: int
    monthly_rent: Decimal
    currency: Currency = Currency.USD
    status: UnitStatus = UnitStatus.AVAILABLE
    description: Optional[str] = None
    amenities: Optional[str] = None
    images: Optional[str] = None
    agent_id: Optional[int] = None

class UnitCreate(UnitBase):
    property_id: Optional[int] = None  # Optional for rental units
    
    @validator('images')
    def validate_images(cls, v):
        if v:
            # Split comma-separated image paths
            image_list = [img.strip() for img in v.split(',') if img.strip()]
            if len(image_list) < 5:
                raise ValueError('At least 5 images are required')
            if len(image_list) > 10:
                raise ValueError('Maximum 10 images allowed')
        return v

class UnitUpdate(BaseModel):
    unit_number: Optional[str] = None
    floor: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    monthly_rent: Optional[Decimal] = None
    status: Optional[UnitStatus] = None
    description: Optional[str] = None
    amenities: Optional[str] = None
    images: Optional[str] = None
    agent_id: Optional[int] = None

class UnitResponse(UnitBase):
    id: int
    property_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UnitWithProperty(UnitResponse):
    property: Any

class UnitWithPropertyName(UnitResponse):
    property_name: str
    agent_name: Optional[str] = None
