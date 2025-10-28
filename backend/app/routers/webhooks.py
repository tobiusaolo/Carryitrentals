from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
import json
import hmac
import hashlib

from ..database import get_db
from ..models.mobile_payment import MobilePayment
from ..models.payment import Payment
from ..models.tenant import Tenant
from ..models.enums import PaymentStatus
from ..crud.payment import payment_crud
from ..crud.tenant import tenant_crud
from ..services.notification import notification_service

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/mtn/callback")
async def mtn_payment_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle MTN Mobile Money payment callback"""
    try:
        # Get raw body for signature verification
        body = await request.body()
        data = json.loads(body)
        
        # Extract transaction details
        transaction_id = data.get("financialTransactionId")
        external_id = data.get("externalId")
        status_from_provider = data.get("status")  # SUCCESSFUL, FAILED, PENDING
        amount = data.get("amount")
        currency = data.get("currency")
        
        # Find the mobile payment record
        mobile_payment = db.query(MobilePayment).filter(
            MobilePayment.external_id == external_id
        ).first()
        
        if not mobile_payment:
            return {"status": "received", "message": "Payment record not found"}
        
        # Update mobile payment status
        mobile_payment.transaction_id = transaction_id
        mobile_payment.provider_status = status_from_provider
        mobile_payment.provider_response = json.dumps(data)
        mobile_payment.callback_data = json.dumps(data)
        
        if status_from_provider == "SUCCESSFUL":
            mobile_payment.status = PaymentStatus.PAID
            mobile_payment.completed_at = datetime.utcnow()
            
            # Update related payment record if exists
            if mobile_payment.qr_payment_id:
                from ..crud.qr_payment import qr_payment_crud
                qr_payment = qr_payment_crud.get_qr_payment_by_id(db, mobile_payment.qr_payment_id)
                if qr_payment:
                    qr_payment.payment_status = PaymentStatus.PAID
                    qr_payment.paid_at = datetime.utcnow()
            
            # Update tenant payment status
            if mobile_payment.tenant_id:
                tenant = tenant_crud.get_tenant_by_id(db, mobile_payment.tenant_id)
                if tenant:
                    from datetime import timedelta, date
                    from ..schemas.tenant import TenantUpdate
                    
                    # Update payment date and next due date
                    tenant_update = TenantUpdate(
                        last_payment_date=date.today(),
                        next_payment_due=date.today() + timedelta(days=30 * mobile_payment.months_advance),
                        rent_payment_status="paid"
                    )
                    tenant_crud.update_tenant(db, mobile_payment.tenant_id, tenant_update)
                    
                    # Send confirmation notification
                    try:
                        import asyncio
                        asyncio.create_task(notification_service.send_email(
                            tenant.email,
                            "Payment Confirmed",
                            f"Your rent payment of {currency} {amount} has been received. Thank you!"
                        ))
                    except:
                        pass
            
        elif status_from_provider == "FAILED":
            mobile_payment.status = PaymentStatus.FAILED
            mobile_payment.failed_at = datetime.utcnow()
            mobile_payment.failure_reason = data.get("reason", "Payment failed")
        
        db.commit()
        
        return {
            "status": "processed",
            "external_id": external_id,
            "payment_status": mobile_payment.status
        }
        
    except Exception as e:
        print(f"Error processing MTN callback: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.post("/airtel/callback")
async def airtel_payment_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Airtel Money payment callback"""
    try:
        # Get raw body
        body = await request.body()
        data = json.loads(body)
        
        # Extract transaction details
        transaction_id = data.get("transaction", {}).get("id")
        external_id = data.get("transaction", {}).get("airtel_money_id")
        status_from_provider = data.get("transaction", {}).get("status")  # SUCCESS, FAILED, PENDING
        amount = data.get("transaction", {}).get("amount")
        currency = data.get("transaction", {}).get("currency")
        
        # Find the mobile payment record
        mobile_payment = db.query(MobilePayment).filter(
            MobilePayment.external_id == external_id
        ).first()
        
        if not mobile_payment:
            # Try to find by transaction_id
            mobile_payment = db.query(MobilePayment).filter(
                MobilePayment.transaction_id == transaction_id
            ).first()
        
        if not mobile_payment:
            return {"status": "received", "message": "Payment record not found"}
        
        # Update mobile payment status
        mobile_payment.transaction_id = transaction_id
        mobile_payment.provider_status = status_from_provider
        mobile_payment.provider_response = json.dumps(data)
        mobile_payment.callback_data = json.dumps(data)
        
        if status_from_provider == "SUCCESS":
            mobile_payment.status = PaymentStatus.PAID
            mobile_payment.completed_at = datetime.utcnow()
            
            # Update related payment record
            if mobile_payment.qr_payment_id:
                from ..crud.qr_payment import qr_payment_crud
                qr_payment = qr_payment_crud.get_qr_payment_by_id(db, mobile_payment.qr_payment_id)
                if qr_payment:
                    qr_payment.payment_status = PaymentStatus.PAID
                    qr_payment.paid_at = datetime.utcnow()
            
            # Update tenant payment status
            if mobile_payment.tenant_id:
                tenant = tenant_crud.get_tenant_by_id(db, mobile_payment.tenant_id)
                if tenant:
                    from datetime import timedelta, date
                    from ..schemas.tenant import TenantUpdate
                    
                    tenant_update = TenantUpdate(
                        last_payment_date=date.today(),
                        next_payment_due=date.today() + timedelta(days=30 * mobile_payment.months_advance),
                        rent_payment_status="paid"
                    )
                    tenant_crud.update_tenant(db, mobile_payment.tenant_id, tenant_update)
                    
                    # Send confirmation
                    try:
                        import asyncio
                        asyncio.create_task(notification_service.send_email(
                            tenant.email,
                            "Payment Confirmed",
                            f"Your rent payment of {currency} {amount} has been received. Thank you!"
                        ))
                    except:
                        pass
            
        elif status_from_provider == "FAILED":
            mobile_payment.status = PaymentStatus.FAILED
            mobile_payment.failed_at = datetime.utcnow()
            mobile_payment.failure_reason = data.get("message", "Payment failed")
        
        db.commit()
        
        return {
            "status": "processed",
            "transaction_id": transaction_id,
            "payment_status": mobile_payment.status
        }
        
    except Exception as e:
        print(f"Error processing Airtel callback: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.get("/payment-status/{external_id}")
async def check_payment_status(
    external_id: str,
    db: Session = Depends(get_db)
):
    """Check payment status by external ID (for polling)"""
    try:
        mobile_payment = db.query(MobilePayment).filter(
            MobilePayment.external_id == external_id
        ).first()
        
        if not mobile_payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        return {
            "external_id": external_id,
            "status": mobile_payment.status,
            "provider_status": mobile_payment.provider_status,
            "amount": float(mobile_payment.amount),
            "currency": mobile_payment.currency,
            "initiated_at": mobile_payment.initiated_at.isoformat(),
            "completed_at": mobile_payment.completed_at.isoformat() if mobile_payment.completed_at else None,
            "failed_at": mobile_payment.failed_at.isoformat() if mobile_payment.failed_at else None,
            "failure_reason": mobile_payment.failure_reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking payment status: {str(e)}"
        )

@router.post("/inspection-payment/callback")
async def inspection_payment_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle inspection payment callback"""
    try:
        body = await request.body()
        data = json.loads(body)
        
        external_id = data.get("externalId") or data.get("transaction", {}).get("id")
        status_from_provider = data.get("status") or data.get("transaction", {}).get("status")
        
        # Find inspection payment
        from ..models.inspection_payment import InspectionPayment
        from ..models.inspection_booking import InspectionBooking
        from ..models.enums import InspectionStatus
        
        inspection_payment = db.query(InspectionPayment).filter(
            InspectionPayment.transaction_id == external_id
        ).first()
        
        if not inspection_payment:
            return {"status": "received", "message": "Payment record not found"}
        
        # Update payment status
        if status_from_provider in ["SUCCESSFUL", "SUCCESS"]:
            inspection_payment.status = PaymentStatus.PAID
            inspection_payment.paid_at = datetime.utcnow()
            
            # Auto-approve inspection if 60% paid
            inspection = db.query(InspectionBooking).filter(
                InspectionBooking.id == inspection_payment.inspection_booking_id
            ).first()
            
            if inspection:
                inspection.status = InspectionStatus.APPROVED
                inspection.updated_at = datetime.utcnow()
                
                # Send approval notification
                try:
                    tenant = db.query(User).filter(User.id == inspection.tenant_id).first()
                    if tenant:
                        import asyncio
                        asyncio.create_task(notification_service.send_email(
                            tenant.email,
                            "Inspection Approved",
                            f"Your inspection booking has been approved. An agent will contact you shortly."
                        ))
                except:
                    pass
        
        elif status_from_provider == "FAILED":
            inspection_payment.status = PaymentStatus.FAILED
        
        db.commit()
        
        return {"status": "processed", "payment_status": inspection_payment.status}
        
    except Exception as e:
        print(f"Error processing inspection payment callback: {str(e)}")
        return {"status": "error", "message": str(e)}








