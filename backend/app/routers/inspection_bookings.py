from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models.inspection_booking import InspectionBooking
from ..models.additional_service import AdditionalService
from ..schemas.inspection_booking import PublicInspectionBookingCreate, PublicInspectionBookingResponse
from ..models.enums import InspectionStatus

router = APIRouter(prefix="/inspection-bookings", tags=["Inspection Bookings"])

@router.post("/public", response_model=PublicInspectionBookingResponse, status_code=status.HTTP_201_CREATED)
async def create_public_inspection_booking(
    booking: PublicInspectionBookingCreate,
    db: Session = Depends(get_db)
):
    """
    Create a public inspection booking (no login required).
    Used for potential tenants to book inspections for rental units.
    Supports selection of additional services (moving, packaging, cleaning).
    """
    try:
        # Create the inspection booking
        db_booking = InspectionBooking(
            rental_unit_id=booking.rental_unit_id,
            contact_name=booking.contact_name,
            contact_phone=booking.contact_phone,
            contact_email=booking.contact_email,
            booking_date=booking.booking_date,
            preferred_time_slot=booking.preferred_time_slot,
            message=booking.message,
            status=InspectionStatus.PENDING,
            tenant_id=None,  # No tenant ID for public bookings
            owner_id=None,  # Will be assigned later if needed
            unit_id=None  # Only rental_unit_id is used
        )
        
        db.add(db_booking)
        db.flush()  # Flush to get the booking ID
        
        # Add selected additional services
        if booking.additional_service_ids:
            services = db.query(AdditionalService).filter(
                AdditionalService.id.in_(booking.additional_service_ids),
                AdditionalService.is_active == True
            ).all()
            
            db_booking.additional_services = services
        
        db.commit()
        db.refresh(db_booking)
        
        return db_booking
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating inspection booking: {str(e)}"
        )

@router.get("/public", response_model=List[PublicInspectionBookingResponse])
async def get_public_inspection_bookings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all public inspection bookings (for testing/admin purposes).
    """
    try:
        bookings = db.query(InspectionBooking).filter(
            InspectionBooking.rental_unit_id.isnot(None)
        ).offset(skip).limit(limit).all()
        
        return bookings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching inspection bookings: {str(e)}"
        )

