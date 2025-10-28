from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime
import json
import asyncio

from ..database import get_db
from ..auth import get_current_active_user, require_roles
from ..schemas.message_template import MessageTemplateCreate, MessageTemplateResponse, MessageTemplateUpdate
from ..schemas.communication_log import CommunicationLogCreate, CommunicationLogResponse, CommunicationLogUpdate, BulkMessageRequest
from ..crud.message_template import message_template_crud
from ..crud.communication_log import communication_log_crud
from ..crud.tenant import tenant_crud
from ..crud.property import property_crud
from ..services.notification import notification_service
from ..models.user import User

router = APIRouter(prefix="/communications", tags=["Communications"])

# ==================== MESSAGE TEMPLATES ====================

@router.post("/templates", response_model=MessageTemplateResponse)
async def create_message_template(
    template: MessageTemplateCreate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create a new message template"""
    return message_template_crud.create_template(db, template, current_user.id)

@router.get("/templates", response_model=List[MessageTemplateResponse])
async def get_message_templates(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get message templates"""
    if category:
        return message_template_crud.get_templates_by_category(db, category, skip, limit)
    return message_template_crud.get_templates_by_user(db, current_user.id, skip, limit)

@router.get("/templates/{template_id}", response_model=MessageTemplateResponse)
async def get_message_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific template"""
    template = message_template_crud.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template

@router.put("/templates/{template_id}", response_model=MessageTemplateResponse)
async def update_message_template(
    template_id: int,
    template_update: MessageTemplateUpdate,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Update a message template"""
    template = message_template_crud.update_template(db, template_id, template_update)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template

@router.delete("/templates/{template_id}")
async def delete_message_template(
    template_id: int,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Delete a message template"""
    success = message_template_crud.delete_template(db, template_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return {"message": "Template deleted successfully"}

# ==================== BULK COMMUNICATIONS ====================

@router.post("/bulk-send", response_model=Dict)
async def send_bulk_message(
    bulk_request: BulkMessageRequest,
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Send bulk messages to tenants"""
    try:
        # Get recipients based on criteria
        recipients = []
        
        if bulk_request.recipient_type == "all":
            # All tenants for owner's properties
            if current_user.role == "owner":
                owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
                property_ids = [p.id for p in owner_properties]
                for prop_id in property_ids:
                    recipients.extend(tenant_crud.get_tenants_by_property(db, prop_id))
            else:
                recipients = tenant_crud.get_active_tenants(db)
                
        elif bulk_request.recipient_type == "property" and bulk_request.property_id:
            # All tenants in a specific property
            property = property_crud.get_property_by_id(db, bulk_request.property_id)
            if not property:
                raise HTTPException(status_code=404, detail="Property not found")
            
            if current_user.role == "owner" and property.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail="Access denied")
            
            recipients = tenant_crud.get_tenants_by_property(db, bulk_request.property_id)
            
        elif bulk_request.recipient_type == "status" and bulk_request.status_filter:
            # Tenants by payment status
            all_tenants = []
            if current_user.role == "owner":
                owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
                for prop in owner_properties:
                    all_tenants.extend(tenant_crud.get_tenants_by_property(db, prop.id))
            else:
                all_tenants = tenant_crud.get_active_tenants(db)
            
            recipients = [t for t in all_tenants if t.rent_payment_status == bulk_request.status_filter]
            
        elif bulk_request.recipient_type == "custom" and bulk_request.custom_recipients:
            # Specific tenants
            for tenant_id in bulk_request.custom_recipients:
                tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
                if tenant:
                    # Verify access
                    if current_user.role == "owner" and tenant.property.owner_id != current_user.id:
                        continue
                    recipients.append(tenant)
        
        if not recipients:
            raise HTTPException(status_code=400, detail="No recipients found")
        
        # Get message content
        message_content = bulk_request.custom_message
        subject = bulk_request.custom_subject
        
        if bulk_request.template_id:
            template = message_template_crud.get_template_by_id(db, bulk_request.template_id)
            if template:
                message_content = template.body
                subject = template.subject
        
        # Create communication log
        log = communication_log_crud.create_log(
            db,
            CommunicationLogCreate(
                recipient_ids=json.dumps([r.id for r in recipients]),
                method=bulk_request.method,
                template_id=bulk_request.template_id,
                subject=subject,
                message_content=message_content,
                scheduled_at=bulk_request.schedule_at
            ),
            current_user.id
        )
        
        # If scheduled for later, don't send now
        if bulk_request.schedule_at and bulk_request.schedule_at > datetime.utcnow():
            log_update = CommunicationLogUpdate(status="scheduled")
            communication_log_crud.update_log(db, log.id, log_update)
            return {
                "status": "scheduled",
                "log_id": log.id,
                "recipient_count": len(recipients),
                "scheduled_at": bulk_request.schedule_at.isoformat()
            }
        
        # Send messages immediately
        sent_count = 0
        failed_count = 0
        delivery_details = []
        
        for recipient in recipients:
            try:
                # Replace variables in message
                personalized_message = message_content.replace("{tenant_name}", f"{recipient.first_name} {recipient.last_name}")
                personalized_message = personalized_message.replace("{amount}", str(recipient.monthly_rent))
                personalized_message = personalized_message.replace("{due_date}", str(recipient.next_payment_due))
                personalized_message = personalized_message.replace("{unit_number}", str(recipient.unit.unit_number if recipient.unit else "N/A"))
                
                success = False
                
                # Send email
                if bulk_request.method in ["email", "both"]:
                    email_sent = await notification_service.send_email(
                        recipient.email,
                        subject or "Message from Property Management",
                        personalized_message
                    )
                    success = success or email_sent
                
                # Send SMS
                if bulk_request.method in ["sms", "both"] and recipient.phone:
                    sms_sent = await notification_service.send_sms(
                        recipient.phone,
                        personalized_message[:160]  # SMS character limit
                    )
                    success = success or sms_sent
                
                if success:
                    sent_count += 1
                    delivery_details.append({"tenant_id": recipient.id, "status": "sent"})
                else:
                    failed_count += 1
                    delivery_details.append({"tenant_id": recipient.id, "status": "failed"})
                    
            except Exception as e:
                failed_count += 1
                delivery_details.append({"tenant_id": recipient.id, "status": "error", "error": str(e)})
        
        # Update log with results
        log_update = CommunicationLogUpdate(
            status="sent",
            sent_count=sent_count,
            failed_count=failed_count,
            sent_at=datetime.utcnow(),
            delivery_report=json.dumps(delivery_details)
        )
        communication_log_crud.update_log(db, log.id, log_update)
        
        return {
            "status": "completed",
            "log_id": log.id,
            "total_recipients": len(recipients),
            "sent": sent_count,
            "failed": failed_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending bulk message: {str(e)}"
        )

@router.get("/logs", response_model=List[CommunicationLogResponse])
async def get_communication_logs(
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get communication logs"""
    if status_filter:
        return communication_log_crud.get_logs_by_status(db, status_filter, skip, limit)
    return communication_log_crud.get_logs_by_sender(db, current_user.id, skip, limit)

@router.get("/logs/{log_id}", response_model=CommunicationLogResponse)
async def get_communication_log(
    log_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific communication log"""
    log = communication_log_crud.get_log_by_id(db, log_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Communication log not found"
        )
    return log

@router.get("/recipient-groups", response_model=Dict)
async def get_recipient_groups(
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Get available recipient groups with counts"""
    try:
        groups = {}
        
        # Get all tenants for owner
        all_tenants = []
        if current_user.role == "owner":
            owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
            for prop in owner_properties:
                all_tenants.extend(tenant_crud.get_tenants_by_property(db, prop.id))
        else:
            all_tenants = tenant_crud.get_active_tenants(db)
        
        # Group by status
        groups["all"] = {"count": len(all_tenants), "label": "All Tenants"}
        groups["paid"] = {
            "count": len([t for t in all_tenants if t.rent_payment_status == "paid"]),
            "label": "Paid Tenants"
        }
        groups["due"] = {
            "count": len([t for t in all_tenants if t.rent_payment_status == "due"]),
            "label": "Due Tenants"
        }
        groups["overdue"] = {
            "count": len([t for t in all_tenants if t.rent_payment_status == "overdue"]),
            "label": "Overdue Tenants"
        }
        
        # Group by property
        if current_user.role == "owner":
            owner_properties = property_crud.get_properties_by_owner(db, current_user.id)
            for prop in owner_properties:
                prop_tenants = tenant_crud.get_tenants_by_property(db, prop.id)
                groups[f"property_{prop.id}"] = {
                    "count": len(prop_tenants),
                    "label": f"{prop.name} Tenants"
                }
        
        return groups
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting recipient groups: {str(e)}"
        )

@router.post("/send-scheduled")
async def process_scheduled_messages(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Process and send scheduled messages (called by scheduler)"""
    try:
        scheduled_logs = communication_log_crud.get_scheduled_logs(db)
        
        processed_count = 0
        for log in scheduled_logs:
            try:
                # Get recipients
                recipient_ids = json.loads(log.recipient_ids)
                
                sent_count = 0
                failed_count = 0
                delivery_details = []
                
                for tenant_id in recipient_ids:
                    tenant = tenant_crud.get_tenant_by_id(db, tenant_id)
                    if not tenant:
                        continue
                    
                    success = False
                    
                    # Send email
                    if log.method in ["email", "both"]:
                        email_sent = await notification_service.send_email(
                            tenant.email,
                            log.subject,
                            log.message_content
                        )
                        success = success or email_sent
                    
                    # Send SMS
                    if log.method in ["sms", "both"] and tenant.phone:
                        sms_sent = await notification_service.send_sms(
                            tenant.phone,
                            log.message_content[:160]
                        )
                        success = success or sms_sent
                    
                    if success:
                        sent_count += 1
                        delivery_details.append({"tenant_id": tenant_id, "status": "sent"})
                    else:
                        failed_count += 1
                        delivery_details.append({"tenant_id": tenant_id, "status": "failed"})
                
                # Update log
                log_update = CommunicationLogUpdate(
                    status="sent",
                    sent_count=sent_count,
                    failed_count=failed_count,
                    sent_at=datetime.utcnow(),
                    delivery_report=json.dumps(delivery_details)
                )
                communication_log_crud.update_log(db, log.id, log_update)
                processed_count += 1
                
            except Exception as e:
                print(f"Error processing scheduled message {log.id}: {e}")
                continue
        
        return {
            "status": "completed",
            "processed": processed_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing scheduled messages: {str(e)}"
        )

# ==================== DEFAULT TEMPLATES ====================

@router.post("/templates/seed-defaults")
async def seed_default_templates(
    current_user: User = Depends(require_roles(["admin", "owner"])),
    db: Session = Depends(get_db)
):
    """Create default message templates"""
    default_templates = [
        {
            "name": "Rent Reminder (3 Days Before)",
            "type": "both",
            "category": "rent_reminder",
            "subject": "Rent Payment Reminder",
            "body": "Dear {tenant_name},\n\nThis is a friendly reminder that your rent payment of {amount} is due on {due_date}.\n\nPlease ensure timely payment to avoid late fees.\n\nThank you!\nProperty Management",
            "variables": json.dumps(["tenant_name", "amount", "due_date", "unit_number"])
        },
        {
            "name": "Lease Expiry Notice (30 Days)",
            "type": "email",
            "category": "lease_expiry",
            "subject": "Lease Expiry Notice",
            "body": "Dear {tenant_name},\n\nYour lease for Unit {unit_number} expires on {due_date}.\n\nPlease contact us to discuss renewal options.\n\nBest regards,\nProperty Management",
            "variables": json.dumps(["tenant_name", "unit_number", "due_date"])
        },
        {
            "name": "Payment Received Confirmation",
            "type": "both",
            "category": "payment_confirmation",
            "subject": "Payment Received",
            "body": "Dear {tenant_name},\n\nWe confirm receipt of your payment of {amount}.\n\nThank you for your prompt payment!\n\nProperty Management",
            "variables": json.dumps(["tenant_name", "amount"])
        },
        {
            "name": "Overdue Payment Notice",
            "type": "both",
            "category": "overdue_notice",
            "subject": "Overdue Payment Notice",
            "body": "Dear {tenant_name},\n\nYour rent payment of {amount} was due on {due_date} and is now overdue.\n\nPlease make payment immediately to avoid further action.\n\nProperty Management",
            "variables": json.dumps(["tenant_name", "amount", "due_date"])
        },
        {
            "name": "Maintenance Update",
            "type": "both",
            "category": "maintenance",
            "subject": "Maintenance Update for Unit {unit_number}",
            "body": "Dear {tenant_name},\n\nYour maintenance request has been updated.\n\nWe will keep you informed of progress.\n\nThank you for your patience.\nProperty Management",
            "variables": json.dumps(["tenant_name", "unit_number"])
        }
    ]
    
    created_count = 0
    for template_data in default_templates:
        try:
            template = MessageTemplateCreate(**template_data)
            message_template_crud.create_template(db, template, current_user.id)
            created_count += 1
        except:
            continue
    
    return {
        "message": f"Created {created_count} default templates",
        "count": created_count
    }








