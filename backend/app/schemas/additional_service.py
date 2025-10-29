from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

# Additional Service Schemas
class AdditionalServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    is_active: bool = True

class AdditionalServiceCreate(AdditionalServiceBase):
    pass

class AdditionalServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    is_active: Optional[bool] = None

class AdditionalServiceResponse(AdditionalServiceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

