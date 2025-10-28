from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ..models import UtilityType

# Utility Schemas
class UtilityBase(BaseModel):
    utility_type: UtilityType
    provider_name: str
    account_number: Optional[str] = None
    monthly_cost: Optional[Decimal] = 0
    is_included_in_rent: Optional[bool] = False
    description: Optional[str] = None

class UtilityCreate(UtilityBase):
    property_id: int

class UtilityUpdate(BaseModel):
    utility_type: Optional[UtilityType] = None
    provider_name: Optional[str] = None
    account_number: Optional[str] = None
    monthly_cost: Optional[Decimal] = None
    is_included_in_rent: Optional[bool] = None
    description: Optional[str] = None

class UtilityResponse(UtilityBase):
    id: int
    property_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
