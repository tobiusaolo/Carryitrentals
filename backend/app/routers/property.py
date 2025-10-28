from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate
from ..crud.property import property_crud
from ..models.user import User

router = APIRouter(prefix="/properties", tags=["Properties"])

@router.post("/", response_model=PropertyResponse)
async def create_property(
    property: PropertyCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new property."""
    return property_crud.create_property(db, property, current_user.id)

@router.get("/", response_model=List[PropertyResponse])
async def get_properties(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get properties."""
    if current_user.role in ["admin", "owner"]:
        if current_user.role == "admin":
            return property_crud.get_all_properties(db, skip=skip, limit=limit)
        else:
            return property_crud.get_properties_by_owner(db, current_user.id, skip=skip, limit=limit)
    else:
        # For tenants, get properties where they have leases
        from ..crud.lease import lease_crud
        leases = lease_crud.get_leases_by_tenant(db, current_user.id)
        property_ids = [lease.unit.property_id for lease in leases if lease.status == "active"]
        properties = []
        for prop_id in property_ids:
            prop = property_crud.get_property_by_id(db, prop_id)
            if prop:
                properties.append(prop)
        return properties

@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get property by ID with units."""
    property = property_crud.get_property_by_id(db, property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check access permissions
    if current_user.role == "tenant":
        # Check if tenant has access to this property
        from ..crud.lease import lease_crud
        leases = lease_crud.get_leases_by_tenant(db, current_user.id)
        has_access = any(lease.unit.property_id == property_id and lease.status == "active" for lease in leases)
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
    
    return property

@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: int,
    property_update: PropertyUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update property by ID."""
    property = property_crud.get_property_by_id(db, property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check ownership
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_property = property_crud.update_property(db, property_id, property_update)
    return updated_property

@router.delete("/{property_id}")
async def delete_property(
    property_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete property by ID."""
    property = property_crud.get_property_by_id(db, property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check ownership
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = property_crud.delete_property(db, property_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    return {"message": "Property deleted successfully"}

@router.get("/search/{query}", response_model=List[PropertyResponse])
async def search_properties(
    query: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Search properties."""
    return property_crud.search_properties(db, query, skip=skip, limit=limit)
