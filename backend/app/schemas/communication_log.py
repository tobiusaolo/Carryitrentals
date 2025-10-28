from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CommunicationLogBase(BaseModel):
    recipient_ids: str  # JSON array
    method: str  # email, sms, both
    template_id: Optional[int] = None
    subject: Optional[str] = None
    message_content: str
    scheduled_at: Optional[datetime] = None

class CommunicationLogCreate(CommunicationLogBase):
    pass

class CommunicationLogUpdate(BaseModel):
    status: Optional[str] = None
    sent_count: Optional[int] = None
    failed_count: Optional[int] = None
    sent_at: Optional[datetime] = None
    delivery_report: Optional[str] = None

class CommunicationLogResponse(CommunicationLogBase):
    id: int
    sender_id: int
    sent_count: int
    failed_count: int
    status: str
    sent_at: Optional[datetime]
    delivery_report: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class BulkMessageRequest(BaseModel):
    recipient_type: str  # all, property, status, custom
    property_id: Optional[int] = None
    status_filter: Optional[str] = None  # overdue, due, paid
    custom_recipients: Optional[List[int]] = None  # List of tenant IDs
    method: str  # email, sms, both
    template_id: Optional[int] = None
    custom_subject: Optional[str] = None
    custom_message: Optional[str] = None
    schedule_at: Optional[datetime] = None

