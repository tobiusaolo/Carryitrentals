from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.qr_payment import (
    QRCodePaymentCreate, 
    QRCodePaymentResponse, 
    QRCodePaymentUpdate, 
    QRCodePaymentWithDetails,
    QRCodeGenerateRequest
)
from ..crud.qr_payment import qr_payment_crud
from ..crud.unit import unit_crud
from ..crud.property import property_crud
from ..crud.user import user_crud
from ..services.qr_code_service import qr_code_service
from ..models.user import User

router = APIRouter(prefix="/qr-payments", tags=["QR Code Payments"])

@router.post("/generate", response_model=QRCodePaymentResponse)
async def generate_qr_payment(
    qr_request: QRCodeGenerateRequest,
    current_user: User = Depends(require_roles(["admin", "owner", "tenant"])),
    db: Session = Depends(get_db)
):
    """Generate a QR code for payment."""
    # Check if unit exists and user has access
    unit = unit_crud.get_unit_by_id(db, qr_request.unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check property access
    property = property_crud.get_property_by_id(db, unit.property_id)
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
    
    # Check if tenant exists (if provided)
    if qr_request.tenant_id:
        tenant = user_crud.get_user_by_id(db, qr_request.tenant_id)
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found"
            )
    
    # Create QR code payment record first to get the ID
    qr_payment_create = QRCodePaymentCreate(
        unit_id=qr_request.unit_id,
        tenant_id=qr_request.tenant_id,
        payer_id=current_user.id,
        amount=qr_request.amount,
        account_number=qr_request.account_number,
        mobile_money_provider=qr_request.mobile_money_provider,
        expires_in_days=qr_request.expires_in_days
    )
    
    # Save QR code payment to database first
    db_qr_payment = qr_payment_crud.create_qr_payment(
        db, 
        qr_payment_create, 
        ""  # Empty QR data for now
    )
    
    # Prepare payment data for QR code generation
    payment_data = {
        "qr_payment_id": db_qr_payment.id,
        "unit_id": qr_request.unit_id,
        "tenant_id": qr_request.tenant_id,
        "payer_id": current_user.id,
        "amount": qr_request.amount,
        "account_number": qr_request.account_number,
        "mobile_money_provider": qr_request.mobile_money_provider,
        "unit_number": unit.unit_number
    }
    
    # Generate QR code data and image
    qr_result = qr_code_service.generate_mobile_money_payment_qr(payment_data)
    
    # Update the QR code payment with the generated data
    db_qr_payment.qr_code_data = qr_result["qr_data"]
    db.commit()
    db.refresh(db_qr_payment)
    
    # Add QR image to response
    response_data = {
        "id": db_qr_payment.id,
        "unit_id": db_qr_payment.unit_id,
        "tenant_id": db_qr_payment.tenant_id,
        "payer_id": db_qr_payment.payer_id,
        "amount": db_qr_payment.amount,
        "account_number": db_qr_payment.account_number,
        "mobile_money_provider": db_qr_payment.mobile_money_provider,
        "qr_code_data": db_qr_payment.qr_code_data,
        "qr_code_image_path": db_qr_payment.qr_code_image_path,
        "status": db_qr_payment.status,
        "expires_at": db_qr_payment.expires_at,
        "used_at": db_qr_payment.used_at,
        "created_at": db_qr_payment.created_at,
        "updated_at": db_qr_payment.updated_at,
        "qr_image": qr_result["qr_image"]  # Add the QR image
    }
    
    return response_data

@router.get("/", response_model=List[QRCodePaymentResponse])
async def get_qr_payments(
    unit_id: Optional[int] = None,
    tenant_id: Optional[int] = None,
    payer_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get QR code payments."""
    if unit_id:
        # Check access permissions
        unit = unit_crud.get_unit_by_id(db, unit_id)
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unit not found"
            )
        
        property = property_crud.get_property_by_id(db, unit.property_id)
        if current_user.role == "owner" and property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return qr_payment_crud.get_qr_payments_by_unit(db, unit_id, skip=skip, limit=limit)
    elif tenant_id:
        # Check access permissions
        if current_user.role == "tenant" and current_user.id != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        return qr_payment_crud.get_qr_payments_by_tenant(db, tenant_id, skip=skip, limit=limit)
    elif payer_id:
        # Check access permissions
        if current_user.role == "tenant" and current_user.id != payer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        return qr_payment_crud.get_qr_payments_by_payer(db, payer_id, skip=skip, limit=limit)
    elif status == "active":
        return qr_payment_crud.get_active_qr_payments(db, skip=skip, limit=limit)
    elif status == "expired":
        return qr_payment_crud.get_expired_qr_payments(db, skip=skip, limit=limit)
    else:
        # Return all QR payments for admin/owner
        if current_user.role not in ["admin", "owner"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        return qr_payment_crud.get_qr_payments_by_unit(db, None, skip=skip, limit=limit)

@router.get("/{qr_payment_id}", response_model=QRCodePaymentResponse)
async def get_qr_payment(
    qr_payment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get QR code payment by ID."""
    qr_payment = qr_payment_crud.get_qr_payment_by_id(db, qr_payment_id)
    if not qr_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR code payment not found"
        )
    
    # Check access permissions
    if current_user.role == "tenant" and qr_payment.payer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "owner":
        unit = unit_crud.get_unit_by_id(db, qr_payment.unit_id)
        property = property_crud.get_property_by_id(db, unit.property_id)
        if property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return qr_payment

@router.put("/{qr_payment_id}", response_model=QRCodePaymentResponse)
async def update_qr_payment(
    qr_payment_id: int,
    qr_payment_update: QRCodePaymentUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update QR code payment by ID."""
    qr_payment = qr_payment_crud.get_qr_payment_by_id(db, qr_payment_id)
    if not qr_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR code payment not found"
        )
    
    # Check ownership
    unit = unit_crud.get_unit_by_id(db, qr_payment.unit_id)
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_qr_payment = qr_payment_crud.update_qr_payment(db, qr_payment_id, qr_payment_update)
    return updated_qr_payment

@router.post("/{qr_payment_id}/mark-used")
async def mark_qr_payment_as_used(
    qr_payment_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Mark QR code payment as used."""
    qr_payment = qr_payment_crud.get_qr_payment_by_id(db, qr_payment_id)
    if not qr_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR code payment not found"
        )
    
    # Check ownership
    unit = unit_crud.get_unit_by_id(db, qr_payment.unit_id)
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_qr_payment = qr_payment_crud.mark_qr_payment_as_used(db, qr_payment_id)
    return updated_qr_payment

@router.delete("/{qr_payment_id}")
async def delete_qr_payment(
    qr_payment_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete QR code payment by ID."""
    qr_payment = qr_payment_crud.get_qr_payment_by_id(db, qr_payment_id)
    if not qr_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR code payment not found"
        )
    
    # Check ownership
    unit = unit_crud.get_unit_by_id(db, qr_payment.unit_id)
    property = property_crud.get_property_by_id(db, unit.property_id)
    if current_user.role == "owner" and property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = qr_payment_crud.delete_qr_payment(db, qr_payment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR code payment not found"
        )
    
    return {"message": "QR code payment deleted successfully"}

@router.post("/cleanup-expired")
async def cleanup_expired_qr_payments(
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Clean up expired QR code payments."""
    cleaned_count = qr_payment_crud.cleanup_expired_qr_payments(db)
    return {"message": f"Cleaned up {cleaned_count} expired QR code payments"}

@router.get("/{qr_payment_id}/qr-image")
async def get_qr_code_image(
    qr_payment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get QR code image for a payment."""
    qr_payment = qr_payment_crud.get_qr_payment_by_id(db, qr_payment_id)
    if not qr_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR code payment not found"
        )
    
    # Check access permissions
    if current_user.role == "tenant" and qr_payment.payer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "owner":
        unit = unit_crud.get_unit_by_id(db, qr_payment.unit_id)
        property = property_crud.get_property_by_id(db, unit.property_id)
        if property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Generate QR code image
    qr_result = qr_code_service.generate_qr_code_image(qr_payment.qr_code_data)
    
    return {
        "qr_image": qr_result,
        "payment_info": {
            "account_number": qr_payment.account_number,
            "amount": str(qr_payment.amount),
            "currency": "UGX",
            "provider": qr_payment.mobile_money_provider,
            "status": qr_payment.status,
            "expires_at": qr_payment.expires_at.isoformat()
        }
    }
