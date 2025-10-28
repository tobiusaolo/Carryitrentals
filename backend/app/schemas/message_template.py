from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageTemplateBase(BaseModel):
    name: str
    type: str  # email, sms, both
    category: Optional[str] = None
    subject: Optional[str] = None
    body: str
    variables: Optional[str] = None
    is_active: bool = True

class MessageTemplateCreate(MessageTemplateBase):
    pass

class MessageTemplateUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    variables: Optional[str] = None
    is_active: Optional[bool] = None

class MessageTemplateResponse(MessageTemplateBase):
    id: int
    created_by_user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True








