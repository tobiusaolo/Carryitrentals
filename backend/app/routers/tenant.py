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
    """Create a new tenant and assign them to a unit."""
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
    
    # Check if unit is already occupied
    if unit.status == UnitStatus.OCCUPIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unit is already occupied"
        )
    
    # Check if tenant with national ID already exists
    existing_tenant = tenant_crud.get_tenant_by_national_id(db, tenant.national_id)
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
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get all tenants with filtering options."""
    if current_user.role == "owner":
        # Owners can only see tenants in their properties
        if property_id:
            property = property_crud.get_property_by_id(db, property_id)
            if not property or property.owner_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
            tenants = tenant_crud.get_tenants_by_property(db, property_id, skip=skip, limit=limit)
        else:
            # Get all properties for the owner and then all tenants in those properties
            owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
            property_ids = [p.id for p in owner_properties]
            all_tenants = []
            for prop_id in property_ids:
                all_tenants.extend(tenant_crud.get_tenants_by_property(db, prop_id, skip=skip, limit=limit))
            tenants = all_tenants
    else: # Admin or Manager
        if property_id:
            tenants = tenant_crud.get_tenants_by_property(db, property_id, skip=skip, limit=limit)
        elif unit_id:
            tenants = tenant_crud.get_tenants_by_unit(db, unit_id, skip=skip, limit=limit)
        elif is_active is not None:
            if is_active:
                tenants = tenant_crud.get_active_tenants(db, skip=skip, limit=limit)
            else:
                tenants = [t for t in tenant_crud.get_all_tenants(db, skip=skip, limit=limit) if not t.is_active]
        else:
            tenants = tenant_crud.get_all_tenants(db, skip=skip, limit=limit)
    
    # Add property_name, property_address, and unit_number to each tenant
    tenants_with_details = []
    for t in tenants:
        property_name = t.property.name if t.property else "N/A"
        property_address = f"{t.property.address}, {t.property.city}" if t.property else "N/A"
        unit_number = t.unit.unit_number if t.unit else "N/A"
        tenants_with_details.append(TenantWithPropertyAndUnit(
            **t.__dict__,
            property_name=property_name,
            property_address=property_address,
            unit_number=unit_number
        ))
    return tenants_with_details

# NOTE: Place all specific path routes BEFORE the generic /{tenant_id} route
# to avoid routing conflicts where strings are parsed as integers

@router.get("/{tenant_id}/payment-status", response_model=TenantPaymentStatus)
async def get_tenant_payment_status(
    tenant_id: int,
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get the payment status for a specific tenant."""
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
    
    payment_status = tenant_crud.get_tenant_payment_status(db, tenant_id)
    if not payment_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment status not found for this tenant"
        )
    return payment_status

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
async def get_tenant_by_id(
    tenant_id: int,
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """Get a specific tenant by ID."""
    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check access permissions for owners
    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    property_name = tenant.property.name if tenant.property else "N/A"
    property_address = f"{tenant.property.address}, {tenant.property.city}" if tenant.property else "N/A"
    unit_number = tenant.unit.unit_number if tenant.unit else "N/A"
    
    return TenantWithPropertyAndUnit(
        **tenant.__dict__,
        property_name=property_name,
        property_address=property_address,
        unit_number=unit_number
    )

@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    tenant_update: TenantUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update an existing tenant's information."""
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
    
    # If unit_id is being updated, check if the new unit is available and belongs to the property
    if tenant_update.unit_id and tenant_update.unit_id != tenant.unit_id:
        new_unit = unit_crud.get_unit_by_id(db, tenant_update.unit_id)
        if not new_unit or new_unit.property_id != tenant.property_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New unit does not belong to the specified property or does not exist"
            )
        if new_unit.status == UnitStatus.OCCUPIED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New unit is already occupied"
            )
        
        # Update old unit status to available
        old_unit_update = UnitUpdate(status=UnitStatus.AVAILABLE)
        unit_crud.update_unit(db, tenant.unit_id, old_unit_update)
        
        # Update new unit status to occupied
        new_unit_update = UnitUpdate(status=UnitStatus.OCCUPIED)
        unit_crud.update_unit(db, new_unit.id, new_unit_update)

    # If national_id is updated, check for uniqueness
    if tenant_update.national_id and tenant_update.national_id != tenant.national_id:
        existing_tenant = tenant_crud.get_tenant_by_national_id(db, tenant_update.national_id)
        if existing_tenant and existing_tenant.id != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tenant with this National ID already exists"
            )
    
    return tenant_crud.update_tenant(db, tenant_id, tenant_update)

@router.post("/{tenant_id}/upload-national-id-front", response_model=TenantResponse)
async def upload_national_id_front_image(
    tenant_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Upload front image of national ID for a tenant."""
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
    
    file_location = await file_upload_service.upload_file(file, f"tenants/{tenant_id}/national_id_front")
    
    tenant_update = TenantUpdate(national_id_front_image=file_location)
    return tenant_crud.update_tenant(db, tenant_id, tenant_update)

@router.post("/{tenant_id}/upload-national-id-back", response_model=TenantResponse)
async def upload_national_id_back_image(
    tenant_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Upload back image of national ID for a tenant."""
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
    
    file_location = await file_upload_service.upload_file(file, f"tenants/{tenant_id}/national_id_back")
    
    tenant_update = TenantUpdate(national_id_back_image=file_location)
    return tenant_crud.update_tenant(db, tenant_id, tenant_update)

@router.post("/{tenant_id}/move-out", response_model=dict)
async def move_out_tenant(
    tenant_id: int,
    move_out_date: date,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Mark a tenant as moved out and update unit status."""
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
    """Delete a tenant."""
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

@router.post("/{tenant_id}/create-payment", response_model=dict)
async def create_payment_for_tenant(
    tenant_id: int,
    payment_data: dict,
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
    
    payment_create = PaymentCreate(
        unit_id=tenant.unit_id,
        tenant_id=tenant_id,
        payer_id=tenant_id,  # Tenant pays for themselves
        amount=payment_data["amount"],
        payment_type=PaymentType(payment_data.get("payment_type", "rent")),
        due_date=payment_data["due_date"],
        notes=payment_data.get("notes")
    )
    
    payment = payment_crud.create_payment(db, payment_create)
    
    # Update tenant's next payment due date
    tenant_update = TenantUpdate(next_payment_due=payment_data["due_date"])
    tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment created successfully", "payment": payment}

@router.patch("/{tenant_id}/update-payment-status", response_model=dict)
async def update_tenant_payment_status(
    tenant_id: int,
    status_data: dict,
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
        rent_payment_status=status_data["payment_status"],
        last_payment_date=status_data.get("last_payment_date"),
        next_payment_due=status_data.get("next_payment_due")
    )
    
    updated_tenant = tenant_crud.update_tenant(db, tenant_id, tenant_update)
    
    return {"message": "Payment status updated successfully", "tenant": updated_tenant}
