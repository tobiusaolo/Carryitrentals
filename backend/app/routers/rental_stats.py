from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import date

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..crud.property import property_crud
from ..crud.unit import unit_crud
from ..crud.inspection_booking import inspection_booking_crud
from ..models.user import User

router = APIRouter(prefix="/rental-stats", tags=["Rental Statistics"])

@router.get("/property/{property_id}")
async def get_property_rental_stats(
    property_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get rental statistics for a specific property."""
    property = property_crud.get_property_by_id(db, property_id)
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get all units for the property
    units = unit_crud.get_units_by_property(db, property_id)
    
    # Calculate statistics
    total_units = len(units)
    available_units = len([u for u in units if u.status == "available"])
    occupied_units = len([u for u in units if u.status == "occupied"])
    maintenance_units = len([u for u in units if u.status == "maintenance"])
    renovation_units = len([u for u in units if u.status == "renovation"])
    
    # Calculate rent statistics
    total_monthly_rent = sum(float(u.monthly_rent) for u in units)
    average_rent = total_monthly_rent / total_units if total_units > 0 else 0
    
    # Get inspection statistics
    total_inspections = 0
    pending_inspections = 0
    confirmed_inspections = 0
    completed_inspections = 0
    
    for unit in units:
        unit_inspections = inspection_booking_crud.get_bookings_by_unit(db, unit.id)
        total_inspections += len(unit_inspections)
        pending_inspections += len([i for i in unit_inspections if i.status == "pending"])
        confirmed_inspections += len([i for i in unit_inspections if i.status == "confirmed"])
        completed_inspections += len([i for i in unit_inspections if i.status == "completed"])
    
    return {
        "property_id": property_id,
        "property_name": property.name,
        "total_units": total_units,
        "unit_status": {
            "available": available_units,
            "occupied": occupied_units,
            "maintenance": maintenance_units,
            "renovation": renovation_units
        },
        "occupancy_rate": (occupied_units / total_units * 100) if total_units > 0 else 0,
        "rent_statistics": {
            "total_monthly_rent": total_monthly_rent,
            "average_rent": average_rent,
            "min_rent": min(float(u.monthly_rent) for u in units) if units else 0,
            "max_rent": max(float(u.monthly_rent) for u in units) if units else 0
        },
        "inspection_statistics": {
            "total_inspections": total_inspections,
            "pending_inspections": pending_inspections,
            "confirmed_inspections": confirmed_inspections,
            "completed_inspections": completed_inspections
        }
    }

@router.get("/owner/{owner_id}")
async def get_owner_rental_stats(
    owner_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get rental statistics for all properties owned by a specific owner."""
    if current_user.role == "owner" and current_user.id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get all properties for the owner
    properties = property_crud.get_properties_by_owner(db, owner_id)
    
    total_properties = len(properties)
    total_units = 0
    total_available_units = 0
    total_occupied_units = 0
    total_monthly_rent = 0
    total_inspections = 0
    pending_inspections = 0
    
    property_stats = []
    
    for property in properties:
        units = unit_crud.get_units_by_property(db, property.id)
        property_total_units = len(units)
        property_available_units = len([u for u in units if u.status == "available"])
        property_occupied_units = len([u for u in units if u.status == "occupied"])
        property_monthly_rent = sum(float(u.monthly_rent) for u in units)
        
        # Get inspection stats for this property
        property_inspections = 0
        property_pending_inspections = 0
        for unit in units:
            unit_inspections = inspection_booking_crud.get_bookings_by_unit(db, unit.id)
            property_inspections += len(unit_inspections)
            property_pending_inspections += len([i for i in unit_inspections if i.status == "pending"])
        
        property_stats.append({
            "property_id": property.id,
            "property_name": property.name,
            "total_units": property_total_units,
            "available_units": property_available_units,
            "occupied_units": property_occupied_units,
            "monthly_rent": property_monthly_rent,
            "occupancy_rate": (property_occupied_units / property_total_units * 100) if property_total_units > 0 else 0,
            "total_inspections": property_inspections,
            "pending_inspections": property_pending_inspections
        })
        
        total_units += property_total_units
        total_available_units += property_available_units
        total_occupied_units += property_occupied_units
        total_monthly_rent += property_monthly_rent
        total_inspections += property_inspections
        pending_inspections += property_pending_inspections
    
    return {
        "owner_id": owner_id,
        "total_properties": total_properties,
        "total_units": total_units,
        "total_available_units": total_available_units,
        "total_occupied_units": total_occupied_units,
        "overall_occupancy_rate": (total_occupied_units / total_units * 100) if total_units > 0 else 0,
        "total_monthly_rent": total_monthly_rent,
        "average_rent_per_unit": total_monthly_rent / total_units if total_units > 0 else 0,
        "total_inspections": total_inspections,
        "pending_inspections": pending_inspections,
        "property_details": property_stats
    }

@router.get("/units/available")
async def get_available_units_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get statistics for all available rental units."""
    available_units = unit_crud.get_available_units(db)
    
    # Group by unit type
    unit_types = {}
    price_ranges = {"under_1000": 0, "1000_2000": 0, "2000_3000": 0, "over_3000": 0}
    
    for unit in available_units:
        # Count by unit type
        unit_type = unit.unit_type
        if unit_type not in unit_types:
            unit_types[unit_type] = 0
        unit_types[unit_type] += 1
        
        # Count by price range
        rent = float(unit.monthly_rent)
        if rent < 1000:
            price_ranges["under_1000"] += 1
        elif rent < 2000:
            price_ranges["1000_2000"] += 1
        elif rent < 3000:
            price_ranges["2000_3000"] += 1
        else:
            price_ranges["over_3000"] += 1
    
    return {
        "total_available_units": len(available_units),
        "unit_types": unit_types,
        "price_ranges": price_ranges,
        "average_rent": sum(float(u.monthly_rent) for u in available_units) / len(available_units) if available_units else 0
    }

@router.get("/inspections/summary")
async def get_inspection_summary(
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get summary of inspection bookings."""
    if current_user.role == "owner":
        bookings = inspection_booking_crud.get_bookings_by_owner(db, current_user.id)
    else:
        # For admin, get all bookings
        bookings = inspection_booking_crud.get_bookings_by_status(db, "all")
    
    status_counts = {
        "pending": 0,
        "confirmed": 0,
        "completed": 0,
        "cancelled": 0,
        "no_show": 0
    }
    
    for booking in bookings:
        status_counts[booking.status] += 1
    
    return {
        "total_bookings": len(bookings),
        "status_breakdown": status_counts,
        "completion_rate": (status_counts["completed"] / len(bookings) * 100) if bookings else 0
    }










