from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.unit_utility import UnitUtility
from ..schemas.unit_utility import UnitUtilityCreate, UnitUtilityUpdate

class UnitUtilityCRUD:
    def create_unit_utility(self, db: Session, utility: UnitUtilityCreate) -> UnitUtility:
        db_utility = UnitUtility(
            unit_id=utility.unit_id,
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
    
    def get_unit_utility_by_id(self, db: Session, utility_id: int) -> Optional[UnitUtility]:
        return db.query(UnitUtility).filter(UnitUtility.id == utility_id).first()
    
    def get_utilities_by_unit(self, db: Session, unit_id: int, skip: int = 0, limit: int = 100) -> List[UnitUtility]:
        return db.query(UnitUtility).filter(UnitUtility.unit_id == unit_id).offset(skip).limit(limit).all()
    
    def get_utilities_by_type(self, db: Session, utility_type: str, skip: int = 0, limit: int = 100) -> List[UnitUtility]:
        if utility_type == "all":
            return db.query(UnitUtility).offset(skip).limit(limit).all()
        return db.query(UnitUtility).filter(UnitUtility.utility_type == utility_type).offset(skip).limit(limit).all()
    
    def get_utilities_by_owner(self, db: Session, owner_id: int, skip: int = 0, limit: int = 1000) -> List[UnitUtility]:
        """Get all unit utilities for units in properties owned by a specific owner."""
        from sqlalchemy.orm import joinedload
        from ..models.property import Property
        from ..models.unit import Unit
        
        return db.query(UnitUtility).options(
            joinedload(UnitUtility.unit)
        ).join(Unit).join(Property).filter(Property.owner_id == owner_id).offset(skip).limit(limit).all()
    
    def update_unit_utility(self, db: Session, utility_id: int, utility_update: UnitUtilityUpdate) -> Optional[UnitUtility]:
        db_utility = self.get_unit_utility_by_id(db, utility_id)
        if not db_utility:
            return None
        
        update_data = utility_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_utility, field, value)
        
        db_utility.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_utility)
        return db_utility
    
    def delete_unit_utility(self, db: Session, utility_id: int) -> bool:
        db_utility = self.get_unit_utility_by_id(db, utility_id)
        if not db_utility:
            return False
        
        db.delete(db_utility)
        db.commit()
        return True

unit_utility_crud = UnitUtilityCRUD()



