from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class CommunicationLog(Base):
    __tablename__ = "communication_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_ids = Column(Text)  # JSON array of user IDs
    method = Column(String, nullable=False)  # email, sms, both
    template_id = Column(Integer, ForeignKey("message_templates.id"))
    subject = Column(String)  # For emails
    message_content = Column(Text, nullable=False)
    sent_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    status = Column(String, default="pending")  # pending, sent, failed, scheduled
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    delivery_report = Column(Text)  # JSON: detailed delivery status per recipient
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    template = relationship("MessageTemplate", foreign_keys=[template_id])








