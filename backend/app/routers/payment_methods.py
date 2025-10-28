from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..auth import require_roles
from ..schemas.payment_method import PaymentMethodCreate, PaymentMethodResponse, PaymentMethodUpdate
from ..crud.payment_method import (
    create_payment_method, get_payment_method, get_payment_methods, 
    get_active_payment_methods, update_payment_method, delete_payment_method
)
from ..models.user import User

router = APIRouter(prefix="/payment-methods", tags=["Payment Methods"])

@router.post("/", response_model=PaymentMethodResponse)
async def create_payment_method_endpoint(
    payment_method: PaymentMethodCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Create a new payment method (Admin only)."""
    return create_payment_method(db, payment_method)

@router.get("/", response_model=List[PaymentMethodResponse])
async def get_payment_methods_endpoint(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get all payment methods (Admin only)."""
    return get_payment_methods(db, skip=skip, limit=limit)

@router.get("/active", response_model=List[PaymentMethodResponse])
async def get_active_payment_methods_endpoint(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get all active payment methods (Admin only)."""
    return get_active_payment_methods(db)

@router.get("/{payment_method_id}", response_model=PaymentMethodResponse)
async def get_payment_method_endpoint(
    payment_method_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Get payment method by ID (Admin only)."""
    payment_method = get_payment_method(db, payment_method_id)
    if not payment_method:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    return payment_method

@router.put("/{payment_method_id}", response_model=PaymentMethodResponse)
async def update_payment_method_endpoint(
    payment_method_id: int,
    payment_method_update: PaymentMethodUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Update payment method (Admin only)."""
    payment_method = update_payment_method(db, payment_method_id, payment_method_update)
    if not payment_method:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    return payment_method

@router.delete("/{payment_method_id}")
async def delete_payment_method_endpoint(
    payment_method_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Delete payment method (Admin only)."""
    success = delete_payment_method(db, payment_method_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    return {"message": "Payment method deleted successfully"}
