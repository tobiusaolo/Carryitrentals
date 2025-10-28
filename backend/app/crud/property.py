from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.property import Property
from ..schemas.property import PropertyCreate, PropertyUpdate

class PropertyCRUD:
    def create_property(self, db: Session, property: PropertyCreate, owner_id: int) -> Property:
        db_property = Property(
            name=property.name,
            address=property.address,
            city=property.city,
            state=property.state,
            zip_code=property.zip_code,
            country=property.country,
            property_type=property.property_type,
            description=property.description,
            total_units=property.total_units,
            owner_id=owner_id
        )
        db.add(db_property)
        db.commit()
        db.refresh(db_property)
        return db_property
    
    def get_property_by_id(self, db: Session, property_id: int) -> Optional[Property]:
        return db.query(Property).filter(Property.id == property_id).first()
    
    def get_properties_by_owner(self, db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[Property]:
        return db.query(Property).filter(Property.owner_id == owner_id).offset(skip).limit(limit).all()
    
    def get_all_properties(self, db: Session, skip: int = 0, limit: int = 100) -> List[Property]:
        return db.query(Property).offset(skip).limit(limit).all()
    
    def update_property(self, db: Session, property_id: int, property_update: PropertyUpdate) -> Optional[Property]:
        db_property = self.get_property_by_id(db, property_id)
        if not db_property:
            return None
        
        update_data = property_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_property, field, value)
        
        db_property.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_property)
        return db_property
    
    def delete_property(self, db: Session, property_id: int) -> bool:
        db_property = self.get_property_by_id(db, property_id)
        if not db_property:
            return False
        
        db.delete(db_property)
        db.commit()
        return True
    
    def search_properties(self, db: Session, query: str, skip: int = 0, limit: int = 100) -> List[Property]:
        return db.query(Property).filter(
            Property.name.ilike(f"%{query}%") |
            Property.address.ilike(f"%{query}%") |
            Property.city.ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()

property_crud = PropertyCRUD()
