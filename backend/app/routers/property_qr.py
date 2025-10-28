from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os
from ..database import get_db
from ..models import Property, Unit
from ..schemas.property import PropertyResponse
from ..auth import get_current_active_user, require_roles
from ..models.user import User
from ..services.qr_code_service import QRCodeService
from ..services.mobile_money_service import MobileMoneyService
import qrcode
import io
import base64
from datetime import datetime, timedelta

router = APIRouter()
qr_service = QRCodeService()
mobile_money_service = MobileMoneyService()

@router.post("/generate/{property_id}")
async def generate_property_qr(
    property_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Generate a QR code for a property that tenants can scan to pay."""
    
    # Get property
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check if property belongs to user (for owners)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to generate QR codes for this property"
        )
    
    # Check if property has mobile money numbers configured
    if not property.mtn_mobile_money_number and not property.airtel_money_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Property must have at least one mobile money number configured"
        )
    
    # Get all units for this property
    units = db.query(Unit).filter(Unit.property_id == property_id).all()
    if not units:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Property has no units"
        )
    
    # Generate payment URL for the property - use backend URL from environment
    backend_url = "https://carryit-backend.onrender.com"
    payment_url = f"{backend_url}/api/v1/mobile-payment/property/{property_id}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(payment_url)
    qr.make(fit=True)
    
    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return {
        "property_id": property.id,
        "property_name": property.name,
        "property_address": property.address,
        "payment_url": payment_url,
        "qr_image": img_str,
        "units_count": len(units),
        "mtn_number": property.mtn_mobile_money_number,
        "airtel_number": property.airtel_money_number,
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/{property_id}")
async def get_property_qr(
    property_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get property QR code information."""
    
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check permissions
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this property's QR code"
        )
    
    return {
        "property_id": property.id,
        "property_name": property.name,
        "property_address": property.address,
        "mtn_number": property.mtn_mobile_money_number,
        "airtel_number": property.airtel_money_number,
        "has_mobile_money": bool(property.mtn_mobile_money_number or property.airtel_money_number)
    }
