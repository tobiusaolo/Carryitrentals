from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.unit import UnitCreate, UnitResponse, UnitUpdate
from ..crud.unit import unit_crud
from ..crud.property import property_crud
from ..services.file_upload import file_upload_service
from ..models.user import User

router = APIRouter(prefix="/units", tags=["Units"])

@router.post("/", response_model=UnitResponse)
async def create_unit(
    unit: UnitCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new unit."""
    # Check if property exists and user has access
    property = property_crud.get_property_by_id(db, unit.property_id)
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
    
    return unit_crud.create_unit(db, unit)

@router.get("/", response_model=List[UnitResponse])
async def get_units(
    property_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get units."""
    if property_id:
        # Check access to property
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
        
        return unit_crud.get_units_by_property(db, property_id, skip=skip, limit=limit)
    elif status:
        return unit_crud.get_units_by_status(db, status, skip=skip, limit=limit)
    else:
        # If owner, return only their units
        if current_user.role == "owner":
            return unit_crud.get_units_by_owner(db, current_user.id, skip=skip, limit=limit)
        # If admin, return all units
        elif current_user.role == "admin":
            return unit_crud.get_all_units(db, skip=skip, limit=limit)
        # For other roles, return available units
        else:
            return unit_crud.get_available_units(db, skip=skip, limit=limit)

@router.get("/{unit_id}", response_model=UnitResponse)
async def get_unit(
    unit_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get unit by ID."""
    unit = unit_crud.get_unit_by_id(db, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check access permissions
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "tenant":
        # Check if tenant has access to this unit
        from ..crud.lease import lease_crud
        leases = lease_crud.get_leases_by_tenant(db, current_user.id)
        has_access = any(lease.unit_id == unit_id and lease.status == "active" for lease in leases)
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
    
    return unit

@router.put("/{unit_id}", response_model=UnitResponse)
async def update_unit(
    unit_id: int,
    unit_update: UnitUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update unit by ID."""
    unit = unit_crud.get_unit_by_id(db, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check ownership
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_unit = unit_crud.update_unit(db, unit_id, unit_update)
    return updated_unit

@router.delete("/{unit_id}")
async def delete_unit(
    unit_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete unit by ID."""
    unit = unit_crud.get_unit_by_id(db, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check ownership
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = unit_crud.delete_unit(db, unit_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    return {"message": "Unit deleted successfully"}

@router.post("/{unit_id}/upload-images")
async def upload_unit_images(
    unit_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Upload images for a unit."""
    unit = unit_crud.get_unit_by_id(db, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check ownership
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Upload images
    image_paths = await file_upload_service.save_multiple_images(files, "unit_images")
    
    # Update unit with new images
    images_json = file_upload_service.update_unit_images(unit_id, image_paths)
    unit_update = UnitUpdate(images=images_json)
    unit_crud.update_unit(db, unit_id, unit_update)
    
    return {"message": "Images uploaded successfully", "image_paths": image_paths}

@router.get("/search/{query}", response_model=List[UnitResponse])
async def search_units(
    query: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Search units."""
    return unit_crud.search_units(db, query, skip=skip, limit=limit)
