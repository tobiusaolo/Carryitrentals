from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from ..models import PropertyType

# Property Schemas
class PropertyBase(BaseModel):
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    country: str
    property_type: PropertyType
    description: Optional[str] = None
    total_units: Optional[int] = 0

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    property_type: Optional[PropertyType] = None
    description: Optional[str] = None
    total_units: Optional[int] = None
    mtn_mobile_money_number: Optional[str] = None
    airtel_money_number: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: int
    owner_id: int
    mtn_mobile_money_number: Optional[str] = None
    airtel_money_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PropertyWithUnits(PropertyResponse):
    units: List[Any] = []
    utilities: List[Any] = []
