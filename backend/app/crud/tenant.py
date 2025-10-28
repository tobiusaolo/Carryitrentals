from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date, timedelta
from ..models.tenant import Tenant
from ..schemas.tenant import TenantCreate, TenantUpdate, TenantPaymentStatus

class TenantCRUD:
    def create_tenant(self, db: Session, tenant: TenantCreate) -> Tenant:
        db_tenant = Tenant(
            first_name=tenant.first_name,
            last_name=tenant.last_name,
            email=tenant.email,
            phone=tenant.phone,
            age=tenant.age,
            national_id=tenant.national_id,
            previous_address=tenant.previous_address,
            previous_city=tenant.previous_city,
            previous_state=tenant.previous_state,
            previous_country=tenant.previous_country,
            occupation=tenant.occupation,
            employer_name=tenant.employer_name,
            monthly_income=tenant.monthly_income,
            number_of_family_members=tenant.number_of_family_members,
            family_details=tenant.family_details,
            property_id=tenant.property_id,
            unit_id=tenant.unit_id,
            move_in_date=tenant.move_in_date,
            monthly_rent=tenant.monthly_rent,
            deposit_paid=tenant.deposit_paid,
            emergency_contact_name=tenant.emergency_contact_name,
            emergency_contact_phone=tenant.emergency_contact_phone,
            emergency_contact_relationship=tenant.emergency_contact_relationship,
            notes=tenant.notes,
            next_payment_due=tenant.move_in_date + timedelta(days=30)  # First payment due 30 days after move-in
        )
        db.add(db_tenant)
        db.commit()
        db.refresh(db_tenant)
        return db_tenant
    
    def get_tenant_by_id(self, db: Session, tenant_id: int) -> Optional[Tenant]:
        return db.query(Tenant).options(
            joinedload(Tenant.property),
            joinedload(Tenant.unit)
        ).filter(Tenant.id == tenant_id).first()
    
    def get_tenants_by_property(self, db: Session, property_id: int, skip: int = 0, limit: int = 100) -> List[Tenant]:
        return db.query(Tenant).options(
            joinedload(Tenant.property),
            joinedload(Tenant.unit)
        ).filter(Tenant.property_id == property_id).offset(skip).limit(limit).all()
    
    def get_tenants_by_unit(self, db: Session, unit_id: int) -> List[Tenant]:
        return db.query(Tenant).options(
            joinedload(Tenant.property),
            joinedload(Tenant.unit)
        ).filter(Tenant.unit_id == unit_id).all()
    
    def get_active_tenants(self, db: Session, skip: int = 0, limit: int = 100) -> List[Tenant]:
        return db.query(Tenant).options(
            joinedload(Tenant.property),
            joinedload(Tenant.unit)
        ).filter(Tenant.is_active == True).offset(skip).limit(limit).all()
    
    def get_all_tenants(self, db: Session, skip: int = 0, limit: int = 100) -> List[Tenant]:
        return db.query(Tenant).options(
            joinedload(Tenant.property),
            joinedload(Tenant.unit)
        ).offset(skip).limit(limit).all()
    
    def get_tenants_by_payment_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Tenant]:
        return db.query(Tenant).options(
            joinedload(Tenant.property),
            joinedload(Tenant.unit)
        ).filter(Tenant.rent_payment_status == status).offset(skip).limit(limit).all()
    
    def get_overdue_tenants(self, db: Session) -> List[Tenant]:
        today = date.today()
        return db.query(Tenant).options(
            joinedload(Tenant.property),
            joinedload(Tenant.unit)
        ).filter(
            Tenant.is_active == True,
            Tenant.next_payment_due < today,
            Tenant.rent_payment_status != "paid"
        ).all()
    
    def update_tenant(self, db: Session, tenant_id: int, tenant_update: TenantUpdate) -> Optional[Tenant]:
        db_tenant = self.get_tenant_by_id(db, tenant_id)
        if not db_tenant:
            return None
        
        update_data = tenant_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_tenant, field, value)
        
        db_tenant.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_tenant)
        return db_tenant
    
    def update_tenant_payment_status(self, db: Session, tenant_id: int, status: str, payment_date: date = None) -> Optional[Tenant]:
        db_tenant = self.get_tenant_by_id(db, tenant_id)
        if not db_tenant:
            return None
        
        db_tenant.rent_payment_status = status
        if payment_date:
            db_tenant.last_payment_date = payment_date
            # Set next payment due date to 30 days from payment date
            db_tenant.next_payment_due = payment_date + timedelta(days=30)
        
        db_tenant.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_tenant)
        return db_tenant
    
    def move_out_tenant(self, db: Session, tenant_id: int, move_out_date: date) -> Optional[Tenant]:
        db_tenant = self.get_tenant_by_id(db, tenant_id)
        if not db_tenant:
            return None
        
        db_tenant.move_out_date = move_out_date
        db_tenant.is_active = False
        db_tenant.rent_payment_status = "moved_out"
        
        db_tenant.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_tenant)
        return db_tenant
    
    def delete_tenant(self, db: Session, tenant_id: int) -> bool:
        db_tenant = self.get_tenant_by_id(db, tenant_id)
        if not db_tenant:
            return False
        
        db.delete(db_tenant)
        db.commit()
        return True
    
    def search_tenants(self, db: Session, query: str, skip: int = 0, limit: int = 100) -> List[Tenant]:
        return db.query(Tenant).options(
            joinedload(Tenant.property),
            joinedload(Tenant.unit)
        ).filter(
            Tenant.first_name.ilike(f"%{query}%") |
            Tenant.last_name.ilike(f"%{query}%") |
            Tenant.national_id.ilike(f"%{query}%") |
            Tenant.phone.ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()
    
    def get_tenant_payment_summary(self, db: Session, tenant_id: int) -> dict:
        """Get payment summary for a tenant including total paid and balance due"""
        db_tenant = self.get_tenant_by_id(db, tenant_id)
        if not db_tenant:
            return None
        
        # Calculate days overdue
        days_overdue = 0
        if db_tenant.next_payment_due and db_tenant.next_payment_due < date.today():
            days_overdue = (date.today() - db_tenant.next_payment_due).days
        
        # Calculate total paid (this would need to be calculated from payments table)
        # For now, we'll use a placeholder
        total_paid = 0  # This should be calculated from actual payments
        
        # Calculate balance due
        balance_due = float(db_tenant.monthly_rent) - total_paid
        
        return {
            "tenant_id": db_tenant.id,
            "tenant_name": f"{db_tenant.first_name} {db_tenant.last_name}",
            "unit_number": db_tenant.unit.unit_number if db_tenant.unit else "N/A",
            "property_name": db_tenant.property.name if db_tenant.property else "N/A",
            "monthly_rent": db_tenant.monthly_rent,
            "rent_payment_status": db_tenant.rent_payment_status,
            "last_payment_date": db_tenant.last_payment_date,
            "next_payment_due": db_tenant.next_payment_due,
            "days_overdue": days_overdue,
            "total_paid": total_paid,
            "balance_due": balance_due
        }

    def get_tenant_payment_status(self, db: Session, tenant_id: int) -> Optional[TenantPaymentStatus]:
        tenant = self.get_tenant_by_id(db, tenant_id)
        if not tenant:
            return None
        
        return TenantPaymentStatus(
            tenant_id=tenant.id,
            tenant_name=f"{tenant.first_name} {tenant.last_name}",
            unit_number=tenant.unit.unit_number,
            property_name=tenant.property.name,
            monthly_rent=tenant.monthly_rent,
            rent_payment_status=tenant.rent_payment_status,
            last_payment_date=tenant.last_payment_date,
            next_payment_due=tenant.next_payment_due
        )

tenant_crud = TenantCRUD()
