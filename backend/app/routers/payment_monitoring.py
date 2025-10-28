from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, List
from datetime import datetime

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..services.payment_monitor import payment_monitor
from ..services.payment_scheduler import payment_scheduler
from ..models.user import User

router = APIRouter(prefix="/payment-monitoring", tags=["Payment Monitoring"])

@router.post("/run-automated-monitoring", response_model=Dict)
async def run_automated_monitoring(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """
    Run automated payment monitoring to update tenant payment statuses.
    This can be run manually or scheduled to run automatically.
    """
    try:
        # Run monitoring in background to avoid timeout
        result = payment_monitor.run_automated_payment_monitoring()
        
        return {
            "message": "Automated payment monitoring completed",
            "summary": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running automated monitoring: {str(e)}"
        )

@router.get("/tenant-categories", response_model=Dict)
async def get_tenant_categories(
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """
    Get all tenants categorized by their payment status:
    - overdue: Payment overdue by more than 7 days
    - due: Payment due today or within 7 days
    - pending: Payment not yet due
    - paid: Recently paid
    - moved_out: Tenant has moved out
    """
    try:
        categories = payment_monitor.get_tenant_categories()
        
        # Filter by owner's properties if user is owner
        if current_user.role == "owner":
            from ..crud.property import property_crud
            owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
            property_ids = [p.id for p in owner_properties]
            
            # Filter categories to only include tenants from owner's properties
            filtered_categories = {}
            for status, tenants in categories.items():
                if isinstance(tenants, list):
                    filtered_categories[status] = [
                        tenant for tenant in tenants 
                        if any(tenant.get("property_name") == prop.name for prop in owner_properties)
                    ]
                else:
                    filtered_categories[status] = tenants
            
            categories = filtered_categories
        
        return {
            "categories": categories,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting tenant categories: {str(e)}"
        )

@router.get("/payment-summary", response_model=Dict)
async def get_payment_summary(
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """
    Get summary statistics for payment monitoring including:
    - Count of tenants in each status
    - Total amounts overdue, due, pending
    """
    try:
        summary = payment_monitor.get_payment_summary()
        
        return {
            "summary": summary,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting payment summary: {str(e)}"
        )

@router.get("/overdue-tenants", response_model=List[Dict])
async def get_overdue_tenants(
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """
    Get list of tenants with overdue payments
    """
    try:
        categories = payment_monitor.get_tenant_categories()
        
        # Filter by owner's properties if user is owner
        if current_user.role == "owner":
            from ..crud.property import property_crud
            owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
            
            overdue_tenants = [
                tenant for tenant in categories.get("overdue", [])
                if any(tenant.get("property_name") == prop.name for prop in owner_properties)
            ]
        else:
            overdue_tenants = categories.get("overdue", [])
        
        return overdue_tenants
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting overdue tenants: {str(e)}"
        )

@router.get("/due-tenants", response_model=List[Dict])
async def get_due_tenants(
    current_user: User = Depends(require_roles(["admin", "owner", "manager"])),
    db: Session = Depends(get_db)
):
    """
    Get list of tenants with payments due soon
    """
    try:
        categories = payment_monitor.get_tenant_categories()
        
        # Filter by owner's properties if user is owner
        if current_user.role == "owner":
            from ..crud.property import property_crud
            owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
            
            due_tenants = [
                tenant for tenant in categories.get("due", [])
                if any(tenant.get("property_name") == prop.name for prop in owner_properties)
            ]
        else:
            due_tenants = categories.get("due", [])
        
        return due_tenants
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting due tenants: {str(e)}"
        )

@router.post("/bulk-update-status", response_model=Dict)
async def bulk_update_tenant_status(
    tenant_ids: List[int],
    new_status: str,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """
    Bulk update payment status for multiple tenants
    """
    try:
        from ..crud.tenant import tenant_crud
        from ..schemas.tenant import TenantUpdate
        
        updated_count = 0
        errors = []
        
        for tenant_id in tenant_ids:
            try:
                tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
                if not tenant:
                    errors.append(f"Tenant {tenant_id} not found")
                    continue
                
                # Check if owner has access to this tenant
                if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
                    errors.append(f"Access denied for tenant {tenant_id}")
                    continue
                
                # Update tenant status
                update_data = TenantUpdate(rent_payment_status=new_status)
                tenant_crud.update_tenant(db, tenant_id, update_data)
                updated_count += 1
                
            except Exception as e:
                errors.append(f"Error updating tenant {tenant_id}: {str(e)}")
        
        return {
            "message": f"Bulk update completed",
            "updated_count": updated_count,
            "total_requested": len(tenant_ids),
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in bulk update: {str(e)}"
        )

@router.post("/start-scheduler", response_model=Dict)
async def start_payment_scheduler(
    current_user: User = Depends(require_roles(["admin"])),
):
    """
    Start the automated payment monitoring scheduler
    Only accessible by admin users
    """
    try:
        success = payment_scheduler.start_scheduler()
        
        if not success:
            return {
                "message": "Failed to start scheduler - schedule module not available",
                "error": "Schedule module not installed",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return {
            "message": "Payment monitoring scheduler started successfully",
            "scheduled_tasks": [
                "Daily payment check: 9:00 AM",
                "Weekly comprehensive check: Monday 8:00 AM", 
                "Monthly report: 1st of each month 10:00 AM"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting scheduler: {str(e)}"
        )

@router.post("/stop-scheduler", response_model=Dict)
async def stop_payment_scheduler(
    current_user: User = Depends(require_roles(["admin"])),
):
    """
    Stop the automated payment monitoring scheduler
    Only accessible by admin users
    """
    try:
        payment_scheduler.stop_scheduler()
        
        return {
            "message": "Payment monitoring scheduler stopped successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error stopping scheduler: {str(e)}"
        )

@router.post("/run-manual-check", response_model=Dict)
async def run_manual_payment_check(
    current_user: User = Depends(require_roles(["admin", "owner"])),
):
    """
    Run a manual payment check immediately
    Useful for testing or immediate status updates
    """
    try:
        result = payment_scheduler.run_manual_check()
        
        return {
            "message": "Manual payment check completed",
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running manual check: {str(e)}"
        )
