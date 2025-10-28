from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..models.user import User
from ..models.unit import Unit
from ..models.property import Property
from ..models.enums import UnitStatus

router = APIRouter(prefix="/inspections", tags=["Inspections"])

# Pydantic models for inspection
class InspectionBase(BaseModel):
    unit_id: int
    inspection_date: date
    inspection_type: str  # routine, move_in, move_out, emergency
    inspector_name: str
    status: str  # scheduled, in_progress, completed, cancelled
    notes: Optional[str] = None
    findings: Optional[str] = None
    recommendations: Optional[str] = None

class InspectionCreate(InspectionBase):
    pass

class InspectionUpdate(BaseModel):
    inspection_date: Optional[date] = None
    inspection_type: Optional[str] = None
    inspector_name: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    findings: Optional[str] = None
    recommendations: Optional[str] = None

class InspectionResponse(InspectionBase):
    id: int
    unit_number: str
    property_name: str
    property_address: str
    monthly_rent: float
    bedrooms: int
    bathrooms: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Mock data storage (in real app, this would be a database table)
inspections_db = [
    {
        "id": 1,
        "unit_id": 1,
        "unit_number": "101",
        "property_name": "Sunset Apartments",
        "property_address": "123 Sunset Boulevard, Los Angeles, CA",
        "inspection_date": "2025-10-25",
        "inspection_type": "routine",
        "inspector_name": "John Smith",
        "status": "scheduled",
        "notes": "Quarterly routine inspection",
        "findings": "",
        "recommendations": "",
        "monthly_rent": 2500.0,
        "bedrooms": 2,
        "bathrooms": 2,
        "created_at": "2025-10-20T10:00:00Z",
        "updated_at": "2025-10-20T10:00:00Z"
    },
    {
        "id": 2,
        "unit_id": 2,
        "unit_number": "102",
        "property_name": "Sunset Apartments",
        "property_address": "123 Sunset Boulevard, Los Angeles, CA",
        "inspection_date": "2025-10-28",
        "inspection_type": "move_out",
        "inspector_name": "Jane Doe",
        "status": "completed",
        "notes": "Move-out inspection for departing tenant",
        "findings": "Minor wall damage, carpet needs cleaning",
        "recommendations": "Repair wall damage, deep clean carpet",
        "monthly_rent": 2200.0,
        "bedrooms": 1,
        "bathrooms": 1,
        "created_at": "2025-10-18T14:30:00Z",
        "updated_at": "2025-10-20T15:45:00Z"
    }
]

@router.get("/", response_model=List[InspectionResponse])
async def get_inspections(
    status: Optional[str] = None,
    inspection_type: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get all inspections with optional filtering"""
    try:
        # Filter inspections based on user role
        if current_user.role == "owner":
            # Get owner's properties
            owner_properties = db.query(Property).filter(Property.owner_id == current_user.id).all()
            property_ids = [p.id for p in owner_properties]
            
            # Filter inspections for owner's properties only
            filtered_inspections = [
                inspection for inspection in inspections_db
                if any(unit.property_id in property_ids for unit in db.query(Unit).filter(Unit.id == inspection["unit_id"]))
            ]
        else:
            filtered_inspections = inspections_db
        
        # Apply additional filters
        if status:
            filtered_inspections = [i for i in filtered_inspections if i["status"] == status]
        
        if inspection_type:
            filtered_inspections = [i for i in filtered_inspections if i["inspection_type"] == inspection_type]
        
        return filtered_inspections
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching inspections: {str(e)}"
        )

@router.get("/available-units", response_model=List[dict])
async def get_available_units_for_inspection(
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get all units available for rent that can be inspected"""
    try:
        if current_user.role == "owner":
            # Get owner's properties
            owner_properties = db.query(Property).filter(Property.owner_id == current_user.id).all()
            property_ids = [p.id for p in owner_properties]
            
            # Get available units from owner's properties
            available_units = db.query(Unit).filter(
                Unit.property_id.in_(property_ids),
                Unit.status == UnitStatus.AVAILABLE
            ).all()
        else:
            # Admin/Manager can see all available units
            available_units = db.query(Unit).filter(Unit.status == UnitStatus.AVAILABLE).all()
        
        # Format response
        units_data = []
        for unit in available_units:
            property_obj = db.query(Property).filter(Property.id == unit.property_id).first()
            units_data.append({
                "id": unit.id,
                "unit_number": unit.unit_number,
                "property_id": unit.property_id,
                "property_name": property_obj.name if property_obj else "Unknown",
                "property_address": f"{property_obj.address}, {property_obj.city}" if property_obj else "Unknown",
                "monthly_rent": float(unit.monthly_rent),
                "bedrooms": unit.bedrooms,
                "bathrooms": unit.bathrooms,
                "unit_type": unit.unit_type.value,
                "floor": unit.floor,
                "amenities": unit.amenities,
                "description": unit.description
            })
        
        return units_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching available units: {str(e)}"
        )

@router.post("/", response_model=InspectionResponse)
async def create_inspection(
    inspection: InspectionCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new inspection for a rental unit"""
    try:
        # Verify unit exists and user has access
        unit = db.query(Unit).filter(Unit.id == inspection.unit_id).first()
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unit not found"
            )
        
        # CRITICAL: Only allow inspections for units that are AVAILABLE for rent
        if unit.status != UnitStatus.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inspections can only be scheduled for units that are available for rent. This unit is currently {unit.status.value}."
            )
        
        # Check if user has access to this unit
        if current_user.role == "owner":
            property_obj = db.query(Property).filter(Property.id == unit.property_id).first()
            if not property_obj or property_obj.owner_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Get property information
        property_obj = db.query(Property).filter(Property.id == unit.property_id).first()
        
        # Create new inspection
        new_inspection = {
            "id": len(inspections_db) + 1,
            "unit_id": inspection.unit_id,
            "unit_number": unit.unit_number,
            "property_name": property_obj.name if property_obj else "Unknown",
            "property_address": f"{property_obj.address}, {property_obj.city}" if property_obj else "Unknown",
            "inspection_date": inspection.inspection_date.isoformat(),
            "inspection_type": inspection.inspection_type,
            "inspector_name": inspection.inspector_name,
            "status": inspection.status,
            "notes": inspection.notes,
            "findings": inspection.findings,
            "recommendations": inspection.recommendations,
            "monthly_rent": float(unit.monthly_rent),
            "bedrooms": unit.bedrooms,
            "bathrooms": unit.bathrooms,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        inspections_db.append(new_inspection)
        
        return new_inspection
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating inspection: {str(e)}"
        )

@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection(
    inspection_id: int,
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get a specific inspection by ID"""
    try:
        inspection = next((i for i in inspections_db if i["id"] == inspection_id), None)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection not found"
            )
        
        # Check access permissions
        if current_user.role == "owner":
            unit = db.query(Unit).filter(Unit.id == inspection["unit_id"]).first()
            if unit:
                property_obj = db.query(Property).filter(Property.id == unit.property_id).first()
                if not property_obj or property_obj.owner_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied"
                    )
        
        return inspection
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching inspection: {str(e)}"
        )

@router.put("/{inspection_id}", response_model=InspectionResponse)
async def update_inspection(
    inspection_id: int,
    inspection_update: InspectionUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update an existing inspection"""
    try:
        inspection = next((i for i in inspections_db if i["id"] == inspection_id), None)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection not found"
            )
        
        # Check access permissions
        if current_user.role == "owner":
            unit = db.query(Unit).filter(Unit.id == inspection["unit_id"]).first()
            if unit:
                property_obj = db.query(Property).filter(Property.id == unit.property_id).first()
                if not property_obj or property_obj.owner_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied"
                    )
        
        # Update inspection
        update_data = inspection_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                inspection[key] = value
        
        inspection["updated_at"] = datetime.utcnow().isoformat()
        
        return inspection
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating inspection: {str(e)}"
        )

@router.delete("/{inspection_id}")
async def delete_inspection(
    inspection_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete an inspection"""
    try:
        inspection = next((i for i in inspections_db if i["id"] == inspection_id), None)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection not found"
            )
        
        # Check access permissions
        if current_user.role == "owner":
            unit = db.query(Unit).filter(Unit.id == inspection["unit_id"]).first()
            if unit:
                property_obj = db.query(Property).filter(Property.id == unit.property_id).first()
                if not property_obj or property_obj.owner_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied"
                    )
        
        # Remove inspection
        inspections_db.remove(inspection)
        
        return {"message": "Inspection deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting inspection: {str(e)}"
        )

@router.get("/summary/stats", response_model=dict)
async def get_inspection_stats(
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get inspection statistics"""
    try:
        # Filter inspections based on user role
        if current_user.role == "owner":
            owner_properties = db.query(Property).filter(Property.owner_id == current_user.id).all()
            property_ids = [p.id for p in owner_properties]
            filtered_inspections = [
                inspection for inspection in inspections_db
                if any(unit.property_id in property_ids for unit in db.query(Unit).filter(Unit.id == inspection["unit_id"]))
            ]
        else:
            filtered_inspections = inspections_db
        
        # Calculate statistics
        stats = {
            "total_inspections": len(filtered_inspections),
            "scheduled": len([i for i in filtered_inspections if i["status"] == "scheduled"]),
            "completed": len([i for i in filtered_inspections if i["status"] == "completed"]),
            "cancelled": len([i for i in filtered_inspections if i["status"] == "cancelled"]),
            "in_progress": len([i for i in filtered_inspections if i["status"] == "in_progress"]),
            "routine": len([i for i in filtered_inspections if i["inspection_type"] == "routine"]),
            "move_in": len([i for i in filtered_inspections if i["inspection_type"] == "move_in"]),
            "move_out": len([i for i in filtered_inspections if i["inspection_type"] == "move_out"]),
            "emergency": len([i for i in filtered_inspections if i["inspection_type"] == "emergency"])
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching inspection stats: {str(e)}"
        )
