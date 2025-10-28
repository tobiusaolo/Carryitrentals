from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SystemSettingsBase(BaseModel):
    setting_key: str
    setting_value: str
    setting_type: str = 'string'
    description: Optional[str] = None
    is_active: bool = True

class SystemSettingsCreate(SystemSettingsBase):
    pass

class SystemSettingsUpdate(BaseModel):
    setting_value: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SystemSettingsResponse(SystemSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

