"""
Payment Reconciliation Service
Automatically matches mobile payments to rent records and detects discrepancies
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal
import logging

from ..database import SessionLocal
from ..models.mobile_payment import MobilePayment
from ..models.payment import Payment
from ..models.tenant import Tenant
from ..models.enums import PaymentStatus
from ..crud.payment import payment_crud
from ..crud.tenant import tenant_crud

logger = logging.getLogger(__name__)

class PaymentReconciliationService:
    """Service to reconcile mobile payments with expected rent payments"""
    
    def __init__(self):
        self.db = SessionLocal()
    
    def __del__(self):
        if hasattr(self, 'db'):
            self.db.close()
    
    def reconcile_payments(self, db: Optional[Session] = None, property_id: Optional[int] = None, month: Optional[int] = None, year: Optional[int] = None) -> Dict:
        """
        Reconcile all payments for a period
        Returns summary of matched, unmatched, and discrepancies
        """
        try:
            # Use provided db or instance db
            session = db if db else self.db
            
            if not month:
                month = date.today().month
            if not year:
                year = date.today().year
            
            month_date = date(year, month, 1)
            month_start = month_date
            if month_date.month == 12:
                month_end = date(month_date.year + 1, 1, 1) - timedelta(days=1)
            else:
                month_end = date(month_date.year, month_date.month + 1, 1) - timedelta(days=1)
            
            # Get all mobile payments for the period
            mobile_payments = session.query(MobilePayment).filter(
                MobilePayment.initiated_at >= month_start,
                MobilePayment.initiated_at <= month_end,
                MobilePayment.status == PaymentStatus.PAID
            ).all()
            
            # Get all expected rent payments (from tenants)
            tenants = tenant_crud.get_active_tenants(session)
            if property_id:
                tenants = [t for t in tenants if t.property_id == property_id]
            
            summary = {
                "period": f"{month_start} to {month_end}",
                "total_mobile_payments": len(mobile_payments),
                "total_expected_payments": len(tenants),
                "matched": 0,
                "unmatched_mobile": 0,
                "unmatched_expected": 0,
                "amount_discrepancies": 0,
                "total_received": 0,
                "total_expected": 0,
                "discrepancy_details": []
            }
            
            # Calculate expected amount
            summary["total_expected"] = sum(float(t.monthly_rent) for t in tenants)
            summary["total_received"] = sum(float(mp.amount) for mp in mobile_payments)
            
            # Match mobile payments to tenants
            matched_tenant_ids = set()
            unmatched_mobile = []
            
            for mp in mobile_payments:
                if mp.tenant_id:
                    matched_tenant_ids.add(mp.tenant_id)
                    summary["matched"] += 1
                    
                    # Check amount match
                    tenant = tenant_crud.get_tenant_by_id(session, mp.tenant_id)
                    if tenant:
                        expected_amount = float(tenant.monthly_rent) * mp.months_advance
                        paid_amount = float(mp.amount)
                        
                        if abs(expected_amount - paid_amount) > 1:  # Allow 1 unit variance
                            summary["amount_discrepancies"] += 1
                            summary["discrepancy_details"].append({
                                "tenant_id": mp.tenant_id,
                                "tenant_name": f"{tenant.first_name} {tenant.last_name}",
                                "expected": expected_amount,
                                "paid": paid_amount,
                                "difference": paid_amount - expected_amount,
                                "mobile_payment_id": mp.id
                            })
                else:
                    unmatched_mobile.append(mp)
                    summary["unmatched_mobile"] += 1
            
            # Find tenants who haven't paid
            unmatched_tenants = [t for t in tenants if t.id not in matched_tenant_ids]
            summary["unmatched_expected"] = len(unmatched_tenants)
            
            # Add unmatched tenant details
            summary["unpaid_tenants"] = [
                {
                    "tenant_id": t.id,
                    "tenant_name": f"{t.first_name} {t.last_name}",
                    "unit_number": t.unit.unit_number if t.unit else "N/A",
                    "expected_amount": float(t.monthly_rent),
                    "payment_status": t.rent_payment_status,
                    "due_date": str(t.next_payment_due) if t.next_payment_due else "N/A"
                }
                for t in unmatched_tenants
            ]
            
            # Add unmatched mobile payment details
            summary["unmatched_payments"] = [
                {
                    "mobile_payment_id": mp.id,
                    "amount": float(mp.amount),
                    "phone_number": mp.payer_phone_number,
                    "transaction_id": mp.transaction_id,
                    "date": mp.initiated_at.isoformat()
                }
                for mp in unmatched_mobile
            ]
            
            logger.info(f"Reconciliation completed: {summary}")
            return summary
            
        except Exception as e:
            logger.error(f"Error in payment reconciliation: {str(e)}")
            return {"error": str(e)}
    
    def auto_match_payments(self, property_id: Optional[int] = None) -> Dict:
        """
        Automatically match unmatched mobile payments to tenants
        based on amount and phone number
        """
        try:
            # Get unmatched mobile payments
            unmatched_payments = self.db.query(MobilePayment).filter(
                MobilePayment.status == PaymentStatus.PAID,
                MobilePayment.tenant_id == None
            ).all()
            
            matched_count = 0
            tenants = tenant_crud.get_active_tenants(self.db)
            if property_id:
                tenants = [t for t in tenants if t.property_id == property_id]
            
            for mp in unmatched_payments:
                # Try to match by phone number
                matching_tenant = None
                for tenant in tenants:
                    if tenant.phone == mp.payer_phone_number:
                        # Check if amount matches (with some variance)
                        expected = float(tenant.monthly_rent)
                        paid = float(mp.amount)
                        
                        if abs(expected - paid) < expected * 0.1:  # 10% variance allowed
                            matching_tenant = tenant
                            break
                
                if matching_tenant:
                    # Update mobile payment with tenant_id
                    mp.tenant_id = matching_tenant.id
                    
                    # Update tenant payment status
                    from ..schemas.tenant import TenantUpdate
                    tenant_update = TenantUpdate(
                        last_payment_date=mp.completed_at.date() if mp.completed_at else date.today(),
                        next_payment_due=date.today() + timedelta(days=30 * mp.months_advance),
                        rent_payment_status="paid"
                    )
                    tenant_crud.update_tenant(self.db, matching_tenant.id, tenant_update)
                    
                    matched_count += 1
                    logger.info(f"Auto-matched payment {mp.id} to tenant {matching_tenant.id}")
            
            self.db.commit()
            
            return {
                "matched": matched_count,
                "total_unmatched": len(unmatched_payments)
            }
            
        except Exception as e:
            logger.error(f"Error in auto-match: {str(e)}")
            return {"error": str(e)}

payment_reconciliation_service = PaymentReconciliationService()

