from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.tenant import TenantCreate, TenantResponse, TenantUpdate, TenantWithPropertyAndUnit, TenantPaymentStatus
from ..schemas.unit import UnitUpdate
from ..models.enums import UnitStatus
from ..crud.tenant import tenant_crud
from ..crud.property import property_crud
from ..crud.unit import unit_crud
from ..services.file_upload import file_upload_service
from ..models.user import User
from ..models.tenant import Tenant

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.post("/", response_model=TenantResponse)
async def create_tenant(
    tenant: TenantCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new tenant with detailed information."""
    # Check if property exists and user has access
    property = property_crud.get_property_by_id(db, tenant.property_id)
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
    
    # Check if unit exists and belongs to the property
    unit = unit_crud.get_unit_by_id(db, tenant.unit_id)
    if not unit or unit.property_id != tenant.property_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unit does not belong to the specified property"
        )
    
    # Check if unit is available
    if unit.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unit is not available for rent"
        )
    
    # Check if national ID already exists
    existing_tenant = db.query(Tenant).filter(Tenant.national_id == tenant.national_id).first()
    if existing_tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant with this National ID already exists"
        )
    
    # Create tenant
    new_tenant = tenant_crud.create_tenant(db, tenant)
    
    # Update unit status to occupied
    unit_update = UnitUpdate(status=UnitStatus.OCCUPIED)
    unit_crud.update_unit(db, tenant.unit_id, unit_update)
    
    return new_tenant

@router.get("/", response_model=List[TenantWithPropertyAndUnit])
async def get_tenants(
    property_id: Optional[int] = None,
    unit_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all tenants with filtering options."""
    if property_id:
        # Check access permissions
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
        
        tenants = tenant_crud.get_tenants_by_property(db, property_id, skip=skip, limit=limit)
    elif unit_id:
        tenants = tenant_crud.get_tenants_by_unit(db, unit_id)
    elif status:
        tenants = tenant_crud.get_tenants_by_payment_status(db, status, skip=skip, limit=limit)
    else:
        # Get all active tenants for owners, limited for others
        if current_user.role == "owner":
            tenants = tenant_crud.get_active_tenants(db, skip=skip, limit=limit)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Add property and unit names to response
    result = []
    for tenant in tenants:
        tenant_dict = tenant.__dict__.copy()
        tenant_dict['property_name'] = tenant.property.name if tenant.property else 'Unknown Property'
        tenant_dict['unit_number'] = tenant.unit.unit_number if tenant.unit else 'Unknown Unit'
        tenant_dict['property_address'] = f"{tenant.property.address}, {tenant.property.city}" if tenant.property else 'Unknown Address'
        result.append(tenant_dict)
    
    return result

@router.post("/{tenant_id}/create-payment", response_model=dict)
async def create_payment_for_tenant(
    tenant_id: int,
    amount: float,
    due_date: date,
    payment_type: str = "rent",
    notes: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a payment record for a tenant."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Create payment record
    from ..crud.payment import payment_crud
    from ..schemas.payment import PaymentCreate
    from ..models.enums import PaymentType
    
    payment_data = PaymentCreate(
        unit_id=tenant.unit_id,
        tenant_id=tenant_id,
        payer_id=tenant_id,  # Tenant pays for themselves
        amount=amount,
        payment_type=PaymentType(payment_type),
        due_date=due_date,
        notes=notes
    )
    
    payment = payment_crud.create_payment(db, payment_data)
    
    # Update tenant's next payment due date
    tenant_update = TenantUpdate(next_payment_due=due_date)
    tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment created successfully", "payment": payment}

@router.patch("/{tenant_id}/update-payment-status", response_model=dict)
async def update_tenant_payment_status(
    tenant_id: int,
    payment_status: str,
    last_payment_date: Optional[date] = None,
    next_payment_due: Optional[date] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update tenant's payment status and dates."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update tenant payment status
    tenant_update = TenantUpdate(
        rent_payment_status=payment_status,
        last_payment_date=last_payment_date,
        next_payment_due=next_payment_due
    )
    
    updated_tenant = tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment status updated successfully", "tenant": updated_tenant}

@router.get("/{tenant_id}/payment-history", response_model=List[dict])
async def get_tenant_payment_history(
    tenant_id: int,
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get payment history for a specific tenant."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get payment history
    from ..crud.payment import payment_crud
    payments = payment_crud.get_payments_by_tenant(db, tenant_id)
    
    # Format payment history
    payment_history = []
    for payment in payments:
        payment_history.append({
            "id": payment.id,
            "amount": float(payment.amount),
            "payment_type": payment.payment_type.value,
            "status": payment.status.value,
            "due_date": payment.due_date.isoformat() if payment.due_date else None,
            "paid_date": payment.paid_date.isoformat() if payment.paid_date else None,
            "payment_method": payment.payment_method,
            "reference_number": payment.reference_number,
            "notes": payment.notes,
            "created_at": payment.created_at.isoformat()
        })
    
    return payment_history

@router.get("/overdue", response_model=List[TenantPaymentStatus])
async def get_overdue_tenants(
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get all tenants with overdue rent payments."""
    overdue_tenants = tenant_crud.get_overdue_tenants(db)
    
    result = []
    for tenant in overdue_tenants:
        summary = tenant_crud.get_tenant_payment_summary(db, tenant.id)
        if summary:
            result.append(summary)
    
    return result

@router.post("/{tenant_id}/create-payment", response_model=dict)
async def create_payment_for_tenant(
    tenant_id: int,
    amount: float,
    due_date: date,
    payment_type: str = "rent",
    notes: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a payment record for a tenant."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Create payment record
    from ..crud.payment import payment_crud
    from ..schemas.payment import PaymentCreate
    from ..models.enums import PaymentType
    
    payment_data = PaymentCreate(
        unit_id=tenant.unit_id,
        tenant_id=tenant_id,
        payer_id=tenant_id,  # Tenant pays for themselves
        amount=amount,
        payment_type=PaymentType(payment_type),
        due_date=due_date,
        notes=notes
    )
    
    payment = payment_crud.create_payment(db, payment_data)
    
    # Update tenant's next payment due date
    tenant_update = TenantUpdate(next_payment_due=due_date)
    tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment created successfully", "payment": payment}

@router.patch("/{tenant_id}/update-payment-status", response_model=dict)
async def update_tenant_payment_status(
    tenant_id: int,
    payment_status: str,
    last_payment_date: Optional[date] = None,
    next_payment_due: Optional[date] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update tenant's payment status and dates."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update tenant payment status
    tenant_update = TenantUpdate(
        rent_payment_status=payment_status,
        last_payment_date=last_payment_date,
        next_payment_due=next_payment_due
    )
    
    updated_tenant = tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment status updated successfully", "tenant": updated_tenant}

@router.get("/{tenant_id}/payment-history", response_model=List[dict])
async def get_tenant_payment_history(
    tenant_id: int,
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get payment history for a specific tenant."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get payment history
    from ..crud.payment import payment_crud
    payments = payment_crud.get_payments_by_tenant(db, tenant_id)
    
    # Format payment history
    payment_history = []
    for payment in payments:
        payment_history.append({
            "id": payment.id,
            "amount": float(payment.amount),
            "payment_type": payment.payment_type.value,
            "status": payment.status.value,
            "due_date": payment.due_date.isoformat() if payment.due_date else None,
            "paid_date": payment.paid_date.isoformat() if payment.paid_date else None,
            "payment_method": payment.payment_method,
            "reference_number": payment.reference_number,
            "notes": payment.notes,
            "created_at": payment.created_at.isoformat()
        })
    
    return payment_history

@router.get("/payment-status", response_model=List[TenantPaymentStatus])
async def get_tenants_payment_status(
    property_id: Optional[int] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get payment status for all tenants."""
    if property_id:
        # Check access permissions
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
        
        tenants = tenant_crud.get_tenants_by_property(db, property_id)
    else:
        tenants = tenant_crud.get_active_tenants(db)
    
    result = []
    for tenant in tenants:
        summary = tenant_crud.get_tenant_payment_summary(db, tenant.id)
        if summary:
            result.append(summary)
    
    return result

@router.post("/{tenant_id}/create-payment", response_model=dict)
async def create_payment_for_tenant(
    tenant_id: int,
    amount: float,
    due_date: date,
    payment_type: str = "rent",
    notes: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a payment record for a tenant."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Create payment record
    from ..crud.payment import payment_crud
    from ..schemas.payment import PaymentCreate
    from ..models.enums import PaymentType
    
    payment_data = PaymentCreate(
        unit_id=tenant.unit_id,
        tenant_id=tenant_id,
        payer_id=tenant_id,  # Tenant pays for themselves
        amount=amount,
        payment_type=PaymentType(payment_type),
        due_date=due_date,
        notes=notes
    )
    
    payment = payment_crud.create_payment(db, payment_data)
    
    # Update tenant's next payment due date
    tenant_update = TenantUpdate(next_payment_due=due_date)
    tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment created successfully", "payment": payment}

@router.patch("/{tenant_id}/update-payment-status", response_model=dict)
async def update_tenant_payment_status(
    tenant_id: int,
    payment_status: str,
    last_payment_date: Optional[date] = None,
    next_payment_due: Optional[date] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update tenant's payment status and dates."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update tenant payment status
    tenant_update = TenantUpdate(
        rent_payment_status=payment_status,
        last_payment_date=last_payment_date,
        next_payment_due=next_payment_due
    )
    
    updated_tenant = tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment status updated successfully", "tenant": updated_tenant}

@router.get("/{tenant_id}/payment-history", response_model=List[dict])
async def get_tenant_payment_history(
    tenant_id: int,
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get payment history for a specific tenant."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get payment history
    from ..crud.payment import payment_crud
    payments = payment_crud.get_payments_by_tenant(db, tenant_id)
    
    # Format payment history
    payment_history = []
    for payment in payments:
        payment_history.append({
            "id": payment.id,
            "amount": float(payment.amount),
            "payment_type": payment.payment_type.value,
            "status": payment.status.value,
            "due_date": payment.due_date.isoformat() if payment.due_date else None,
            "paid_date": payment.paid_date.isoformat() if payment.paid_date else None,
            "payment_method": payment.payment_method,
            "reference_number": payment.reference_number,
            "notes": payment.notes,
            "created_at": payment.created_at.isoformat()
        })
    
    return payment_history

@router.get("/{tenant_id}", response_model=TenantWithPropertyAndUnit)
async def get_tenant(
    tenant_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific tenant details."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check access permissions
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Add property and unit names to response
    tenant_dict = tenant.__dict__.copy()
    tenant_dict['property_name'] = tenant.property.name if tenant.property else 'Unknown Property'
    tenant_dict['unit_number'] = tenant.unit.unit_number if tenant.unit else 'Unknown Unit'
    tenant_dict['property_address'] = f"{tenant.property.address}, {tenant.property.city}" if tenant.property else 'Unknown Address'
    
    return tenant_dict

@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    tenant_update: TenantUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update tenant details."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check access permissions
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_tenant = tenant_crud.update_tenant(db, tenant_id, tenant_update)
    if not updated_tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return updated_tenant

@router.patch("/{tenant_id}/payment-status")
async def update_tenant_payment_status(
    tenant_id: int,
    status: str,
    payment_date: Optional[date] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update tenant's rent payment status."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check access permissions
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Validate status
    valid_statuses = ["pending", "paid", "overdue", "partial", "moved_out"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    updated_tenant = tenant_crud.update_tenant_payment_status(db, tenant_id, status, payment_date)
    
    return {"message": f"Tenant payment status updated to {status}", "tenant": updated_tenant}

@router.patch("/{tenant_id}/move-out")
async def move_out_tenant(
    tenant_id: int,
    move_out_date: date,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Move out tenant and mark unit as available."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check access permissions
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Move out tenant
    updated_tenant = tenant_crud.move_out_tenant(db, tenant_id, move_out_date)
    
    # Update unit status to available
    unit_update = UnitUpdate(status=UnitStatus.AVAILABLE)
    unit_crud.update_unit(db, tenant.unit_id, unit_update)
    
    return {"message": "Tenant moved out successfully", "tenant": updated_tenant}

@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete tenant (permanent removal)."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check access permissions
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update unit status to available if tenant is active
    if tenant.is_active:
        unit_update = UnitUpdate(status=UnitStatus.AVAILABLE)
        unit_crud.update_unit(db, tenant.unit_id, unit_update)
    
    success = tenant_crud.delete_tenant(db, tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return {"message": "Tenant deleted successfully"}

@router.post("/{tenant_id}/upload-national-id")
async def upload_national_id_images(
    tenant_id: int,
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(...),
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Upload front and back images of tenant's national ID."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check access permissions
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Validate file types
    if not front_image.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Front image must be an image file"
        )
    
    if not back_image.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Back image must be an image file"
        )
    
    # Upload images
    front_path = await file_upload_service.upload_file(front_image, f"tenants/{tenant_id}/documents")
    back_path = await file_upload_service.upload_file(back_image, f"tenants/{tenant_id}/documents")
    
    # Update tenant with image paths
    tenant_update = TenantUpdate(
        national_id_front_image=front_path,
        national_id_back_image=back_path
    )
    tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {
        "message": "National ID images uploaded successfully",
        "front_image": front_path,
        "back_image": back_path
    }

@router.get("/search/{query}", response_model=List[TenantWithPropertyAndUnit])
async def search_tenants(
    query: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Search tenants by name, national ID, or phone number."""
    tenants = tenant_crud.search_tenants(db, query, skip=skip, limit=limit)
    
    # Add property and unit names to response
    result = []
    for tenant in tenants:
        tenant_dict = tenant.__dict__.copy()
        tenant_dict['property_name'] = tenant.property.name if tenant.property else 'Unknown Property'
        tenant_dict['unit_number'] = tenant.unit.unit_number if tenant.unit else 'Unknown Unit'
        tenant_dict['property_address'] = f"{tenant.property.address}, {tenant.property.city}" if tenant.property else 'Unknown Address'
        result.append(tenant_dict)
    
    return result

@router.post("/{tenant_id}/create-payment", response_model=dict)
async def create_payment_for_tenant(
    tenant_id: int,
    amount: float,
    due_date: date,
    payment_type: str = "rent",
    notes: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a payment record for a tenant."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Create payment record
    from ..crud.payment import payment_crud
    from ..schemas.payment import PaymentCreate
    from ..models.enums import PaymentType
    
    payment_data = PaymentCreate(
        unit_id=tenant.unit_id,
        tenant_id=tenant_id,
        payer_id=tenant_id,  # Tenant pays for themselves
        amount=amount,
        payment_type=PaymentType(payment_type),
        due_date=due_date,
        notes=notes
    )
    
    payment = payment_crud.create_payment(db, payment_data)
    
    # Update tenant's next payment due date
    tenant_update = TenantUpdate(next_payment_due=due_date)
    tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment created successfully", "payment": payment}

@router.patch("/{tenant_id}/update-payment-status", response_model=dict)
async def update_tenant_payment_status(
    tenant_id: int,
    payment_status: str,
    last_payment_date: Optional[date] = None,
    next_payment_due: Optional[date] = None,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update tenant's payment status and dates."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update tenant payment status
    tenant_update = TenantUpdate(
        rent_payment_status=payment_status,
        last_payment_date=last_payment_date,
        next_payment_due=next_payment_due
    )
    
    updated_tenant = tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment status updated successfully", "tenant": updated_tenant}

@router.get("/{tenant_id}/payment-history", response_model=List[dict])
async def get_tenant_payment_history(
    tenant_id: int,
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get payment history for a specific tenant."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get payment history
    from ..crud.payment import payment_crud
    payments = payment_crud.get_payments_by_tenant(db, tenant_id)
    
    # Format payment history
    payment_history = []
    for payment in payments:
        payment_history.append({
            "id": payment.id,
            "amount": float(payment.amount),
            "payment_type": payment.payment_type.value,
            "status": payment.status.value,
            "due_date": payment.due_date.isoformat() if payment.due_date else None,
            "paid_date": payment.paid_date.isoformat() if payment.paid_date else None,
            "payment_method": payment.payment_method,
            "reference_number": payment.reference_number,
            "notes": payment.notes,
            "created_at": payment.created_at.isoformat()
        })
    
    return payment_history
