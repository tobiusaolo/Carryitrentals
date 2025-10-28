from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.inspection_booking import InspectionBooking
from ..schemas.inspection_booking import InspectionBookingCreate, InspectionBookingUpdate

class InspectionBookingCRUD:
    def create_inspection_booking(self, db: Session, booking: InspectionBookingCreate) -> InspectionBooking:
        db_booking = InspectionBooking(
            unit_id=booking.unit_id,
            tenant_id=booking.tenant_id,
            owner_id=booking.owner_id,
            booking_date=booking.booking_date,
            preferred_time_slot=booking.preferred_time_slot,
            contact_phone=booking.contact_phone,
            contact_email=booking.contact_email,
            message=booking.message,
            status=booking.status,
            notes=booking.notes
        )
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        return db_booking
    
    def get_inspection_booking_by_id(self, db: Session, booking_id: int) -> Optional[InspectionBooking]:
        return db.query(InspectionBooking).filter(InspectionBooking.id == booking_id).first()
    
    def get_bookings_by_unit(self, db: Session, unit_id: int, skip: int = 0, limit: int = 100) -> List[InspectionBooking]:
        return db.query(InspectionBooking).filter(InspectionBooking.unit_id == unit_id).offset(skip).limit(limit).all()
    
    def get_bookings_by_tenant(self, db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[InspectionBooking]:
        return db.query(InspectionBooking).filter(InspectionBooking.tenant_id == tenant_id).offset(skip).limit(limit).all()
    
    def get_bookings_by_owner(self, db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[InspectionBooking]:
        return db.query(InspectionBooking).filter(InspectionBooking.owner_id == owner_id).offset(skip).limit(limit).all()
    
    def get_bookings_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[InspectionBooking]:
        return db.query(InspectionBooking).filter(InspectionBooking.status == status).offset(skip).limit(limit).all()
    
    def get_pending_bookings(self, db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[InspectionBooking]:
        return db.query(InspectionBooking).filter(
            InspectionBooking.owner_id == owner_id,
            InspectionBooking.status == "pending"
        ).offset(skip).limit(limit).all()
    
    def update_inspection_booking(self, db: Session, booking_id: int, booking_update: InspectionBookingUpdate) -> Optional[InspectionBooking]:
        db_booking = self.get_inspection_booking_by_id(db, booking_id)
        if not db_booking:
            return None
        
        update_data = booking_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_booking, field, value)
        
        db_booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_booking)
        return db_booking
    
    def delete_inspection_booking(self, db: Session, booking_id: int) -> bool:
        db_booking = self.get_inspection_booking_by_id(db, booking_id)
        if not db_booking:
            return False
        
        db.delete(db_booking)
        db.commit()
        return True

inspection_booking_crud = InspectionBookingCRUD()










