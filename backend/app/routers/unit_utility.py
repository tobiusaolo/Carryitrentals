from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.unit_utility import UnitUtilityCreate, UnitUtilityResponse, UnitUtilityUpdate
from ..crud.unit_utility import unit_utility_crud
from ..crud.unit import unit_crud
from ..models.user import User

router = APIRouter(prefix="/unit-utilities", tags=["Unit Utilities"])

@router.post("/", response_model=UnitUtilityResponse)
async def create_unit_utility(
    utility: UnitUtilityCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new unit utility."""
    # Check if unit exists and user has access
    unit = unit_crud.get_unit_by_id(db, utility.unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check if user owns the property
    if current_user.role == "owner" and unit.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return unit_utility_crud.create_unit_utility(db, utility)

@router.get("/", response_model=List[UnitUtilityResponse])
async def get_unit_utilities(
    unit_id: Optional[int] = None,
    utility_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get unit utilities."""
    if unit_id:
        # Check access permissions
        unit = unit_crud.get_unit_by_id(db, unit_id)
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unit not found"
            )
        
        if current_user.role == "owner" and unit.property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "tenant":
            # Check if tenant has access to this unit
            from ..crud.lease import lease_crud
            leases = lease_crud.get_leases_by_tenant(db, current_user.id)
            has_access = any(lease.unit_id == unit_id and lease.status == "active" for lease in leases)
            if not has_access:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        return unit_utility_crud.get_utilities_by_unit(db, unit_id, skip=skip, limit=limit)
    elif utility_type:
        return unit_utility_crud.get_utilities_by_type(db, utility_type, skip=skip, limit=limit)
    else:
        # Return all utilities for admin/owner
        if current_user.role == "owner":
            return unit_utility_crud.get_utilities_by_owner(db, current_user.id, skip=skip, limit=limit)
        elif current_user.role == "admin":
            return unit_utility_crud.get_utilities_by_type(db, "all", skip=skip, limit=limit)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

@router.get("/{utility_id}", response_model=UnitUtilityResponse)
async def get_unit_utility(
    utility_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific unit utility."""
    utility = unit_utility_crud.get_unit_utility_by_id(db, utility_id)
    if not utility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit utility not found"
        )
    
    # Check access permissions
    unit = unit_crud.get_unit_by_id(db, utility.unit_id)
    if current_user.role == "owner" and unit.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "tenant":
        # Check if tenant has access to this unit
        from ..crud.lease import lease_crud
        leases = lease_crud.get_leases_by_tenant(db, current_user.id)
        has_access = any(lease.unit_id == utility.unit_id and lease.status == "active" for lease in leases)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return utility

@router.put("/{utility_id}", response_model=UnitUtilityResponse)
async def update_unit_utility(
    utility_id: int,
    utility_update: UnitUtilityUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update a unit utility."""
    utility = unit_utility_crud.get_unit_utility_by_id(db, utility_id)
    if not utility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit utility not found"
        )
    
    # Check access permissions
    unit = unit_crud.get_unit_by_id(db, utility.unit_id)
    if current_user.role == "owner" and unit.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_utility = unit_utility_crud.update_unit_utility(db, utility_id, utility_update)
    if not updated_utility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit utility not found"
        )
    
    return updated_utility

@router.delete("/{utility_id}")
async def delete_unit_utility(
    utility_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete a unit utility."""
    utility = unit_utility_crud.get_unit_utility_by_id(db, utility_id)
    if not utility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit utility not found"
        )
    
    # Check access permissions
    unit = unit_crud.get_unit_by_id(db, utility.unit_id)
    if current_user.role == "owner" and unit.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = unit_utility_crud.delete_unit_utility(db, utility_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit utility not found"
        )
    
    return {"message": "Unit utility deleted successfully"}



