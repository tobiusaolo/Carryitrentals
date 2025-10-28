from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict, List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..auth import require_roles
from ..models.user import User
from ..models.property import Property
from ..models.unit import Unit
from ..models.tenant import Tenant
from ..models.payment import Payment
from ..models.rental_unit import RentalUnit
from ..models.agent import Agent
from ..models.maintenance import MaintenanceRequest
from ..models.inspection_booking import InspectionBooking
from ..models.settings import SystemSettings
from ..models.airbnb_booking import AirbnbBooking
from ..models.airbnb import Airbnb
from ..schemas.settings import SystemSettingsResponse, SystemSettingsUpdate
from ..crud import settings as settings_crud
from ..services.africas_talking import africas_talking_service

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats", response_model=Dict)
async def get_admin_stats(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get comprehensive admin dashboard statistics."""
    try:
        # Get total counts
        total_properties = db.query(Property).count()
        total_units = db.query(Unit).count()
        total_rental_units = db.query(RentalUnit).count()
        total_tenants = db.query(Tenant).filter(Tenant.is_active == True).count()
        total_agents = db.query(Agent).filter(Agent.is_active == True).count()
        
        # Get property owners count (users with role 'owner')
        total_owners = db.query(User).filter(User.role == 'owner').count()
        
        # Get occupancy statistics
        occupied_units = db.query(Unit).filter(Unit.status == 'occupied').count()
        available_units = db.query(Unit).filter(Unit.status == 'available').count()
        occupied_rental_units = db.query(RentalUnit).filter(RentalUnit.status == 'occupied').count()
        available_rental_units = db.query(RentalUnit).filter(RentalUnit.status == 'available').count()
        
        # Calculate occupancy rates
        total_occupied = occupied_units + occupied_rental_units
        total_available = available_units + available_rental_units
        total_all_units = total_occupied + total_available
        occupancy_rate = (total_occupied / total_all_units * 100) if total_all_units > 0 else 0
        
        # Get revenue statistics
        total_monthly_rent = db.query(func.sum(Unit.monthly_rent)).scalar() or 0
        total_rental_monthly_rent = db.query(func.sum(RentalUnit.monthly_rent)).scalar() or 0
        total_revenue = float(total_monthly_rent) + float(total_rental_monthly_rent)
        
        # Get payment statistics
        current_month = datetime.now().replace(day=1)
        payments_this_month = db.query(Payment).filter(
            Payment.paid_date >= current_month
        ).count()
        
        pending_payments = db.query(Payment).filter(
            Payment.status == 'pending'
        ).count()
        
        overdue_payments = db.query(Payment).filter(
            Payment.status == 'overdue'
        ).count()
        
        # Get maintenance statistics
        active_maintenance = db.query(MaintenanceRequest).filter(
            MaintenanceRequest.status.in_(['pending', 'in_progress'])
        ).count()
        
        # Get inspection statistics
        pending_inspections = db.query(InspectionBooking).filter(
            InspectionBooking.status == 'pending'
        ).count()
        
        # Get recent activity (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_tenants = db.query(Tenant).filter(
            Tenant.created_at >= week_ago
        ).count()
        
        recent_properties = db.query(Property).filter(
            Property.created_at >= week_ago
        ).count()
        
        recent_rental_units = db.query(RentalUnit).filter(
            RentalUnit.created_at >= week_ago
        ).count()
        
        # Calculate average rent
        average_rent = total_revenue / total_all_units if total_all_units > 0 else 0
        
        # Get system health metrics
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        
        return {
            "overview": {
                "total_properties": total_properties,
                "total_units": total_units,
                "total_rental_units": total_rental_units,
                "total_tenants": total_tenants,
                "total_owners": total_owners,
                "total_agents": total_agents,
                "total_users": total_users,
                "active_users": active_users
            },
            "occupancy": {
                "total_occupied": total_occupied,
                "total_available": total_available,
                "total_all_units": total_all_units,
                "occupancy_rate": round(occupancy_rate, 1),
                "occupied_units": occupied_units,
                "available_units": available_units,
                "occupied_rental_units": occupied_rental_units,
                "available_rental_units": available_rental_units
            },
            "revenue": {
                "total_monthly_revenue": round(total_revenue, 2),
                "average_rent": round(average_rent, 2),
                "payments_this_month": payments_this_month,
                "pending_payments": pending_payments,
                "overdue_payments": overdue_payments
            },
            "maintenance": {
                "active_requests": active_maintenance,
                "pending_inspections": pending_inspections
            },
            "recent_activity": {
                "new_tenants_week": recent_tenants,
                "new_properties_week": recent_properties,
                "new_rental_units_week": recent_rental_units
            },
            "system": {
                "uptime": 99.9,  # This would come from actual system monitoring
                "response_time": 120,  # This would come from actual system monitoring
                "error_rate": 0.2  # This would come from actual system monitoring
            }
        }
        
    except Exception as e:
        print(f"Error in admin stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching admin statistics: {str(e)}"
        )

@router.get("/recent-activity", response_model=List[Dict])
async def get_recent_activity(
    limit: int = 10,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get recent system activity for admin dashboard."""
    try:
        activities = []
        
        # Get recent tenants
        recent_tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).limit(5).all()
        for tenant in recent_tenants:
            activities.append({
                "id": f"tenant_{tenant.id}",
                "type": "tenant",
                "message": f"New tenant registered: {tenant.first_name} {tenant.last_name}",
                "timestamp": tenant.created_at,
                "user": f"{tenant.first_name} {tenant.last_name}",
                "property": tenant.unit.property.name if tenant.unit and tenant.unit.property else "Unknown Property"
            })
        
        # Get recent properties
        recent_properties = db.query(Property).order_by(Property.created_at.desc()).limit(3).all()
        for property in recent_properties:
            activities.append({
                "id": f"property_{property.id}",
                "type": "property",
                "message": f"New property added: {property.name}",
                "timestamp": property.created_at,
                "user": property.owner.first_name + " " + property.owner.last_name if property.owner else "Unknown Owner",
                "property": property.name
            })
        
        # Get recent rental units
        recent_rental_units = db.query(RentalUnit).order_by(RentalUnit.created_at.desc()).limit(3).all()
        for unit in recent_rental_units:
            activities.append({
                "id": f"rental_unit_{unit.id}",
                "type": "rental_unit",
                "message": f"New rental unit added: {unit.title}",
                "timestamp": unit.created_at,
                "user": "Admin",
                "property": unit.title
            })
        
        # Get recent payments
        recent_payments = db.query(Payment).order_by(Payment.created_at.desc()).limit(5).all()
        for payment in recent_payments:
            activities.append({
                "id": f"payment_{payment.id}",
                "type": "payment",
                "message": f"Payment received: ${payment.amount}",
                "timestamp": payment.created_at,
                "amount": float(payment.amount),
                "tenant": f"{payment.tenant.first_name} {payment.tenant.last_name}" if payment.tenant else "Unknown Tenant"
            })
        
        # Sort by timestamp and return limited results
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return activities[:limit]
        
    except Exception as e:
        print(f"Error in recent activity: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching recent activity: {str(e)}"
        )

@router.get("/system-alerts", response_model=List[Dict])
async def get_system_alerts(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get system alerts for admin dashboard."""
    try:
        alerts = []
        
        # Check for overdue payments
        overdue_count = db.query(Payment).filter(Payment.status == 'overdue').count()
        if overdue_count > 0:
            alerts.append({
                "id": "overdue_payments",
                "type": "warning",
                "title": "Overdue Payments",
                "message": f"{overdue_count} payments are overdue",
                "timestamp": datetime.now(),
                "priority": "high"
            })
        
        # Check for pending maintenance requests
        pending_maintenance = db.query(MaintenanceRequest).filter(
            MaintenanceRequest.status == 'pending'
        ).count()
        if pending_maintenance > 0:
            alerts.append({
                "id": "pending_maintenance",
                "type": "info",
                "title": "Pending Maintenance",
                "message": f"{pending_maintenance} maintenance requests pending",
                "timestamp": datetime.now(),
                "priority": "medium"
            })
        
        # Check for pending inspections
        pending_inspections = db.query(InspectionBooking).filter(
            InspectionBooking.status == 'pending'
        ).count()
        if pending_inspections > 0:
            alerts.append({
                "id": "pending_inspections",
                "type": "info",
                "title": "Pending Inspections",
                "message": f"{pending_inspections} inspections pending",
                "timestamp": datetime.now(),
                "priority": "medium"
            })
        
        # Check for low occupancy
        total_units = db.query(Unit).count() + db.query(RentalUnit).count()
        occupied_units = db.query(Unit).filter(Unit.status == 'occupied').count() + db.query(RentalUnit).filter(RentalUnit.status == 'occupied').count()
        occupancy_rate = (occupied_units / total_units * 100) if total_units > 0 else 0
        
        if occupancy_rate < 70:
            alerts.append({
                "id": "low_occupancy",
                "type": "warning",
                "title": "Low Occupancy Rate",
                "message": f"Occupancy rate is {occupancy_rate:.1f}%",
                "timestamp": datetime.now(),
                "priority": "medium"
            })
        
        return alerts
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching system alerts: {str(e)}"
        )

@router.get("/inspection-bookings")
async def get_all_inspection_bookings(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get all inspection bookings for admin view (includes public bookings)."""
    try:
        # Get all inspection bookings
        bookings = db.query(InspectionBooking).order_by(InspectionBooking.created_at.desc()).all()
        
        # Format bookings with details
        result = []
        for booking in bookings:
            booking_data = {
                "id": booking.id,
                "rental_unit_id": booking.rental_unit_id,
                "unit_id": booking.unit_id,
                "tenant_id": booking.tenant_id,
                "owner_id": booking.owner_id,
                "contact_name": booking.contact_name,  # For public bookings
                "contact_phone": booking.contact_phone,
                "contact_email": booking.contact_email,
                "booking_date": booking.booking_date,
                "preferred_time_slot": booking.preferred_time_slot,
                "message": booking.message,
                "status": booking.status.value if hasattr(booking.status, 'value') else booking.status,
                "notes": booking.notes,
                "created_at": booking.created_at,
                "updated_at": booking.updated_at,
                "is_public_booking": booking.tenant_id is None,  # True if no login required
            }
            
            # Add rental unit details if available
            if booking.rental_unit:
                booking_data["rental_unit"] = {
                    "id": booking.rental_unit.id,
                    "name": booking.rental_unit.title,  # RentalUnit uses 'title' not 'name'
                    "location": booking.rental_unit.location,
                    "unit_type": booking.rental_unit.unit_type.value if hasattr(booking.rental_unit.unit_type, 'value') else booking.rental_unit.unit_type,
                }
            
            # Add tenant details if available (for logged-in bookings)
            if booking.tenant:
                booking_data["tenant"] = {
                    "id": booking.tenant.id,
                    "name": f"{booking.tenant.first_name} {booking.tenant.last_name}",  # User has first_name and last_name
                    "email": booking.tenant.email
                }
            
            result.append(booking_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching inspection bookings: {str(e)}"
        )

@router.patch("/inspection-bookings/{booking_id}/approve")
async def approve_inspection_booking(
    booking_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Approve an inspection booking and send SMS confirmation to the client."""
    try:
        # Get the booking
        booking = db.query(InspectionBooking).filter(InspectionBooking.id == booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection booking not found"
            )
        
        # Update status to confirmed/approved
        booking.status = "confirmed"
        booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)
        
        # Send SMS confirmation to client via Africa's Talking
        if booking.contact_phone:
            # Get rental unit details for the message
            unit_name = booking.rental_unit.title if booking.rental_unit else "Property"
            unit_location = booking.rental_unit.location if booking.rental_unit else ""
            
            # Format date
            booking_date_str = booking.booking_date.strftime("%d %B %Y") if booking.booking_date else "TBD"
            time_slot = booking.preferred_time_slot.capitalize() if booking.preferred_time_slot else "TBD"
            
            # Compose SMS message
            sms_message = f"""INSPECTION APPROVED!

Property: {unit_name}
Location: {unit_location}
Date: {booking_date_str}
Time: {time_slot}

Fee: UGX 30,000 per property

Contact Us:
Email: stuartkevinz852@gmail.com
Email: carryit@gmail.com
Phone: +256754577922

CarryIT Property Management""".strip()
            
            # Send SMS via Africa's Talking
            await africas_talking_service.send_sms(booking.contact_phone, sms_message, db)
        
        return {
            "message": "Inspection booking approved successfully",
            "booking_id": booking.id,
            "status": booking.status,
            "sms_sent": booking.contact_phone is not None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error approving inspection booking: {str(e)}"
        )

@router.patch("/inspection-bookings/{booking_id}/reject")
async def reject_inspection_booking(
    booking_id: int,
    reason: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Reject an inspection booking and send SMS notification to the client."""
    try:
        # Get the booking
        booking = db.query(InspectionBooking).filter(InspectionBooking.id == booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection booking not found"
            )
        
        # Update status to cancelled
        booking.status = "cancelled"
        if reason:
            booking.notes = f"Rejected: {reason}"
        booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)
        
        # Send SMS notification via Africa's Talking
        if booking.contact_phone:
            unit_name = booking.rental_unit.title if booking.rental_unit else "Property"
            
            sms_message = f"""INSPECTION NOT APPROVED

Property: {unit_name}

We regret to inform you that your inspection request has been declined.
{f'Reason: {reason}' if reason else ''}

Please contact us for alternative arrangements.

Contact Us:
Email: stuartkevinz852@gmail.com
Email: carryit@gmail.com
Phone: +256754577922

CarryIT Property Management""".strip()
            
            await africas_talking_service.send_sms(booking.contact_phone, sms_message, db)
        
        return {
            "message": "Inspection booking rejected",
            "booking_id": booking.id,
            "status": booking.status,
            "sms_sent": booking.contact_phone is not None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rejecting inspection booking: {str(e)}"
        )


# ============ SYSTEM SETTINGS ENDPOINTS ============

@router.get("/settings", response_model=List[SystemSettingsResponse])
async def get_all_settings(
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get all system settings (admin and owner can view, only admin can modify)."""
    return settings_crud.get_all_settings(db)


@router.get("/settings/{setting_key}", response_model=SystemSettingsResponse)
async def get_setting(
    setting_key: str,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get a specific setting by key (admin and owner can view)."""
    setting = settings_crud.get_setting(db, setting_key)
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting '{setting_key}' not found"
        )
    return setting


@router.put("/settings/{setting_key}", response_model=SystemSettingsResponse)
async def update_setting(
    setting_key: str,
    setting: SystemSettingsUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Update a system setting."""
    updated_setting = settings_crud.update_setting(db, setting_key, setting)
    if not updated_setting:
        # Create the setting if it doesn't exist
        updated_setting = settings_crud.create_or_update_setting(
            db, 
            setting_key, 
            setting.setting_value,
            setting.description
        )
    return updated_setting


@router.post("/settings/bulk-update")
async def bulk_update_settings(
    settings: Dict[str, str],
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Bulk update multiple settings at once."""
    updated_settings = []
    for key, value in settings.items():
        setting = settings_crud.create_or_update_setting(db, key, value)
        updated_settings.append(setting)
    
    return {
        "message": "Settings updated successfully",
        "updated_count": len(updated_settings),
        "settings": updated_settings
    }


@router.post("/settings/initialize-defaults")
async def initialize_default_settings(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Initialize default system settings."""
    default_settings = {
        "mtn_mobile_money_number": {
            "value": "+256700000000",
            "description": "MTN Mobile Money number for receiving payments"
        },
        "airtel_money_number": {
            "value": "+256750000000",
            "description": "Airtel Money number for receiving payments"
        },
        "payment_merchant_name": {
            "value": "CarryIT Property Manager",
            "description": "Merchant name displayed in payment requests"
        },
        "enable_sms_notifications": {
            "value": "true",
            "description": "Enable SMS notifications for bookings and payments"
        },
        "prepayment_percentage": {
            "value": "50",
            "description": "Default prepayment percentage for bookings"
        }
    }
    
    created_settings = []
    for key, data in default_settings.items():
        setting = settings_crud.create_or_update_setting(
            db, 
            key, 
            data["value"],
            data["description"]
        )
        created_settings.append(setting)
    
    return {
        "message": "Default settings initialized successfully",
        "settings": created_settings
    }


# ============ AIRBNB BOOKINGS & PAYMENTS ENDPOINTS ============

@router.get("/airbnb/bookings")
async def get_all_airbnb_bookings(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get all Airbnb bookings for admin view."""
    try:
        bookings = db.query(AirbnbBooking).order_by(AirbnbBooking.created_at.desc()).all()
        
        # Enhance bookings with Airbnb details
        result = []
        for booking in bookings:
            airbnb = db.query(Airbnb).filter(Airbnb.id == booking.airbnb_id).first()
            booking_dict = {
                "id": booking.id,
                "airbnb_id": booking.airbnb_id,
                "airbnb_title": airbnb.title if airbnb else "N/A",
                "guest_name": booking.guest_name,
                "guest_email": booking.guest_email,
                "guest_phone": booking.guest_phone,
                "guest_username": booking.guest_username,
                "guest_date_of_birth": booking.guest_date_of_birth,
                "check_in": booking.check_in,
                "check_out": booking.check_out,
                "number_of_guests": booking.number_of_guests,
                "number_of_nights": booking.number_of_nights,
                "total_amount": str(booking.total_amount),
                "currency": booking.currency,
                "prepayment_amount": str(booking.prepayment_amount) if booking.prepayment_amount else "0",
                "remaining_amount": str(booking.remaining_amount) if booking.remaining_amount else "0",
                "status": booking.status,
                "payment_status": str(booking.payment_status.value) if hasattr(booking.payment_status, 'value') else str(booking.payment_status),
                "payment_timing": booking.payment_timing,
                "payment_method": booking.payment_method,
                "payment_method_type": booking.payment_method_type,
                "payment_reference": booking.payment_reference,
                "card_last_four": booking.card_last_four,
                "card_brand": booking.card_brand,
                "special_requests": booking.special_requests,
                "created_at": booking.created_at.isoformat() if booking.created_at else None
            }
            result.append(booking_dict)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching bookings: {str(e)}"
        )


@router.patch("/airbnb/bookings/{booking_id}/approve")
async def approve_airbnb_booking(
    booking_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Approve an Airbnb booking and send SMS confirmation."""
    try:
        # Get booking
        booking = db.query(AirbnbBooking).filter(AirbnbBooking.id == booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Get Airbnb details
        airbnb = db.query(Airbnb).filter(Airbnb.id == booking.airbnb_id).first()
        
        # Update booking status
        booking.status = 'approved'
        db.commit()
        
        # Send SMS confirmation
        prepayment_display = f"{booking.currency} {booking.prepayment_amount:,.0f}" if booking.prepayment_amount else f"{booking.currency} 0"
        remaining_display = f"{booking.currency} {booking.remaining_amount:,.0f}" if booking.remaining_amount else f"{booking.currency} 0"
        
        sms_message = f"""
BOOKING APPROVED!

Property: {airbnb.title if airbnb else 'N/A'}
Location: {airbnb.location if airbnb else 'N/A'}
Check-in: {booking.check_in.strftime('%d %b %Y')}
Check-out: {booking.check_out.strftime('%d %b %Y')}
Nights: {booking.number_of_nights}
Guests: {booking.number_of_guests}

Total: {booking.currency} {booking.total_amount:,.0f}
Prepayment (50%): {prepayment_display}
Remaining: {remaining_display}

Your booking has been approved! See you soon!

Contact Us:
Email: stuartkevinz852@gmail.com
Email: carryit@gmail.com
Phone: +256754577922

CarryIT Property Manager
"""
        
        # Send SMS via Africa's Talking
        await africas_talking_service.send_sms(
            to_phone=booking.guest_phone,
            message=sms_message.strip(),
            db=db
        )
        
        return {
            "message": "Booking approved successfully",
            "booking_id": booking_id,
            "status": booking.status,
            "sms_sent": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error approving booking: {str(e)}"
        )


@router.patch("/airbnb/bookings/{booking_id}/decline")
async def decline_airbnb_booking(
    booking_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Decline an Airbnb booking and send SMS notification."""
    try:
        # Get booking
        booking = db.query(AirbnbBooking).filter(AirbnbBooking.id == booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Get Airbnb details
        airbnb = db.query(Airbnb).filter(Airbnb.id == booking.airbnb_id).first()
        
        # Update booking status
        booking.status = 'declined'
        db.commit()
        
        # Send SMS notification
        sms_message = f"""
BOOKING UPDATE

Property: {airbnb.title if airbnb else 'N/A'}
Check-in: {booking.check_in.strftime('%d %b %Y')}

Unfortunately, your booking request has been declined due to unavailability.

Please browse our other available properties or contact us for assistance.

Contact Us:
Email: stuartkevinz852@gmail.com
Email: carryit@gmail.com
Phone: +256754577922

CarryIT Property Manager
"""
        
        # Send SMS via Africa's Talking
        await africas_talking_service.send_sms(
            to_phone=booking.guest_phone,
            message=sms_message.strip(),
            db=db
        )
        
        return {
            "message": "Booking declined",
            "booking_id": booking_id,
            "status": booking.status,
            "sms_sent": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error declining booking: {str(e)}"
        )


@router.get("/airbnb/payments")
async def get_all_airbnb_payments(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get all Airbnb payments for admin view."""
    try:
        # Get all bookings with payment info
        bookings = db.query(AirbnbBooking).filter(
            AirbnbBooking.payment_reference.isnot(None)
        ).order_by(AirbnbBooking.created_at.desc()).all()
        
        result = []
        for booking in bookings:
            airbnb = db.query(Airbnb).filter(Airbnb.id == booking.airbnb_id).first()
            payment_dict = {
                "id": booking.id,
                "booking_id": booking.id,
                "payment_reference": booking.payment_reference,
                "guest_name": booking.guest_name,
                "airbnb_title": airbnb.title if airbnb else "N/A",
                "amount": str(booking.prepayment_amount) if booking.prepayment_amount else str(booking.total_amount),
                "currency": booking.currency,
                "payment_method": booking.payment_method,
                "payment_method_type": booking.payment_method_type,
                "payment_status": str(booking.payment_status.value) if hasattr(booking.payment_status, 'value') else str(booking.payment_status),
                "payment_date": booking.payment_date.isoformat() if booking.payment_date else booking.created_at.isoformat(),
                "card_last_four": booking.card_last_four,
                "card_brand": booking.card_brand
            }
            result.append(payment_dict)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching payments: {str(e)}"
        )

