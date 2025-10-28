from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from ..models.unit import Unit
from ..schemas.unit import UnitCreate, UnitUpdate

class UnitCRUD:
    def create_unit(self, db: Session, unit: UnitCreate) -> Unit:
        db_unit = Unit(
            unit_number=unit.unit_number,
            unit_type=unit.unit_type,
            property_id=unit.property_id,
            floor=unit.floor,
            bedrooms=unit.bedrooms,
            bathrooms=unit.bathrooms,
            monthly_rent=unit.monthly_rent,
            status=unit.status,
            description=unit.description,
            amenities=unit.amenities,
            images=unit.images
        )
        db.add(db_unit)
        db.commit()
        db.refresh(db_unit)
        return db_unit
    
    def get_unit_by_id(self, db: Session, unit_id: int) -> Optional[Unit]:
        return db.query(Unit).options(joinedload(Unit.property)).filter(Unit.id == unit_id).first()
    
    def get_units_by_property(self, db: Session, property_id: int, skip: int = 0, limit: int = 100) -> List[Unit]:
        return db.query(Unit).options(joinedload(Unit.property)).filter(Unit.property_id == property_id).offset(skip).limit(limit).all()
    
    def get_available_units(self, db: Session, skip: int = 0, limit: int = 100) -> List[Unit]:
        return db.query(Unit).options(joinedload(Unit.property)).filter(Unit.status == "available").offset(skip).limit(limit).all()
    
    def get_units_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Unit]:
        return db.query(Unit).options(joinedload(Unit.property)).filter(Unit.status == status).offset(skip).limit(limit).all()
    
    def get_all_units(self, db: Session, skip: int = 0, limit: int = 100) -> List[Unit]:
        return db.query(Unit).options(joinedload(Unit.property)).offset(skip).limit(limit).all()
    
    def get_units_by_owner(self, db: Session, owner_id: int, skip: int = 0, limit: int = 1000) -> List[Unit]:
        """Get all units for properties owned by a specific owner."""
        from ..models.property import Property
        return db.query(Unit).options(joinedload(Unit.property)).join(Property).filter(Property.owner_id == owner_id).offset(skip).limit(limit).all()
    
    def update_unit(self, db: Session, unit_id: int, unit_update: UnitUpdate) -> Optional[Unit]:
        db_unit = self.get_unit_by_id(db, unit_id)
        if not db_unit:
            return None
        
        update_data = unit_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_unit, field, value)
        
        db_unit.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_unit)
        return db_unit
    
    def delete_unit(self, db: Session, unit_id: int) -> bool:
        db_unit = self.get_unit_by_id(db, unit_id)
        if not db_unit:
            return False
        
        db.delete(db_unit)
        db.commit()
        return True
    
    def search_units(self, db: Session, query: str, skip: int = 0, limit: int = 100) -> List[Unit]:
        return db.query(Unit).filter(
            Unit.unit_number.ilike(f"%{query}%") |
            Unit.description.ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()

unit_crud = UnitCRUD()
