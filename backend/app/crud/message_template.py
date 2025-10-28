from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.message_template import MessageTemplate
from ..schemas.message_template import MessageTemplateCreate, MessageTemplateUpdate

class MessageTemplateCRUD:
    def create_template(self, db: Session, template: MessageTemplateCreate, user_id: int) -> MessageTemplate:
        db_template = MessageTemplate(
            **template.dict(),
            created_by_user_id=user_id
        )
        db.add(db_template)
        db.commit()
        db.refresh(db_template)
        return db_template
    
    def get_template_by_id(self, db: Session, template_id: int) -> Optional[MessageTemplate]:
        return db.query(MessageTemplate).filter(MessageTemplate.id == template_id).first()
    
    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[MessageTemplate]:
        """Get all templates"""
        return db.query(MessageTemplate).offset(skip).limit(limit).all()
    
    def get_templates_by_user(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[MessageTemplate]:
        return db.query(MessageTemplate).filter(
            MessageTemplate.created_by_user_id == user_id
        ).offset(skip).limit(limit).all()
    
    def get_templates_by_category(self, db: Session, category: str, skip: int = 0, limit: int = 100) -> List[MessageTemplate]:
        return db.query(MessageTemplate).filter(
            MessageTemplate.category == category,
            MessageTemplate.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_active_templates(self, db: Session, skip: int = 0, limit: int = 100) -> List[MessageTemplate]:
        return db.query(MessageTemplate).filter(
            MessageTemplate.is_active == True
        ).offset(skip).limit(limit).all()
    
    def update_template(self, db: Session, template_id: int, template_update: MessageTemplateUpdate) -> Optional[MessageTemplate]:
        db_template = self.get_template_by_id(db, template_id)
        if not db_template:
            return None
        
        update_data = template_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_template, field, value)
        
        db_template.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_template)
        return db_template
    
    def delete_template(self, db: Session, template_id: int) -> bool:
        db_template = self.get_template_by_id(db, template_id)
        if not db_template:
            return False
        
        db.delete(db_template)
        db.commit()
        return True

message_template_crud = MessageTemplateCRUD()

