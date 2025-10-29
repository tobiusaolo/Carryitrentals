from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.additional_service import AdditionalService
from ..schemas.additional_service import (
    AdditionalServiceCreate,
    AdditionalServiceUpdate,
    AdditionalServiceResponse
)
from ..auth import get_current_active_user, require_roles
from ..models.user import User

router = APIRouter(prefix="/additional-services", tags=["Additional Services"])

@router.post("/", response_model=AdditionalServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_additional_service(
    service: AdditionalServiceCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Create a new additional service (Admin only).
    Services can include: Moving, Packaging, Cleaning, etc.
    """
    try:
        # Check if service with this name already exists
        existing = db.query(AdditionalService).filter(
            AdditionalService.name == service.name
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service with this name already exists"
            )
        
        db_service = AdditionalService(**service.dict())
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        
        return db_service
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating service: {str(e)}"
        )

@router.get("/", response_model=List[AdditionalServiceResponse])
async def get_additional_services(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get all additional services.
    Public endpoint - no authentication required.
    """
    try:
        query = db.query(AdditionalService)
        
        if active_only:
            query = query.filter(AdditionalService.is_active == True)
        
        services = query.offset(skip).limit(limit).all()
        return services
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching services: {str(e)}"
        )

@router.get("/{service_id}", response_model=AdditionalServiceResponse)
async def get_additional_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific additional service by ID.
    """
    try:
        service = db.query(AdditionalService).filter(
            AdditionalService.id == service_id
        ).first()
        
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        return service
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching service: {str(e)}"
        )

@router.put("/{service_id}", response_model=AdditionalServiceResponse)
async def update_additional_service(
    service_id: int,
    service_update: AdditionalServiceUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Update an additional service (Admin only).
    """
    try:
        db_service = db.query(AdditionalService).filter(
            AdditionalService.id == service_id
        ).first()
        
        if not db_service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        # Check if name is being changed and already exists
        if service_update.name and service_update.name != db_service.name:
            existing = db.query(AdditionalService).filter(
                AdditionalService.name == service_update.name
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Service with this name already exists"
                )
        
        # Update fields
        update_data = service_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_service, field, value)
        
        db.commit()
        db.refresh(db_service)
        
        return db_service
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating service: {str(e)}"
        )

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_additional_service(
    service_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Delete an additional service (Admin only).
    """
    try:
        db_service = db.query(AdditionalService).filter(
            AdditionalService.id == service_id
        ).first()
        
        if not db_service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        db.delete(db_service)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting service: {str(e)}"
        )

