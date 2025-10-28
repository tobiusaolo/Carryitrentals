from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class AgentBase(BaseModel):
    name: str
    email: str  # Changed from EmailStr to str to accept phone numbers
    phone: str
    age: Optional[int] = None
    location: str
    nin_number: str
    specialization: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    profile_picture: Optional[str] = None
    nin_front_image: Optional[str] = None
    nin_back_image: Optional[str] = None

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None  # Changed from EmailStr to str
    phone: Optional[str] = None
    age: Optional[int] = None
    location: Optional[str] = None
    nin_number: Optional[str] = None
    specialization: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    profile_picture: Optional[str] = None
    nin_front_image: Optional[str] = None
    nin_back_image: Optional[str] = None

class AgentResponse(AgentBase):
    id: int
    completed_inspections: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
