from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.utility import Utility
from ..schemas.utility import UtilityCreate, UtilityUpdate

class UtilityCRUD:
    def create_utility(self, db: Session, utility: UtilityCreate) -> Utility:
        db_utility = Utility(
            property_id=utility.property_id,
            utility_type=utility.utility_type,
            provider_name=utility.provider_name,
            account_number=utility.account_number,
            monthly_cost=utility.monthly_cost,
            is_included_in_rent=utility.is_included_in_rent,
            description=utility.description
        )
        db.add(db_utility)
        db.commit()
        db.refresh(db_utility)
        return db_utility
    
    def get_utility_by_id(self, db: Session, utility_id: int) -> Optional[Utility]:
        return db.query(Utility).filter(Utility.id == utility_id).first()
    
    def get_utilities_by_property(self, db: Session, property_id: int, skip: int = 0, limit: int = 100) -> List[Utility]:
        return db.query(Utility).filter(Utility.property_id == property_id).offset(skip).limit(limit).all()
    
    def get_utilities_by_type(self, db: Session, utility_type: str, skip: int = 0, limit: int = 100) -> List[Utility]:
        if utility_type == "all":
            return db.query(Utility).offset(skip).limit(limit).all()
        return db.query(Utility).filter(Utility.utility_type == utility_type).offset(skip).limit(limit).all()
    
    def get_utilities_by_owner(self, db: Session, owner_id: int, skip: int = 0, limit: int = 1000) -> List[Utility]:
        """Get all utilities for properties owned by a specific owner."""
        from sqlalchemy.orm import joinedload
        from ..models.property import Property
        
        return db.query(Utility).options(
            joinedload(Utility.property)
        ).join(Property).filter(Property.owner_id == owner_id).offset(skip).limit(limit).all()
    
    def update_utility(self, db: Session, utility_id: int, utility_update: UtilityUpdate) -> Optional[Utility]:
        db_utility = self.get_utility_by_id(db, utility_id)
        if not db_utility:
            return None
        
        update_data = utility_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_utility, field, value)
        
        db_utility.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_utility)
        return db_utility
    
    def delete_utility(self, db: Session, utility_id: int) -> bool:
        db_utility = self.get_utility_by_id(db, utility_id)
        if not db_utility:
            return False
        
        db.delete(db_utility)
        db.commit()
        return True

utility_crud = UtilityCRUD()
