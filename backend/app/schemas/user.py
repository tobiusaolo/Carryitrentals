from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models import UserRole

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.TENANT

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str  # Changed from EmailStr to accept phone numbers too
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
    user: dict  # User data included in login response

class TokenData(BaseModel):
    email: Optional[str] = None
