from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str
    is_read: Optional[bool] = False

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Schemas
class PropertyAnalytics(BaseModel):
    property_id: int
    total_units: int
    occupied_units: int
    available_units: int
    occupancy_rate: float
    total_monthly_rent: float
    collected_rent: float
    pending_rent: float
    maintenance_requests_count: int
    pending_maintenance: int

class PaymentAnalytics(BaseModel):
    total_payments: float
    paid_payments: float
    pending_payments: float
    overdue_payments: float
    payment_collection_rate: float

class MaintenanceAnalytics(BaseModel):
    total_requests: int
    pending_requests: int
    completed_requests: int
    average_completion_time: float
    total_cost: float

