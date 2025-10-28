from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.airbnb import Airbnb
from ..models.airbnb_booking import AirbnbBooking
from ..schemas.airbnb import AirbnbCreate, AirbnbUpdate, AirbnbBookingCreate, AirbnbBookingUpdate

def create_airbnb(db: Session, airbnb: AirbnbCreate, owner_id: int) -> Airbnb:
    """Create a new Airbnb listing."""
    airbnb_data = airbnb.dict()
    airbnb_data['owner_id'] = owner_id
    db_airbnb = Airbnb(**airbnb_data)
    db.add(db_airbnb)
    db.commit()
    db.refresh(db_airbnb)
    return db_airbnb

def get_airbnb(db: Session, airbnb_id: int) -> Optional[Airbnb]:
    """Get a specific Airbnb by ID."""
    return db.query(Airbnb).filter(Airbnb.id == airbnb_id).first()

def get_airbnbs(db: Session, skip: int = 0, limit: int = 100, owner_id: Optional[int] = None) -> List[Airbnb]:
    """Get all Airbnbs, optionally filtered by owner."""
    query = db.query(Airbnb)
    if owner_id:
        query = query.filter(Airbnb.owner_id == owner_id)
    return query.offset(skip).limit(limit).all()

def get_available_airbnbs(db: Session, skip: int = 0, limit: int = 100) -> List[Airbnb]:
    """Get all available Airbnbs for public viewing."""
    return db.query(Airbnb).filter(Airbnb.is_available == 'available').offset(skip).limit(limit).all()

def update_airbnb(db: Session, airbnb_id: int, airbnb_update: AirbnbUpdate) -> Optional[Airbnb]:
    """Update an Airbnb listing."""
    db_airbnb = get_airbnb(db, airbnb_id)
    if db_airbnb:
        update_data = airbnb_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_airbnb, field, value)
        db.commit()
        db.refresh(db_airbnb)
    return db_airbnb

def delete_airbnb(db: Session, airbnb_id: int) -> bool:
    """Delete an Airbnb listing."""
    db_airbnb = get_airbnb(db, airbnb_id)
    if db_airbnb:
        db.delete(db_airbnb)
        db.commit()
        return True
    return False

# Booking CRUD operations
def create_booking(db: Session, booking: AirbnbBookingCreate, airbnb: Airbnb) -> AirbnbBooking:
    """Create a new Airbnb booking with prepayment calculation."""
    from decimal import Decimal
    
    # Calculate number of nights
    number_of_nights = (booking.check_out - booking.check_in).days
    if number_of_nights < 1:
        raise ValueError("Check-out must be after check-in")
    
    # Calculate total amount
    total_amount = Decimal(str(airbnb.price_per_night)) * number_of_nights
    
    # Calculate prepayment (50% by default)
    prepayment_percentage = Decimal("50.00")
    prepayment_amount = total_amount * (prepayment_percentage / 100)
    remaining_amount = total_amount - prepayment_amount
    
    # Process card details if card payment (store only last 4 digits for security)
    card_last_four = None
    card_brand = None
    if booking.payment_method_type == 'card' and booking.card_number:
        card_last_four = booking.card_number[-4:] if len(booking.card_number) >= 4 else None
        # Detect card brand (simple detection)
        if booking.card_number.startswith('4'):
            card_brand = 'Visa'
        elif booking.card_number.startswith('5'):
            card_brand = 'Mastercard'
        else:
            card_brand = 'Other'
    
    # Create booking with calculated values
    booking_dict = booking.dict(exclude={
        'payment_method', 'payment_method_type', 'payment_timing',
        'card_number', 'card_expiry', 'card_cvv', 'card_holder_name'
    })
    
    db_booking = AirbnbBooking(
        **booking_dict,
        number_of_nights=number_of_nights,
        total_amount=total_amount,
        currency=airbnb.currency.value if hasattr(airbnb.currency, 'value') else str(airbnb.currency),
        prepayment_required=True,
        prepayment_percentage=prepayment_percentage,
        prepayment_amount=prepayment_amount,
        remaining_amount=remaining_amount,
        payment_timing=booking.payment_timing,
        payment_method=booking.payment_method,
        payment_method_type=booking.payment_method_type,
        card_last_four=card_last_four,
        card_brand=card_brand,
        payment_status='pending',
        status='pending'  # Pending until prepayment is made
    )
    
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_booking(db: Session, booking_id: int) -> Optional[AirbnbBooking]:
    """Get a specific booking by ID."""
    return db.query(AirbnbBooking).filter(AirbnbBooking.id == booking_id).first()

def get_bookings_by_airbnb(db: Session, airbnb_id: int) -> List[AirbnbBooking]:
    """Get all bookings for a specific Airbnb."""
    return db.query(AirbnbBooking).filter(AirbnbBooking.airbnb_id == airbnb_id).all()

def update_booking(db: Session, booking_id: int, booking_update: AirbnbBookingUpdate) -> Optional[AirbnbBooking]:
    """Update a booking."""
    db_booking = get_booking(db, booking_id)
    if db_booking:
        update_data = booking_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_booking, field, value)
        db.commit()
        db.refresh(db_booking)
    return db_booking

def delete_booking(db: Session, booking_id: int) -> bool:
    """Delete a booking."""
    db_booking = get_booking(db, booking_id)
    if db_booking:
        db.delete(db_booking)
        db.commit()
        return True
    return False

