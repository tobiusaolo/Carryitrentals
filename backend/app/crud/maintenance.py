from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.maintenance import MaintenanceRequest
from ..schemas.maintenance import MaintenanceRequestCreate, MaintenanceRequestUpdate

class MaintenanceCRUD:
    def create_maintenance_request(self, db: Session, maintenance: MaintenanceRequestCreate) -> MaintenanceRequest:
        db_maintenance = MaintenanceRequest(
            property_id=maintenance.property_id,
            unit_id=maintenance.unit_id,
            requester_id=maintenance.requester_id,
            title=maintenance.title,
            description=maintenance.description,
            priority=maintenance.priority,
            status=maintenance.status,
            estimated_cost=maintenance.estimated_cost,
            actual_cost=maintenance.actual_cost,
            assigned_to=maintenance.assigned_to,
            scheduled_date=maintenance.scheduled_date,
            completed_date=maintenance.completed_date,
            images=maintenance.images
        )
        db.add(db_maintenance)
        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance
    
    def get_maintenance_request_by_id(self, db: Session, maintenance_id: int) -> Optional[MaintenanceRequest]:
        return db.query(MaintenanceRequest).filter(MaintenanceRequest.id == maintenance_id).first()
    
    def get_maintenance_requests_by_property(self, db: Session, property_id: int, skip: int = 0, limit: int = 100) -> List[MaintenanceRequest]:
        return db.query(MaintenanceRequest).filter(MaintenanceRequest.property_id == property_id).offset(skip).limit(limit).all()
    
    def get_maintenance_requests_by_unit(self, db: Session, unit_id: int, skip: int = 0, limit: int = 100) -> List[MaintenanceRequest]:
        return db.query(MaintenanceRequest).filter(MaintenanceRequest.unit_id == unit_id).offset(skip).limit(limit).all()
    
    def get_maintenance_requests_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[MaintenanceRequest]:
        return db.query(MaintenanceRequest).filter(MaintenanceRequest.status == status).offset(skip).limit(limit).all()
    
    def get_maintenance_requests_by_priority(self, db: Session, priority: str, skip: int = 0, limit: int = 100) -> List[MaintenanceRequest]:
        return db.query(MaintenanceRequest).filter(MaintenanceRequest.priority == priority).offset(skip).limit(limit).all()
    
    def update_maintenance_request(self, db: Session, maintenance_id: int, maintenance_update: MaintenanceRequestUpdate) -> Optional[MaintenanceRequest]:
        db_maintenance = self.get_maintenance_request_by_id(db, maintenance_id)
        if not db_maintenance:
            return None
        
        update_data = maintenance_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_maintenance, field, value)
        
        db_maintenance.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance
    
    def assign_maintenance_request(self, db: Session, maintenance_id: int, assigned_to: str) -> Optional[MaintenanceRequest]:
        db_maintenance = self.get_maintenance_request_by_id(db, maintenance_id)
        if not db_maintenance:
            return None
        
        db_maintenance.assigned_to = assigned_to
        db_maintenance.status = "in_progress"
        db_maintenance.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance
    
    def complete_maintenance_request(self, db: Session, maintenance_id: int, actual_cost: float = None) -> Optional[MaintenanceRequest]:
        db_maintenance = self.get_maintenance_request_by_id(db, maintenance_id)
        if not db_maintenance:
            return None
        
        db_maintenance.status = "completed"
        db_maintenance.completed_date = datetime.utcnow()
        if actual_cost:
            db_maintenance.actual_cost = actual_cost
        db_maintenance.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance
    
    def delete_maintenance_request(self, db: Session, maintenance_id: int) -> bool:
        db_maintenance = self.get_maintenance_request_by_id(db, maintenance_id)
        if not db_maintenance:
            return False
        
        db.delete(db_maintenance)
        db.commit()
        return True

maintenance_crud = MaintenanceCRUD()
