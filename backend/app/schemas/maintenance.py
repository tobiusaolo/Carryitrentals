from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from decimal import Decimal
from ..models import MaintenanceStatus

# Maintenance Schemas
class MaintenanceRequestBase(BaseModel):
    title: str
    description: str
    priority: Optional[str] = "medium"
    status: MaintenanceStatus = MaintenanceStatus.PENDING
    estimated_cost: Optional[Decimal] = None
    actual_cost: Optional[Decimal] = None
    assigned_to: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    images: Optional[str] = None

class MaintenanceRequestCreate(MaintenanceRequestBase):
    property_id: int
    requester_id: int
    unit_id: Optional[int] = None

class MaintenanceRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[MaintenanceStatus] = None
    estimated_cost: Optional[Decimal] = None
    actual_cost: Optional[Decimal] = None
    assigned_to: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    images: Optional[str] = None

class MaintenanceRequestResponse(MaintenanceRequestBase):
    id: int
    property_id: int
    unit_id: Optional[int]
    requester_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class MaintenanceRequestWithDetails(MaintenanceRequestResponse):
    property: Any
    unit: Optional[Any] = None
    requester: Any
