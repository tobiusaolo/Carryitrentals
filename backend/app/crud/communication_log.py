from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.communication_log import CommunicationLog
from ..schemas.communication_log import CommunicationLogCreate, CommunicationLogUpdate

class CommunicationLogCRUD:
    def create_log(self, db: Session, log: CommunicationLogCreate, sender_id: int) -> CommunicationLog:
        db_log = CommunicationLog(
            **log.dict(),
            sender_id=sender_id
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    
    def get_log_by_id(self, db: Session, log_id: int) -> Optional[CommunicationLog]:
        return db.query(CommunicationLog).filter(CommunicationLog.id == log_id).first()
    
    def get_logs_by_sender(self, db: Session, sender_id: int, skip: int = 0, limit: int = 100) -> List[CommunicationLog]:
        return db.query(CommunicationLog).filter(
            CommunicationLog.sender_id == sender_id
        ).order_by(CommunicationLog.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_logs_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[CommunicationLog]:
        return db.query(CommunicationLog).filter(
            CommunicationLog.status == status
        ).order_by(CommunicationLog.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_scheduled_logs(self, db: Session) -> List[CommunicationLog]:
        """Get logs that are scheduled but not sent"""
        return db.query(CommunicationLog).filter(
            CommunicationLog.status == "scheduled",
            CommunicationLog.scheduled_at <= datetime.utcnow()
        ).all()
    
    def update_log(self, db: Session, log_id: int, log_update: CommunicationLogUpdate) -> Optional[CommunicationLog]:
        db_log = self.get_log_by_id(db, log_id)
        if not db_log:
            return None
        
        update_data = log_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_log, field, value)
        
        db.commit()
        db.refresh(db_log)
        return db_log
    
    def delete_log(self, db: Session, log_id: int) -> bool:
        db_log = self.get_log_by_id(db, log_id)
        if not db_log:
            return False
        
        db.delete(db_log)
        db.commit()
        return True

communication_log_crud = CommunicationLogCRUD()








