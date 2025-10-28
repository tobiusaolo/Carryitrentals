from typing import Dict, List, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from decimal import Decimal

class AnalyticsService:
    def __init__(self):
        pass
    
    def get_property_analytics(self, db: Session, property_id: int) -> Dict:
        """Get comprehensive analytics for a property."""
        from ..crud.property import property_crud
        from ..crud.unit import unit_crud
        from ..crud.tenant import tenant_crud
        from ..crud.payment import payment_crud
        from ..crud.maintenance import maintenance_crud
        
        # Get property
        property_obj = property_crud.get_property_by_id(db, property_id)
        if not property_obj:
            return {}
        
        # Get units
        units = unit_crud.get_units_by_property(db, property_id)
        total_units = len(units)
        occupied_units = len([u for u in units if u.status == "occupied"])
        available_units = len([u for u in units if u.status == "available"])
        maintenance_units = len([u for u in units if u.status == "maintenance"])
        
        # Calculate occupancy rate
        occupancy_rate = (occupied_units / total_units * 100) if total_units > 0 else 0
        
        # Get tenants
        tenants = tenant_crud.get_tenants_by_property(db, property_id)
        active_tenants = [t for t in tenants if t.is_active]
        
        # Calculate total monthly rent
        total_monthly_rent = sum(float(t.monthly_rent) for t in active_tenants)
        
        # Get payments
        payments = []
        for unit in units:
            unit_payments = payment_crud.get_payments_by_unit(db, unit.id)
            payments.extend(unit_payments)
        
        # Calculate payment analytics
        total_payments = sum(float(p.amount) for p in payments)
        paid_payments = sum(float(p.amount) for p in payments if p.status == "paid")
        pending_payments = sum(float(p.amount) for p in payments if p.status == "pending")
        overdue_payments = sum(float(p.amount) for p in payments if p.status == "overdue")
        
        # Get maintenance requests
        maintenance_requests = maintenance_crud.get_maintenance_requests_by_property(db, property_id)
        total_maintenance_requests = len(maintenance_requests)
        pending_maintenance = len([m for m in maintenance_requests if m.status == "pending"])
        completed_maintenance = len([m for m in maintenance_requests if m.status == "completed"])
        
        # Calculate maintenance costs
        total_maintenance_cost = sum(float(m.actual_cost or 0) for m in maintenance_requests if m.actual_cost)
        
        return {
            "property_id": property_id,
            "property_name": property_obj.name,
            "total_units": total_units,
            "occupied_units": occupied_units,
            "available_units": available_units,
            "maintenance_units": maintenance_units,
            "occupancy_rate": round(occupancy_rate, 2),
            "total_monthly_rent": round(total_monthly_rent, 2),
            "collected_rent": round(paid_payments, 2),
            "pending_rent": round(pending_payments, 2),
            "overdue_rent": round(overdue_payments, 2),
            "payment_collection_rate": round((paid_payments / total_payments * 100) if total_payments > 0 else 0, 2),
            "maintenance_requests_count": total_maintenance_requests,
            "pending_maintenance": pending_maintenance,
            "completed_maintenance": completed_maintenance,
            "total_maintenance_cost": round(total_maintenance_cost, 2)
        }
    
    def get_payment_analytics(self, db: Session, property_id: Optional[int] = None, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict:
        """Get payment analytics."""
        from ..crud.payment import payment_crud
        
        # Get payments based on filters
        if property_id:
            # Get all units for the property
            from ..crud.unit import unit_crud
            units = unit_crud.get_units_by_property(db, property_id)
            unit_ids = [unit.id for unit in units]
            payments = []
            for unit_id in unit_ids:
                unit_payments = payment_crud.get_payments_by_unit(db, unit_id)
                payments.extend(unit_payments)
        else:
            payments = payment_crud.get_payments_by_status(db, "all")
        
        # Filter by date range if provided
        if start_date and end_date:
            payments = [p for p in payments if start_date <= p.due_date <= end_date]
        
        # Calculate analytics
        total_payments = sum(float(p.amount) for p in payments)
        paid_payments = sum(float(p.amount) for p in payments if p.status == "paid")
        pending_payments = sum(float(p.amount) for p in payments if p.status == "pending")
        overdue_payments = sum(float(p.amount) for p in payments if p.status == "overdue")
        partial_payments = sum(float(p.amount) for p in payments if p.status == "partial")
        
        payment_collection_rate = (paid_payments / total_payments * 100) if total_payments > 0 else 0
        
        return {
            "total_payments": round(total_payments, 2),
            "paid_payments": round(paid_payments, 2),
            "pending_payments": round(pending_payments, 2),
            "overdue_payments": round(overdue_payments, 2),
            "partial_payments": round(partial_payments, 2),
            "payment_collection_rate": round(payment_collection_rate, 2),
            "total_payment_count": len(payments),
            "paid_count": len([p for p in payments if p.status == "paid"]),
            "pending_count": len([p for p in payments if p.status == "pending"]),
            "overdue_count": len([p for p in payments if p.status == "overdue"])
        }
    
    def get_maintenance_analytics(self, db: Session, property_id: Optional[int] = None, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict:
        """Get maintenance analytics."""
        from ..crud.maintenance import maintenance_crud
        
        # Get maintenance requests based on filters
        if property_id:
            maintenance_requests = maintenance_crud.get_maintenance_requests_by_property(db, property_id)
        else:
            maintenance_requests = maintenance_crud.get_maintenance_requests_by_status(db, "all")
        
        # Filter by date range if provided
        if start_date and end_date:
            maintenance_requests = [m for m in maintenance_requests if start_date <= m.created_at.date() <= end_date]
        
        # Calculate analytics
        total_requests = len(maintenance_requests)
        pending_requests = len([m for m in maintenance_requests if m.status == "pending"])
        in_progress_requests = len([m for m in maintenance_requests if m.status == "in_progress"])
        completed_requests = len([m for m in maintenance_requests if m.status == "completed"])
        cancelled_requests = len([m for m in maintenance_requests if m.status == "cancelled"])
        
        # Calculate costs
        total_estimated_cost = sum(float(m.estimated_cost or 0) for m in maintenance_requests)
        total_actual_cost = sum(float(m.actual_cost or 0) for m in maintenance_requests)
        
        # Calculate average completion time
        completed_with_dates = [m for m in maintenance_requests if m.status == "completed" and m.completed_date]
        if completed_with_dates:
            completion_times = [(m.completed_date - m.created_at).days for m in completed_with_dates]
            average_completion_time = sum(completion_times) / len(completion_times)
        else:
            average_completion_time = 0
        
        # Priority breakdown
        urgent_requests = len([m for m in maintenance_requests if m.priority == "urgent"])
        high_requests = len([m for m in maintenance_requests if m.priority == "high"])
        medium_requests = len([m for m in maintenance_requests if m.priority == "medium"])
        low_requests = len([m for m in maintenance_requests if m.priority == "low"])
        
        return {
            "total_requests": total_requests,
            "pending_requests": pending_requests,
            "in_progress_requests": in_progress_requests,
            "completed_requests": completed_requests,
            "cancelled_requests": cancelled_requests,
            "total_estimated_cost": round(total_estimated_cost, 2),
            "total_actual_cost": round(total_actual_cost, 2),
            "average_completion_time": round(average_completion_time, 2),
            "urgent_requests": urgent_requests,
            "high_requests": high_requests,
            "medium_requests": medium_requests,
            "low_requests": low_requests
        }
    
    def get_tenant_analytics(self, db: Session, property_id: Optional[int] = None) -> Dict:
        """Get tenant analytics."""
        from ..crud.tenant import tenant_crud
        
        # Get active tenants
        active_tenants = tenant_crud.get_active_tenants(db)
        
        # Filter by property if specified
        if property_id:
            active_tenants = [t for t in active_tenants if t.property_id == property_id]
        
        # Calculate analytics
        total_tenants = len(active_tenants)
        
        # Payment history analytics
        from ..crud.payment import payment_crud
        tenant_payment_history = {}
        for tenant in active_tenants:
            payments = payment_crud.get_payments_by_tenant(db, tenant.id)
            paid_payments = len([p for p in payments if p.status == "paid"])
            total_payments = len(payments)
            tenant_payment_history[tenant.id] = {
                "paid_payments": paid_payments,
                "total_payments": total_payments,
                "payment_rate": (paid_payments / total_payments * 100) if total_payments > 0 else 0
            }
        
        # Calculate average payment rate
        if tenant_payment_history:
            avg_payment_rate = sum(t["payment_rate"] for t in tenant_payment_history.values()) / len(tenant_payment_history)
        else:
            avg_payment_rate = 0
        
        return {
            "total_tenants": total_tenants,
            "average_payment_rate": round(avg_payment_rate, 2),
            "tenant_payment_history": tenant_payment_history
        }
    
    def get_financial_summary(self, db: Session, property_id: Optional[int] = None, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict:
        """Get financial summary."""
        # Get payment analytics
        payment_analytics = self.get_payment_analytics(db, property_id, start_date, end_date)
        
        # Get maintenance analytics
        maintenance_analytics = self.get_maintenance_analytics(db, property_id, start_date, end_date)
        
        # Calculate net income
        total_income = payment_analytics["paid_payments"]
        total_expenses = maintenance_analytics["total_actual_cost"]
        net_income = total_income - total_expenses
        
        return {
            "total_income": payment_analytics["paid_payments"],
            "total_expenses": maintenance_analytics["total_actual_cost"],
            "net_income": round(net_income, 2),
            "pending_income": payment_analytics["pending_payments"],
            "overdue_income": payment_analytics["overdue_payments"],
            "maintenance_costs": maintenance_analytics["total_actual_cost"],
            "estimated_maintenance_costs": maintenance_analytics["total_estimated_cost"]
        }
    
    def get_occupancy_analytics(self, db: Session, property_id: Optional[int] = None) -> Dict:
        """Get rental property occupancy analytics."""
        from ..crud.property import property_crud
        from ..crud.unit import unit_crud
        from ..crud.tenant import tenant_crud
        
        if property_id:
            # Get analytics for specific property
            property_obj = property_crud.get_property_by_id(db, property_id)
            if not property_obj:
                return {}
            
            units = unit_crud.get_units_by_property(db, property_id)
            properties = [property_obj]
        else:
            # Get analytics for all properties
            properties = property_crud.get_all_properties(db)
            units = []
            for prop in properties:
                prop_units = unit_crud.get_units_by_property(db, prop.id)
                units.extend(prop_units)
        
        # Calculate occupancy metrics
        total_units = len(units)
        occupied_units = len([u for u in units if u.status == "occupied"])
        available_units = len([u for u in units if u.status == "available"])
        maintenance_units = len([u for u in units if u.status == "maintenance"])
        
        # Calculate occupancy rate
        occupancy_rate = (occupied_units / total_units * 100) if total_units > 0 else 0
        
        # Get tenant analytics
        active_tenants = []
        
        for unit in units:
            unit_tenants = tenant_crud.get_tenants_by_unit(db, unit.id)
            active_tenants.extend([t for t in unit_tenants if t.is_active])
        
        # Calculate average tenant duration (using move_in_date)
        if active_tenants:
            from datetime import date
            tenant_durations = [(date.today() - t.move_in_date).days for t in active_tenants]
            avg_tenant_duration = sum(tenant_durations) / len(tenant_durations)
        else:
            avg_tenant_duration = 0
        
        # Calculate total monthly rent potential
        total_monthly_rent = sum(float(t.monthly_rent) for t in active_tenants)
        
        return {
            "total_units": total_units,
            "occupied_units": occupied_units,
            "available_units": available_units,
            "maintenance_units": maintenance_units,
            "occupancy_rate": round(occupancy_rate, 2),
            "active_tenants": len(active_tenants),
            "average_tenant_duration_days": round(avg_tenant_duration, 2),
            "total_monthly_rent": round(total_monthly_rent, 2),
            "properties_count": len(properties)
        }

analytics_service = AnalyticsService()
