from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.utility import UtilityCreate, UtilityResponse, UtilityUpdate
from ..crud.utility import utility_crud
from ..crud.property import property_crud
from ..models.user import User

router = APIRouter(prefix="/utilities", tags=["Utilities"])

@router.post("/", response_model=UtilityResponse)
async def create_utility(
    utility: UtilityCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new utility."""
    # Check if property exists and user has access
    property = property_crud.get_property_by_id(db, utility.property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return utility_crud.create_utility(db, utility)

@router.get("/", response_model=List[UtilityResponse])
async def get_utilities(
    property_id: Optional[int] = None,
    utility_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get utilities."""
    if property_id:
        # Check access permissions
        property = property_crud.get_property_by_id(db, property_id)
        if not property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found"
            )
        
        if current_user.role == "owner" and property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "tenant":
            # Check if tenant has access to this property
            from ..crud.lease import lease_crud
            leases = lease_crud.get_leases_by_tenant(db, current_user.id)
            has_access = any(lease.unit.property_id == property_id and lease.status == "active" for lease in leases)
            if not has_access:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        return utility_crud.get_utilities_by_property(db, property_id, skip=skip, limit=limit)
    elif utility_type:
        return utility_crud.get_utilities_by_type(db, utility_type, skip=skip, limit=limit)
    else:
        # Return all utilities for admin/owner
        if current_user.role == "owner":
            return utility_crud.get_utilities_by_owner(db, current_user.id, skip=skip, limit=limit)
        elif current_user.role == "admin":
            return utility_crud.get_utilities_by_type(db, "all", skip=skip, limit=limit)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

@router.get("/{utility_id}", response_model=UtilityResponse)
async def get_utility(
    utility_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get utility by ID."""
    utility = utility_crud.get_utility_by_id(db, utility_id)
    if not utility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utility not found"
        )
    
    # Check access permissions
    property = property_crud.get_property_by_id(db, utility.property_id)
    if current_user.role == "tenant":
        # Check if tenant has access to this property
        from ..crud.lease import lease_crud
        leases = lease_crud.get_leases_by_tenant(db, current_user.id)
        has_access = any(lease.unit.property_id == utility.property_id and lease.status == "active" for lease in leases)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return utility

@router.put("/{utility_id}", response_model=UtilityResponse)
async def update_utility(
    utility_id: int,
    utility_update: UtilityUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update utility by ID."""
    utility = utility_crud.get_utility_by_id(db, utility_id)
    if not utility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utility not found"
        )
    
    # Check ownership
    property = property_crud.get_property_by_id(db, utility.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_utility = utility_crud.update_utility(db, utility_id, utility_update)
    return updated_utility

@router.delete("/{utility_id}")
async def delete_utility(
    utility_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete utility by ID."""
    utility = utility_crud.get_utility_by_id(db, utility_id)
    if not utility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utility not found"
        )
    
    # Check ownership
    property = property_crud.get_property_by_id(db, utility.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = utility_crud.delete_utility(db, utility_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utility not found"
        )
    
    return {"message": "Utility deleted successfully"}

