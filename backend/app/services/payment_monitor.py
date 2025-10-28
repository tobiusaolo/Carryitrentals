"""
Automated Payment Status Monitoring Service
Handles automatic categorization of tenants based on payment status and due dates
"""

from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional
import logging

from ..database import SessionLocal
from ..models.tenant import Tenant
from ..models.enums import UnitStatus
from ..crud.tenant import tenant_crud
from ..crud.unit import unit_crud

logger = logging.getLogger(__name__)

class PaymentMonitorService:
    """Service to automatically monitor and update tenant payment statuses"""
    
    def __init__(self):
        self.db = SessionLocal()
    
    def __del__(self):
        if hasattr(self, 'db'):
            self.db.close()
    
    def run_automated_payment_monitoring(self) -> Dict:
        """
        Main function to run automated payment monitoring
        Returns summary of all status updates made
        """
        try:
            logger.info("Starting automated payment monitoring...")
            
            summary = {
                "overdue_updated": 0,
                "due_updated": 0,
                "pending_updated": 0,
                "moved_out_updated": 0,
                "total_processed": 0,
                "errors": []
            }
            
            # Get all active tenants
            active_tenants = tenant_crud.get_active_tenants(self.db)
            summary["total_processed"] = len(active_tenants)
            
            for tenant in active_tenants:
                try:
                    # Update tenant status based on current date and payment info
                    status_update = self._determine_tenant_payment_status(tenant)
                    
                    if status_update:
                        self._update_tenant_status(tenant, status_update)
                        summary[f"{status_update}_updated"] += 1
                        
                        logger.info(f"Updated tenant {tenant.id} ({tenant.first_name} {tenant.last_name}) to {status_update}")
                
                except Exception as e:
                    error_msg = f"Error processing tenant {tenant.id}: {str(e)}"
                    logger.error(error_msg)
                    summary["errors"].append(error_msg)
            
            logger.info(f"Payment monitoring completed. Summary: {summary}")
            return summary
            
        except Exception as e:
            logger.error(f"Error in automated payment monitoring: {str(e)}")
            return {"error": str(e)}
    
    def _determine_tenant_payment_status(self, tenant: Tenant) -> Optional[str]:
        """
        Determine what payment status a tenant should have based on:
        - Current date vs next payment due date
        - Last payment date
        - Move out date
        - Current status
        """
        today = date.today()
        
        # Check if tenant has moved out
        if tenant.move_out_date and tenant.move_out_date <= today:
            return "moved_out"
        
        # If no payment due date is set, mark as pending
        if not tenant.next_payment_due:
            return "pending"
        
        # Calculate days since due date
        days_overdue = (today - tenant.next_payment_due).days
        
        # Determine status based on payment timing
        if days_overdue > 0:
            # Overdue: payment was due more than 0 days ago
            if days_overdue <= 7:
                return "due"  # Recently due (within 7 days)
            else:
                return "overdue"  # Significantly overdue (more than 7 days)
        elif days_overdue == 0:
            # Due today
            return "due"
        else:
            # Payment not yet due
            return "pending"
    
    def _update_tenant_status(self, tenant: Tenant, new_status: str):
        """Update tenant's payment status and related data"""
        from ..schemas.tenant import TenantUpdate
        
        update_data = TenantUpdate(rent_payment_status=new_status)
        
        # If marking as moved out, also update unit status
        if new_status == "moved_out":
            update_data.move_out_date = date.today()
            update_data.is_active = False
            
            # Update unit status to available
            from ..schemas.unit import UnitUpdate
            unit_update = UnitUpdate(status=UnitStatus.AVAILABLE)
            unit_crud.update_unit(self.db, tenant.unit_id, unit_update)
        
        # Update tenant
        tenant_crud.update_tenant(self.db, tenant.id, update_data)
    
    def get_tenant_categories(self) -> Dict[str, List[Dict]]:
        """
        Get all tenants categorized by their payment status
        Returns organized data for dashboard display
        """
        try:
            active_tenants = tenant_crud.get_active_tenants(self.db)
            
            categories = {
                "overdue": [],
                "due": [],
                "pending": [],
                "moved_out": [],
                "paid": []
            }
            
            today = date.today()
            
            for tenant in active_tenants:
                tenant_info = {
                    "id": tenant.id,
                    "name": f"{tenant.first_name} {tenant.last_name}",
                    "email": tenant.email,
                    "phone": tenant.phone,
                    "unit_number": tenant.unit.unit_number if tenant.unit else "N/A",
                    "property_name": tenant.property.name if tenant.property else "N/A",
                    "monthly_rent": float(tenant.monthly_rent),
                    "last_payment_date": tenant.last_payment_date.isoformat() if tenant.last_payment_date else None,
                    "next_payment_due": tenant.next_payment_due.isoformat() if tenant.next_payment_due else None,
                    "current_status": tenant.rent_payment_status,
                    "days_overdue": None
                }
                
                # Calculate days overdue if applicable
                if tenant.next_payment_due:
                    days_overdue = (today - tenant.next_payment_due).days
                    tenant_info["days_overdue"] = days_overdue if days_overdue > 0 else 0
                
                # Categorize tenant
                status = self._determine_tenant_payment_status(tenant)
                categories[status].append(tenant_info)
            
            return categories
            
        except Exception as e:
            logger.error(f"Error categorizing tenants: {str(e)}")
            return {"error": str(e)}
    
    def get_payment_summary(self) -> Dict:
        """Get summary statistics for payment monitoring"""
        try:
            categories = self.get_tenant_categories()
            
            summary = {
                "total_tenants": sum(len(tenants) for tenants in categories.values()),
                "overdue_count": len(categories.get("overdue", [])),
                "due_count": len(categories.get("due", [])),
                "pending_count": len(categories.get("pending", [])),
                "paid_count": len(categories.get("paid", [])),
                "moved_out_count": len(categories.get("moved_out", [])),
                "total_overdue_amount": sum(t["monthly_rent"] for t in categories.get("overdue", [])),
                "total_due_amount": sum(t["monthly_rent"] for t in categories.get("due", [])),
                "total_pending_amount": sum(t["monthly_rent"] for t in categories.get("pending", []))
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting payment summary: {str(e)}")
            return {"error": str(e)}

# Global instance
payment_monitor = PaymentMonitorService()
