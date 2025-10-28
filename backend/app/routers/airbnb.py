from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.airbnb import (
    AirbnbCreate, AirbnbUpdate, AirbnbResponse,
    AirbnbBookingCreate, AirbnbBookingUpdate, AirbnbBookingResponse
)
from ..crud import airbnb as airbnb_crud
from ..models.user import User
from ..models.airbnb_booking import AirbnbBooking
from ..services.mobile_money_service import mobile_money_service
from ..services.africas_talking import africas_talking_service
from pydantic import BaseModel

router = APIRouter(prefix="/airbnb", tags=["Airbnb"])

# Public endpoint - Get all available Airbnbs
@router.get("/public", response_model=List[AirbnbResponse])
async def get_public_airbnbs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all available Airbnb listings - PUBLIC (no auth required)."""
    from sqlalchemy import or_
    
    airbnbs = airbnb_crud.get_available_airbnbs(db, skip=skip, limit=limit)
    
    # Add owner name, bookings count, and booking status
    result = []
    for airbnb in airbnbs:
        # Check if property has any approved/confirmed bookings
        has_approved_booking = db.query(AirbnbBooking).filter(
            AirbnbBooking.airbnb_id == airbnb.id,
            or_(
                AirbnbBooking.status == 'approved',
                AirbnbBooking.status == 'confirmed'
            )
        ).first() is not None
        
        airbnb_dict = airbnb.__dict__.copy()
        airbnb_dict['owner_name'] = f"{airbnb.owner.first_name} {airbnb.owner.last_name}" if airbnb.owner else None
        airbnb_dict['bookings_count'] = len(airbnb.bookings) if airbnb.bookings else 0
        airbnb_dict['is_booked'] = has_approved_booking
        result.append(airbnb_dict)
    
    return result

# Create Airbnb listing
@router.post("/", response_model=AirbnbResponse)
async def create_airbnb_listing(
    airbnb: AirbnbCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new Airbnb listing. Only owners and admins can create."""
    if current_user.role not in ['owner', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only property owners and admins can create Airbnb listings"
        )
    
    # Create Airbnb with owner_id
    return airbnb_crud.create_airbnb(db, airbnb, owner_id=current_user.id)

# Get all Airbnbs
@router.get("/", response_model=List[AirbnbResponse])
async def get_airbnbs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get Airbnb listings. Owners see their own, admins see all."""
    if current_user.role == 'admin':
        airbnbs = airbnb_crud.get_airbnbs(db, skip=skip, limit=limit)
    else:
        # Owners see only their listings
        airbnbs = airbnb_crud.get_airbnbs(db, skip=skip, limit=limit, owner_id=current_user.id)
    
    # Add owner name and bookings count
    result = []
    for airbnb in airbnbs:
        airbnb_dict = airbnb.__dict__.copy()
        airbnb_dict['owner_name'] = f"{airbnb.owner.first_name} {airbnb.owner.last_name}" if airbnb.owner else None
        airbnb_dict['bookings_count'] = len(airbnb.bookings) if airbnb.bookings else 0
        result.append(airbnb_dict)
    
    return result

# Get specific Airbnb
@router.get("/{airbnb_id}", response_model=AirbnbResponse)
async def get_airbnb(
    airbnb_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific Airbnb by ID."""
    airbnb = airbnb_crud.get_airbnb(db, airbnb_id)
    if not airbnb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airbnb listing not found"
        )
    
    # Check ownership (unless admin)
    if current_user.role != 'admin' and airbnb.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this listing"
        )
    
    airbnb_dict = airbnb.__dict__.copy()
    airbnb_dict['owner_name'] = f"{airbnb.owner.first_name} {airbnb.owner.last_name}" if airbnb.owner else None
    airbnb_dict['bookings_count'] = len(airbnb.bookings) if airbnb.bookings else 0
    
    return airbnb_dict

# Update Airbnb
@router.put("/{airbnb_id}", response_model=AirbnbResponse)
async def update_airbnb_listing(
    airbnb_id: int,
    airbnb_update: AirbnbUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an Airbnb listing. Only owner or admin."""
    airbnb = airbnb_crud.get_airbnb(db, airbnb_id)
    if not airbnb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airbnb listing not found"
        )
    
    # Check ownership
    if current_user.role != 'admin' and airbnb.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    return airbnb_crud.update_airbnb(db, airbnb_id, airbnb_update)

# Delete Airbnb
@router.delete("/{airbnb_id}")
async def delete_airbnb_listing(
    airbnb_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an Airbnb listing. Only owner or admin."""
    airbnb = airbnb_crud.get_airbnb(db, airbnb_id)
    if not airbnb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airbnb listing not found"
        )
    
    # Check ownership
    if current_user.role != 'admin' and airbnb.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    success = airbnb_crud.delete_airbnb(db, airbnb_id)
    if success:
        return {"message": "Airbnb listing deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to delete listing"
    )

# Booking endpoints
@router.post("/bookings", response_model=AirbnbBookingResponse)
async def create_airbnb_booking(
    booking: AirbnbBookingCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new Airbnb booking - PUBLIC endpoint.
    
    Booking process:
    1. Creates booking with 'pending' status
    2. Calculates total amount based on nights × price_per_night
    3. Requires 50% prepayment
    4. Status changes to 'confirmed' after prepayment
    """
    # Verify Airbnb exists and is available
    airbnb = airbnb_crud.get_airbnb(db, booking.airbnb_id)
    if not airbnb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airbnb listing not found"
        )
    
    if airbnb.is_available != 'available':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This Airbnb is not available for booking"
        )
    
    # Check guest capacity
    if booking.number_of_guests > airbnb.max_guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum guests allowed: {airbnb.max_guests}"
        )
    
    # Create booking with prepayment calculations
    try:
        new_booking = airbnb_crud.create_booking(db, booking, airbnb)
        return new_booking
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

class PaymentInitiateRequest(BaseModel):
    payment_phone: str
    payment_method: str = 'mtn_mobile_money'

@router.post("/bookings/{booking_id}/prepayment")
async def initiate_airbnb_prepayment(
    booking_id: int,
    payment_request: PaymentInitiateRequest,
    db: Session = Depends(get_db)
):
    """
    Initiate prepayment for Airbnb booking via Mobile Money.
    
    Uses admin-configured payment numbers from system settings.
    
    Following internal payment standard:
    - Prepayment required: 50% of total amount
    - Payment methods: MTN Mobile Money, Airtel Money
    - Status: pending → confirmed after successful payment
    """
    # Get booking
    booking = airbnb_crud.get_booking(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if already paid
    if booking.payment_status == 'completed':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prepayment already completed"
        )
    
    # Get Airbnb details
    airbnb = airbnb_crud.get_airbnb(db, booking.airbnb_id)
    if not airbnb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airbnb listing not found"
        )
    
    # Generate unique transaction ID
    import uuid
    transaction_ref = f"AIRBNB-{booking_id}-{uuid.uuid4().hex[:8].upper()}"
    
    # Initiate mobile money payment using the new service
    payment_result = await mobile_money_service.initiate_payment(
        db=db,
        amount=float(booking.prepayment_amount),
        customer_phone=payment_request.payment_phone,
        payment_method=payment_request.payment_method,
        reference=transaction_ref,
        description=f"Airbnb Prepayment: {airbnb.title} - {booking.guest_name}"
    )
    
    if payment_result["success"]:
        # Update booking with payment details
        booking.payment_method = payment_request.payment_method
        booking.payment_reference = transaction_ref
        booking.payment_status = 'pending'
        db.commit()
        
        return {
            "success": True,
            "message": payment_result.get("message", "Prepayment request sent successfully"),
            "transaction_id": transaction_ref,
            "prepayment_amount": float(booking.prepayment_amount),
            "currency": booking.currency,
            "status": "pending",
            "provider": payment_result.get("provider"),
            "merchant_number": payment_result.get("merchant_number"),
            "instructions": "Please approve the payment request on your phone to confirm the booking"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=payment_result.get("message", "Payment initiation failed")
        )

@router.post("/bookings/{booking_id}/confirm-payment")
async def confirm_airbnb_payment(
    booking_id: int,
    payment_reference: str,
    db: Session = Depends(get_db)
):
    """
    Confirm prepayment and update booking status.
    Called after successful mobile money payment or manual confirmation.
    """
    booking = airbnb_crud.get_booking(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Update booking status
    booking.payment_status = 'completed'
    booking.payment_date = datetime.utcnow()
    booking.status = 'confirmed'  # Booking confirmed after prepayment
    db.commit()
    db.refresh(booking)
    
    # Send SMS confirmation to guest
    airbnb = airbnb_crud.get_airbnb(db, booking.airbnb_id)
    if airbnb and booking.guest_phone:
        sms_message = f"""BOOKING CONFIRMED!

Property: {airbnb.title}
Location: {airbnb.location}
Check-in: {booking.check_in.strftime('%d %B %Y')}
Check-out: {booking.check_out.strftime('%d %B %Y')}
Nights: {booking.number_of_nights}
Guests: {booking.number_of_guests}

Prepayment: {booking.currency} {booking.prepayment_amount:,.0f} (PAID)
Remaining: {booking.currency} {booking.remaining_amount:,.0f} (Pay at check-in)

Thank you for booking with CarryIT!"""
        
        await africas_talking_service.send_sms(booking.guest_phone, sms_message, db)
    
    return {
        "success": True,
        "message": "Booking confirmed! SMS sent to guest.",
        "booking_id": booking.id,
        "status": booking.status,
        "payment_status": booking.payment_status
    }

@router.get("/{airbnb_id}/bookings", response_model=List[AirbnbBookingResponse])
async def get_airbnb_bookings(
    airbnb_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all bookings for an Airbnb. Only owner or admin."""
    airbnb = airbnb_crud.get_airbnb(db, airbnb_id)
    if not airbnb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airbnb listing not found"
        )
    
    # Check ownership
    if current_user.role != 'admin' and airbnb.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view bookings"
        )
    
    return airbnb_crud.get_bookings_by_airbnb(db, airbnb_id)

@router.put("/bookings/{booking_id}", response_model=AirbnbBookingResponse)
async def update_booking_status(
    booking_id: int,
    booking_update: AirbnbBookingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update booking status. Only owner or admin."""
    booking = airbnb_crud.get_booking(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    airbnb = airbnb_crud.get_airbnb(db, booking.airbnb_id)
    if current_user.role != 'admin' and airbnb.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this booking"
        )
    
    return airbnb_crud.update_booking(db, booking_id, booking_update)

