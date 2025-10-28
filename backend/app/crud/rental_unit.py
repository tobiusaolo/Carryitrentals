from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.rental_unit import RentalUnit
from ..schemas.rental_unit import RentalUnitCreate, RentalUnitUpdate

def create_rental_unit(db: Session, rental_unit: RentalUnitCreate):
    """Create a new rental unit."""
    db_rental_unit = RentalUnit(**rental_unit.model_dump())
    db.add(db_rental_unit)
    db.commit()
    db.refresh(db_rental_unit)
    return db_rental_unit

def get_rental_unit(db: Session, rental_unit_id: int):
    """Get rental unit by ID."""
    return db.query(RentalUnit).filter(RentalUnit.id == rental_unit_id).first()

def get_rental_units(db: Session, skip: int = 0, limit: int = 100):
    """Get all rental units with pagination."""
    return db.query(RentalUnit).offset(skip).limit(limit).all()

def get_available_rental_units(db: Session, skip: int = 0, limit: int = 100):
    """Get available rental units."""
    return db.query(RentalUnit).filter(RentalUnit.status == "available").offset(skip).limit(limit).all()

def update_rental_unit(db: Session, rental_unit_id: int, rental_unit_update: RentalUnitUpdate):
    """Update rental unit information."""
    db_rental_unit = db.query(RentalUnit).filter(RentalUnit.id == rental_unit_id).first()
    if db_rental_unit:
        update_data = rental_unit_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_rental_unit, key, value)
        db.commit()
        db.refresh(db_rental_unit)
    return db_rental_unit

def delete_rental_unit(db: Session, rental_unit_id: int):
    """Delete a rental unit."""
    db_rental_unit = db.query(RentalUnit).filter(RentalUnit.id == rental_unit_id).first()
    if db_rental_unit:
        db.delete(db_rental_unit)
        db.commit()
        return True
    return False

def get_rental_units_by_agent(db: Session, agent_id: int):
    """Get rental units assigned to a specific agent."""
    return db.query(RentalUnit).filter(RentalUnit.agent_id == agent_id).all()

def search_rental_units(db: Session, query: str, skip: int = 0, limit: int = 100):
    """Search rental units by title, description, or location."""
    return db.query(RentalUnit).filter(
        (RentalUnit.title.contains(query)) |
        (RentalUnit.description.contains(query)) |
        (RentalUnit.location.contains(query))
    ).offset(skip).limit(limit).all()
