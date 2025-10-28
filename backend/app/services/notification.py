import os
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import redis
from dotenv import load_dotenv
from .africas_talking import africas_talking_service

load_dotenv()

# Configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@yourdomain.com")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class NotificationService:
    def __init__(self):
        self.sendgrid_client = SendGridAPIClient(api_key=SENDGRID_API_KEY) if SENDGRID_API_KEY else None
        self.redis_client = redis.from_url(REDIS_URL) if REDIS_URL else None
        # Use Africa's Talking for SMS
        self.sms_service = africas_talking_service
    
    async def send_email(self, to_email: str, subject: str, content: str, html_content: str = None) -> bool:
        """Send email notification."""
        if not self.sendgrid_client:
            print("SendGrid not configured, skipping email")
            return False
        
        try:
            message = Mail(
                from_email=FROM_EMAIL,
                to_emails=to_email,
                subject=subject,
                plain_text_content=content,
                html_content=html_content
            )
            response = self.sendgrid_client.send(message)
            return response.status_code == 202
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    async def send_sms(self, to_phone: str, message: str, db: Session = None) -> bool:
        """Send SMS notification via Africa's Talking."""
        # Use Africa's Talking service for all SMS
        return await self.sms_service.send_sms(to_phone, message, db)
    
    async def create_notification(self, db: Session, user_id: int, title: str, message: str, notification_type: str) -> bool:
        """Create in-app notification."""
        try:
            from ..models.notification import Notification
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type
            )
            db.add(notification)
            db.commit()
            return True
        except Exception as e:
            print(f"Error creating notification: {e}")
            return False
    
    async def send_payment_reminder(self, db: Session, tenant_id: int, payment_amount: float, due_date: str, tenant_email: str, tenant_phone: str = None) -> bool:
        """Send payment reminder to tenant."""
        subject = "Rent Payment Reminder"
        content = f"""
        Dear Tenant,
        
        This is a reminder that your rent payment of ${payment_amount} is due on {due_date}.
        
        Please ensure payment is made on time to avoid any late fees.
        
        Thank you for your attention to this matter.
        
        Best regards,
        Property Management Team
        """
        
        html_content = f"""
        <html>
        <body>
            <h2>Rent Payment Reminder</h2>
            <p>Dear Tenant,</p>
            <p>This is a reminder that your rent payment of <strong>${payment_amount}</strong> is due on <strong>{due_date}</strong>.</p>
            <p>Please ensure payment is made on time to avoid any late fees.</p>
            <p>Thank you for your attention to this matter.</p>
            <p>Best regards,<br>Property Management Team</p>
        </body>
        </html>
        """
        
        # Send email
        email_sent = await self.send_email(tenant_email, subject, content, html_content)
        
        # Send SMS if phone number provided
        sms_sent = False
        if tenant_phone:
            sms_message = f"Rent reminder: ${payment_amount} due on {due_date}. Please pay on time to avoid late fees."
            sms_sent = await self.send_sms(tenant_phone, sms_message)
        
        # Create in-app notification
        notification_created = await self.create_notification(
            db, tenant_id, "Payment Reminder", 
            f"Rent payment of ${payment_amount} is due on {due_date}", 
            "payment_due"
        )
        
        return email_sent or sms_sent or notification_created
    
    async def send_lease_expiry_reminder(self, db: Session, tenant_id: int, lease_end_date: str, tenant_email: str, tenant_phone: str = None) -> bool:
        """Send lease expiry reminder."""
        subject = "Lease Expiry Reminder"
        content = f"""
        Dear Tenant,
        
        Your lease is set to expire on {lease_end_date}.
        
        Please contact us to discuss renewal options or make arrangements for move-out.
        
        Thank you for your tenancy.
        
        Best regards,
        Property Management Team
        """
        
        html_content = f"""
        <html>
        <body>
            <h2>Lease Expiry Reminder</h2>
            <p>Dear Tenant,</p>
            <p>Your lease is set to expire on <strong>{lease_end_date}</strong>.</p>
            <p>Please contact us to discuss renewal options or make arrangements for move-out.</p>
            <p>Thank you for your tenancy.</p>
            <p>Best regards,<br>Property Management Team</p>
        </body>
        </html>
        """
        
        # Send email
        email_sent = await self.send_email(tenant_email, subject, content, html_content)
        
        # Send SMS if phone number provided
        sms_sent = False
        if tenant_phone:
            sms_message = f"Lease expires on {lease_end_date}. Please contact us about renewal or move-out."
            sms_sent = await self.send_sms(tenant_phone, sms_message)
        
        # Create in-app notification
        notification_created = await self.create_notification(
            db, tenant_id, "Lease Expiry Reminder", 
            f"Your lease expires on {lease_end_date}", 
            "lease_expiry"
        )
        
        return email_sent or sms_sent or notification_created
    
    async def send_maintenance_update(self, db: Session, tenant_id: int, maintenance_title: str, status: str, tenant_email: str, tenant_phone: str = None) -> bool:
        """Send maintenance request update."""
        subject = f"Maintenance Update: {maintenance_title}"
        content = f"""
        Dear Tenant,
        
        Your maintenance request "{maintenance_title}" has been updated.
        
        Status: {status}
        
        We will keep you informed of any further updates.
        
        Thank you for your patience.
        
        Best regards,
        Property Management Team
        """
        
        html_content = f"""
        <html>
        <body>
            <h2>Maintenance Update</h2>
            <p>Dear Tenant,</p>
            <p>Your maintenance request "<strong>{maintenance_title}</strong>" has been updated.</p>
            <p><strong>Status:</strong> {status}</p>
            <p>We will keep you informed of any further updates.</p>
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>Property Management Team</p>
        </body>
        </html>
        """
        
        # Send email
        email_sent = await self.send_email(tenant_email, subject, content, html_content)
        
        # Send SMS if phone number provided
        sms_sent = False
        if tenant_phone:
            sms_message = f"Maintenance update: {maintenance_title} - Status: {status}"
            sms_sent = await self.send_sms(tenant_phone, sms_message)
        
        # Create in-app notification
        notification_created = await self.create_notification(
            db, tenant_id, "Maintenance Update", 
            f"Maintenance request '{maintenance_title}' status: {status}", 
            "maintenance_update"
        )
        
        return email_sent or sms_sent or notification_created
    
    async def send_bulk_notifications(self, db: Session, property_id: int, title: str, message: str, notification_type: str) -> int:
        """Send bulk notifications to all tenants in a property."""
        try:
            from ..crud.lease import lease_crud
            from ..crud.user import user_crud
            
            # Get all active leases for the property
            active_leases = lease_crud.get_active_leases(db)
            property_leases = [lease for lease in active_leases if lease.unit.property_id == property_id]
            
            sent_count = 0
            for lease in property_leases:
                tenant = user_crud.get_user_by_id(db, lease.tenant_id)
                if tenant and tenant.is_active:
                    # Send email
                    await self.send_email(tenant.email, title, message)
                    
                    # Send SMS if phone available
                    if tenant.phone:
                        await self.send_sms(tenant.phone, message)
                    
                    # Create in-app notification
                    await self.create_notification(db, tenant.id, title, message, notification_type)
                    
                    sent_count += 1
            
            return sent_count
        except Exception as e:
            print(f"Error sending bulk notifications: {e}")
            return 0

notification_service = NotificationService()

