from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.user import UserCreate, UserResponse, UserUpdate, UserLogin, Token
from ..crud.user import user_crud
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    db_user = user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = user_crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    return user_crud.create_user(db, user)

@router.post("/login")
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token."""
    from ..auth import verify_password, create_access_token, create_refresh_token
    
    # Debug logging
    print(f"DEBUG: Login attempt - Email: '{user_credentials.email}' (len: {len(user_credentials.email)})")
    print(f"DEBUG: Login attempt - Password: '{user_credentials.password}' (len: {len(user_credentials.password)})")
    
    # Authenticate user
    user = user_crud.get_user_by_email(db, email=user_credentials.email)
    print(f"DEBUG: User found: {user is not None}")
    if user:
        print(f"DEBUG: User email: '{user.email}' (len: {len(user.email)})")
        print(f"DEBUG: User active: {user.is_active}")
        password_match = verify_password(user_credentials.password, user.hashed_password)
        print(f"DEBUG: Password match: {password_match}")
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        print(f"DEBUG: Authentication failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # Debug role
    print(f"DEBUG: User role type: {type(user.role)}")
    print(f"DEBUG: User role raw: {user.role}")
    role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)
    print(f"DEBUG: User role converted: {role_value}")
    
    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": role_value,
            "phone": user.phone,
            "is_active": user.is_active
        }
    }
    
    print(f"DEBUG: Response data keys: {response_data.keys()}")
    print(f"DEBUG: User object in response: {response_data.get('user') is not None}")
    print(f"DEBUG: Response user role: {response_data['user']['role']}")
    
    return response_data

@router.post("/agent-login")
async def agent_phone_login(phone: str, db: Session = Depends(get_db)):
    """Agent login with phone number only (passwordless)."""
    from ..auth import create_access_token, create_refresh_token
    from ..models.agent import Agent
    
    print(f"DEBUG: Agent login attempt - Phone: '{phone}'")
    
    # Check if agent exists with this phone number
    agent = db.query(Agent).filter(Agent.phone == phone).first()
    
    if not agent:
        print(f"DEBUG: Agent not found with phone: {phone}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Agent not found with this phone number"
        )
    
    if not agent.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agent account is inactive"
        )
    
    print(f"DEBUG: Agent found: {agent.name}")
    
    # Find or create corresponding User account
    user = db.query(User).filter(
        (User.phone == phone) | (User.email == agent.email)
    ).first()
    
    if not user:
        # Auto-create user if doesn't exist
        from ..crud.user import user_crud
        from ..schemas.user import UserCreate
        from ..models.enums import UserRole
        import secrets
        
        name_parts = agent.name.split()
        first_name = name_parts[0] if name_parts else agent.name
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ""
        
        user_data = UserCreate(
            email=agent.email,
            username=phone,
            password=secrets.token_urlsafe(32),
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=UserRole.AGENT
        )
        
        user = user_crud.create_user(db, user_data)
        print(f"DEBUG: Created new user for agent")
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)
    
    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": role_value,
            "phone": user.phone,
            "is_active": user.is_active
        }
    }
    
    print(f"DEBUG: Agent login successful for: {agent.name}")
    return response_data

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: dict, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    from ..auth import verify_refresh_token, create_access_token
    
    refresh_token = refresh_data.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required"
        )
    
    # Verify refresh token
    email = verify_refresh_token(refresh_token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user
    user = user_crud.get_user_by_email(db, email=email)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token  # Return the same refresh token
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user information."""
    return user_crud.update_user(db, current_user.id, user_update)

@router.get("/users", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get all users (admin/owner only)."""
    return user_crud.get_users(db, skip=skip, limit=limit)

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get user by ID (admin/owner only)."""
    user = user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update user by ID (admin/owner only)."""
    user = user_crud.update_user(db, user_id, user_update)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Delete user by ID (admin only)."""
    success = user_crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User deleted successfully"}
