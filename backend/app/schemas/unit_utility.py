from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal
from ..models import UtilityType

# Unit Utility Schemas
class UnitUtilityBase(BaseModel):
    utility_type: UtilityType
    provider_name: str
    account_number: Optional[str] = None
    monthly_cost: Decimal = 0
    is_included_in_rent: bool = False
    description: Optional[str] = None

class UnitUtilityCreate(UnitUtilityBase):
    unit_id: int

class UnitUtilityUpdate(BaseModel):
    utility_type: Optional[UtilityType] = None
    provider_name: Optional[str] = None
    account_number: Optional[str] = None
    monthly_cost: Optional[Decimal] = None
    is_included_in_rent: Optional[bool] = None
    description: Optional[str] = None

class UnitUtilityResponse(UnitUtilityBase):
    id: int
    unit_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True












