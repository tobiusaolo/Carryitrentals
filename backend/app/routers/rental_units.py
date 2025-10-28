from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.rental_unit import RentalUnitCreate, RentalUnitResponse, RentalUnitUpdate
from ..schemas.inspection_booking import (
    InspectionBookingCreate, InspectionBookingResponse, InspectionBookingUpdate,
    PublicInspectionBookingCreate, PublicInspectionBookingResponse
)
from ..crud.rental_unit import (
    create_rental_unit, get_rental_unit, get_rental_units, 
    update_rental_unit, delete_rental_unit
)
from ..crud.property import property_crud
from ..crud.inspection_booking import inspection_booking_crud
from ..services.file_upload import file_upload_service
from ..models.user import User

router = APIRouter(prefix="/rental-units", tags=["Rental Units"])

@router.get("/public", response_model=List[RentalUnitResponse])
async def get_public_rental_units(
    db: Session = Depends(get_db)
):
    """Get all available rental units - PUBLIC endpoint (no auth required)."""
    from ..models.inspection_booking import InspectionBooking
    
    # Get all rental units
    rental_units = get_rental_units(db, skip=0, limit=1000)
    
    # Only show available units
    available_units = [u for u in rental_units if u.status.value == 'available']
    
    # Add agent name and inspection count to unit data
    result = []
    for unit in available_units:
        # Get inspection bookings count for this unit
        inspection_count = db.query(InspectionBooking).filter(
            InspectionBooking.rental_unit_id == unit.id
        ).count()
        
        unit_dict = unit.__dict__.copy()
        unit_dict['agent_name'] = unit.agent.name if unit.agent else None
        unit_dict['inspection_bookings_count'] = inspection_count
        result.append(unit_dict)
    
    return result

@router.post("/public/book-inspection", response_model=PublicInspectionBookingResponse)
async def book_public_inspection(
    booking: PublicInspectionBookingCreate,
    db: Session = Depends(get_db)
):
    """
    Book an inspection for a rental unit - PUBLIC endpoint (no auth required).
    
    Inspection fees: UGX 30,000 per property.
    Note: If multiple properties are chosen for inspection, fees will be negotiated at the inspection day.
    """
    from ..models.inspection_booking import InspectionBooking
    from ..models.rental_unit import RentalUnit
    
    # Verify rental unit exists
    rental_unit = db.query(RentalUnit).filter(RentalUnit.id == booking.rental_unit_id).first()
    if not rental_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental unit not found"
        )
    
    # Create inspection booking without requiring login
    new_booking = InspectionBooking(
        rental_unit_id=booking.rental_unit_id,
        contact_name=booking.contact_name,
        contact_phone=booking.contact_phone,
        contact_email=booking.contact_email,
        booking_date=booking.booking_date,
        preferred_time_slot=booking.preferred_time_slot,
        message=booking.message,
        tenant_id=None,  # No login required
        owner_id=rental_unit.agent_id if rental_unit.agent_id else None,
        status="pending"
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return new_booking

@router.post("/", response_model=RentalUnitResponse)
async def create_rental_unit_endpoint(
    rental_unit: RentalUnitCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new standalone rental unit."""
    from ..models.agent import Agent
    
    # If user is agent, find their agent record and set agent_id
    if current_user.role == 'agent':
        agent = db.query(Agent).filter(
            (Agent.email == current_user.email) | (Agent.phone == current_user.phone)
        ).first()
        
        if agent:
            rental_unit.agent_id = agent.id
    
    return create_rental_unit(db, rental_unit)

@router.get("/", response_model=List[RentalUnitResponse])
async def get_rental_units_endpoint(
    unit_type: Optional[str] = None,
    status: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all standalone rental units with filtering options."""
    from ..models.agent import Agent
    
    rental_units = get_rental_units(db, skip=skip, limit=limit)
    
    # If user is agent, filter to show units uploaded by or assigned to them
    if current_user.role == 'agent':
        agent = db.query(Agent).filter(
            (Agent.email == current_user.email) | (Agent.phone == current_user.phone)
        ).first()
        
        if agent:
            # Show units where this agent is assigned (uploaded by them or assigned to them)
            rental_units = [u for u in rental_units if u.agent_id == agent.id]
    
    # Apply filters
    from ..models.inspection_booking import InspectionBooking
    
    filtered_units = []
    for unit in rental_units:
        # Filter by unit type
        if unit_type and unit.unit_type != unit_type:
            continue
        
        # Filter by status
        if status and unit.status != status:
            continue
        
        # Filter by price range
        if min_price and float(unit.monthly_rent) < min_price:
            continue
        if max_price and float(unit.monthly_rent) > max_price:
            continue
        
        # Get inspection bookings count for this unit
        inspection_count = db.query(InspectionBooking).filter(
            InspectionBooking.rental_unit_id == unit.id
        ).count()
        
        # Add agent name and inspection count to unit data
        unit_dict = unit.__dict__.copy()
        unit_dict['agent_name'] = unit.agent.name if unit.agent else None
        unit_dict['inspection_bookings_count'] = inspection_count
        filtered_units.append(unit_dict)
    
    return filtered_units

@router.get("/{unit_id}", response_model=RentalUnitResponse)
async def get_rental_unit_endpoint(
    unit_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific rental unit details."""
    rental_unit = get_rental_unit(db, unit_id)
    if not rental_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental unit not found"
        )
    
    # Add agent name to response
    unit_dict = rental_unit.__dict__.copy()
    unit_dict['agent_name'] = rental_unit.agent.name if rental_unit.agent else None
    return unit_dict

@router.put("/{unit_id}", response_model=RentalUnitResponse)
async def update_rental_unit_endpoint(
    unit_id: int,
    unit_update: RentalUnitUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update rental unit details."""
    from ..models.agent import Agent
    
    rental_unit = get_rental_unit(db, unit_id)
    if not rental_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental unit not found"
        )
    
    # Check if agent owns this unit
    if current_user.role == 'agent':
        agent = db.query(Agent).filter(
            (Agent.email == current_user.email) | (Agent.phone == current_user.phone)
        ).first()
        
        if not agent or rental_unit.agent_id != agent.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only update your own rental units"
            )
    
    updated_unit = update_rental_unit(db, unit_id, unit_update)
    if not updated_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental unit not found"
        )
    
    return updated_unit

@router.patch("/{unit_id}/status")
async def change_unit_status(
    unit_id: int,
    new_status: str,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Change unit status (available, occupied, maintenance, renovation)."""
    unit = unit_crud.get_unit_by_id(db, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check access permissions
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Validate status
    valid_statuses = ["available", "occupied", "maintenance", "renovation"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    unit_update = UnitUpdate(status=new_status)
    updated_unit = unit_crud.update_unit(db, unit_id, unit_update)
    
    return {"message": f"Unit status changed to {new_status}", "unit": updated_unit}

@router.delete("/{unit_id}")
async def delete_rental_unit_endpoint(
    unit_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete rental unit."""
    from ..models.agent import Agent
    
    rental_unit = get_rental_unit(db, unit_id)
    if not rental_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental unit not found"
        )
    
    # Check if agent owns this unit
    if current_user.role == 'agent':
        agent = db.query(Agent).filter(
            (Agent.email == current_user.email) | (Agent.phone == current_user.phone)
        ).first()
        
        if not agent or rental_unit.agent_id != agent.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only delete your own rental units"
            )
    
    success = delete_rental_unit(db, unit_id)
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
    """Upload images for rental unit (5-10 images required)."""
    unit = get_rental_unit(db, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental unit not found"
        )
    
    # For rental units, only admin can upload images
    # Owners can upload images for their own rental units
    if current_user.role == "owner":
        # For now, allow all owners to upload images to any rental unit
        # You can add more specific permission logic here if needed
        pass
    
    # Validate number of images
    if len(files) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 5 images are required"
        )
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 images allowed"
        )
    
    # Upload images
    uploaded_files = []
    for file in files:
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} is not an image"
            )
        
        file_path = await file_upload_service.save_image(file, "unit_images")
        uploaded_files.append(file_path)
    
    # Update unit with image paths
    images_str = ",".join(uploaded_files)
    unit_update = RentalUnitUpdate(images=images_str)
    update_rental_unit(db, unit_id, unit_update)
    
    return {
        "message": f"Successfully uploaded {len(uploaded_files)} images",
        "uploaded_files": uploaded_files
    }

# Inspection Booking Endpoints

@router.post("/{unit_id}/book-inspection", response_model=InspectionBookingResponse)
async def book_inspection(
    unit_id: int,
    booking: InspectionBookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Book an inspection for a rental unit."""
    unit = unit_crud.get_unit_by_id(db, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Get property owner
    property = property_crud.get_property_by_id(db, unit.property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Set tenant and owner IDs
    booking.tenant_id = current_user.id
    booking.owner_id = property.owner_id
    booking.unit_id = unit_id
    
    return inspection_booking_crud.create_inspection_booking(db, booking)

@router.get("/{unit_id}/inspections", response_model=List[InspectionBookingResponse])
async def get_unit_inspections(
    unit_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all inspection bookings for a unit."""
    unit = unit_crud.get_unit_by_id(db, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check access permissions
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return inspection_booking_crud.get_bookings_by_unit(db, unit_id)

@router.put("/inspections/{booking_id}", response_model=InspectionBookingResponse)
async def update_inspection_booking(
    booking_id: int,
    booking_update: InspectionBookingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update inspection booking (owner can confirm/cancel, tenant can modify)."""
    booking = inspection_booking_crud.get_inspection_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection booking not found"
        )
    
    # Check access permissions
    if current_user.role == "tenant" and booking.tenant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "owner" and booking.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_booking = inspection_booking_crud.update_inspection_booking(db, booking_id, booking_update)
    if not updated_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection booking not found"
        )
    
    return updated_booking

@router.delete("/inspections/{booking_id}")
async def cancel_inspection_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel inspection booking."""
    booking = inspection_booking_crud.get_inspection_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection booking not found"
        )
    
    # Check access permissions
    if current_user.role == "tenant" and booking.tenant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "owner" and booking.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = inspection_booking_crud.delete_inspection_booking(db, booking_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection booking not found"
        )
    
    return {"message": "Inspection booking cancelled successfully"}

@router.get("/inspections/my-bookings", response_model=List[InspectionBookingResponse])
async def get_my_inspection_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's inspection bookings."""
    if current_user.role == "tenant":
        return inspection_booking_crud.get_bookings_by_tenant(db, current_user.id)
    elif current_user.role == "owner":
        return inspection_booking_crud.get_bookings_by_owner(db, current_user.id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

@router.get("/inspections/pending", response_model=List[InspectionBookingResponse])
async def get_pending_inspections(
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get pending inspection bookings for owner."""
    if current_user.role == "owner":
        return inspection_booking_crud.get_pending_bookings(db, current_user.id)
    else:
        return inspection_booking_crud.get_bookings_by_status(db, "pending")

