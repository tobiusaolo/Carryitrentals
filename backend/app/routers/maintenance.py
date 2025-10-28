from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.maintenance import MaintenanceRequestCreate, MaintenanceRequestResponse, MaintenanceRequestUpdate, MaintenanceRequestWithDetails
from ..crud.maintenance import maintenance_crud
from ..crud.property import property_crud
from ..crud.unit import unit_crud
from ..services.notification import notification_service
from ..services.file_upload import file_upload_service
from ..models.user import User

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/", response_model=MaintenanceRequestResponse)
async def create_maintenance_request(
    maintenance: MaintenanceRequestCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new maintenance request."""
    # Check if property exists and user has access
    property = property_crud.get_property_by_id(db, maintenance.property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check access permissions
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "tenant":
        # Check if tenant has access to this property
        from ..crud.lease import lease_crud
        leases = lease_crud.get_leases_by_tenant(db, current_user.id)
        has_access = any(lease.unit.property_id == maintenance.property_id and lease.status == "active" for lease in leases)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Check if unit exists and belongs to property (if specified)
    if maintenance.unit_id:
        unit = unit_crud.get_unit_by_id(db, maintenance.unit_id)
        if not unit or unit.property_id != maintenance.property_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unit does not belong to the specified property"
            )
    
    # Set requester to current user
    maintenance.requester_id = current_user.id
    
    return maintenance_crud.create_maintenance_request(db, maintenance)

@router.get("/", response_model=List[MaintenanceRequestResponse])
async def get_maintenance_requests(
    property_id: Optional[int] = None,
    unit_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get maintenance requests."""
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
        
        return maintenance_crud.get_maintenance_requests_by_property(db, property_id, skip=skip, limit=limit)
    elif unit_id:
        # Check access permissions
        unit = unit_crud.get_unit_by_id(db, unit_id)
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unit not found"
            )
        
        property = property_crud.get_property_by_id(db, unit.property_id)
        if current_user.role == "owner" and property.owner_id != current_user.id:
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
        
        return maintenance_crud.get_maintenance_requests_by_unit(db, unit_id, skip=skip, limit=limit)
    elif status:
        return maintenance_crud.get_maintenance_requests_by_status(db, status, skip=skip, limit=limit)
    elif priority:
        return maintenance_crud.get_maintenance_requests_by_priority(db, priority, skip=skip, limit=limit)
    else:
        # Return all maintenance requests for admin/owner
        if current_user.role not in ["admin", "owner"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        return maintenance_crud.get_maintenance_requests_by_status(db, "all", skip=skip, limit=limit)

@router.get("/{maintenance_id}", response_model=MaintenanceRequestResponse)
async def get_maintenance_request(
    maintenance_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get maintenance request by ID."""
    maintenance = maintenance_crud.get_maintenance_request_by_id(db, maintenance_id)
    if not maintenance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    # Check access permissions
    if current_user.role == "tenant" and maintenance.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "owner":
        property = property_crud.get_property_by_id(db, maintenance.property_id)
        if property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return maintenance

@router.put("/{maintenance_id}", response_model=MaintenanceRequestResponse)
async def update_maintenance_request(
    maintenance_id: int,
    maintenance_update: MaintenanceRequestUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update maintenance request by ID."""
    maintenance = maintenance_crud.get_maintenance_request_by_id(db, maintenance_id)
    if not maintenance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    # Check ownership
    property = property_crud.get_property_by_id(db, maintenance.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_maintenance = maintenance_crud.update_maintenance_request(db, maintenance_id, maintenance_update)
    
    # Send notification to requester if status changed
    if maintenance_update.status and maintenance_update.status != maintenance.status:
        from ..crud.user import user_crud
        requester = user_crud.get_user_by_id(db, maintenance.requester_id)
        if requester:
            await notification_service.send_maintenance_update(
                db, requester.id, maintenance.title, maintenance_update.status,
                requester.email, requester.phone
            )
    
    return updated_maintenance

@router.post("/{maintenance_id}/assign")
async def assign_maintenance_request(
    maintenance_id: int,
    assigned_to: str,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Assign maintenance request to someone."""
    maintenance = maintenance_crud.get_maintenance_request_by_id(db, maintenance_id)
    if not maintenance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    # Check ownership
    property = property_crud.get_property_by_id(db, maintenance.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_maintenance = maintenance_crud.assign_maintenance_request(db, maintenance_id, assigned_to)
    
    # Send notification to requester
    from ..crud.user import user_crud
    requester = user_crud.get_user_by_id(db, maintenance.requester_id)
    if requester:
        await notification_service.send_maintenance_update(
            db, requester.id, maintenance.title, "assigned",
            requester.email, requester.phone
        )
    
    return updated_maintenance

@router.post("/{maintenance_id}/complete")
async def complete_maintenance_request(
    maintenance_id: int,
    actual_cost: Optional[float] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Mark maintenance request as completed."""
    maintenance = maintenance_crud.get_maintenance_request_by_id(db, maintenance_id)
    if not maintenance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    # Check ownership
    property = property_crud.get_property_by_id(db, maintenance.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_maintenance = maintenance_crud.complete_maintenance_request(db, maintenance_id, actual_cost)
    
    # Send notification to requester
    from ..crud.user import user_crud
    requester = user_crud.get_user_by_id(db, maintenance.requester_id)
    if requester:
        await notification_service.send_maintenance_update(
            db, requester.id, maintenance.title, "completed",
            requester.email, requester.phone
        )
    
    return updated_maintenance

@router.post("/{maintenance_id}/upload-images")
async def upload_maintenance_images(
    maintenance_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload images for a maintenance request."""
    maintenance = maintenance_crud.get_maintenance_request_by_id(db, maintenance_id)
    if not maintenance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    # Check access permissions
    if current_user.role == "tenant" and maintenance.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "owner":
        property = property_crud.get_property_by_id(db, maintenance.property_id)
        if property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Upload images
    image_paths = await file_upload_service.save_multiple_images(files, "maintenance_images")
    
    # Update maintenance request with new images
    import json
    images_json = json.dumps(image_paths)
    maintenance_update = MaintenanceRequestUpdate(images=images_json)
    maintenance_crud.update_maintenance_request(db, maintenance_id, maintenance_update)
    
    return {"message": "Images uploaded successfully", "image_paths": image_paths}

@router.delete("/{maintenance_id}")
async def delete_maintenance_request(
    maintenance_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete maintenance request by ID."""
    maintenance = maintenance_crud.get_maintenance_request_by_id(db, maintenance_id)
    if not maintenance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    # Check ownership
    property = property_crud.get_property_by_id(db, maintenance.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = maintenance_crud.delete_maintenance_request(db, maintenance_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    return {"message": "Maintenance request deleted successfully"}
