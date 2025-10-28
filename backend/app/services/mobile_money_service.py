import requests
import json
from typing import Optional, Dict
from sqlalchemy.orm import Session
from ..crud import settings as settings_crud
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class MobileMoneyService:
    """Service for handling mobile money payments (MTN and Airtel)."""
    
    def __init__(self):
        self.mtn_api_url = "https://api.mtn.com/mobile-money"  # Example URL
        self.airtel_api_url = "https://api.airtel.com/money"  # Example URL
    
    def get_payment_number(self, db: Session, provider: str) -> Optional[str]:
        """Get the configured payment number for a provider from settings."""
        if provider.lower() in ['mtn', 'mtn_mobile_money']:
            setting = settings_crud.get_setting(db, 'mtn_mobile_money_number')
            return setting.setting_value if setting else None
        elif provider.lower() in ['airtel', 'airtel_money']:
            setting = settings_crud.get_setting(db, 'airtel_money_number')
            return setting.setting_value if setting else None
        return None
    
    def get_merchant_name(self, db: Session) -> str:
        """Get the merchant name from settings."""
        setting = settings_crud.get_setting(db, 'payment_merchant_name')
        return setting.setting_value if setting else "CarryIT Property Manager"
    
    async def initiate_payment(
        self,
        db: Session,
        amount: float,
        customer_phone: str,
        payment_method: str,
        reference: str,
        description: str = None
    ) -> Dict:
        """
        Initiate a mobile money payment.
        
        Args:
            db: Database session
            amount: Amount to charge
            customer_phone: Customer's phone number
            payment_method: 'mtn_mobile_money' or 'airtel_money'
            reference: Payment reference/transaction ID
            description: Payment description
        
        Returns:
            Dict with payment status and details
        """
        try:
            # Get merchant/recipient number from settings
            merchant_number = self.get_payment_number(db, payment_method)
            if not merchant_number:
                return {
                    "success": False,
                    "error": f"Payment number not configured for {payment_method}",
                    "message": "Please configure payment numbers in admin settings"
                }
            
            merchant_name = self.get_merchant_name(db)
            
            # Format phone numbers (remove spaces, ensure proper format)
            customer_phone = customer_phone.replace(" ", "").strip()
            merchant_number = merchant_number.replace(" ", "").strip()
            
            # Simulate payment initiation (In production, call actual API)
            payment_data = {
                "amount": amount,
                "currency": "UGX",
                "customer_phone": customer_phone,
                "merchant_phone": merchant_number,
                "merchant_name": merchant_name,
                "reference": reference,
                "description": description or f"Payment for booking {reference}",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Log payment initiation
            logger.info(f"Initiating {payment_method} payment: {payment_data}")
            
            # In a real implementation, you would call the actual payment API here
            # For MTN Mobile Money
            if payment_method.lower() in ['mtn', 'mtn_mobile_money']:
                result = await self._process_mtn_payment(payment_data)
            # For Airtel Money
            elif payment_method.lower() in ['airtel', 'airtel_money']:
                result = await self._process_airtel_payment(payment_data)
            else:
                return {
                    "success": False,
                    "error": "Invalid payment method",
                    "message": f"Payment method '{payment_method}' is not supported"
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error initiating mobile money payment: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to initiate payment"
            }
    
    async def _process_mtn_payment(self, payment_data: Dict) -> Dict:
        """
        Process MTN Mobile Money payment.
        
        In production, this would call the actual MTN Mobile Money API.
        For now, it simulates the payment process.
        """
        try:
            # SIMULATION MODE (Remove in production)
            # In production, you would make an actual API call to MTN
            """
            response = requests.post(
                f"{self.mtn_api_url}/v1/requesttopay",
                headers={
                    "Authorization": f"Bearer {mtn_api_key}",
                    "X-Target-Environment": "live",
                    "Content-Type": "application/json"
                },
                json={
                    "amount": payment_data["amount"],
                    "currency": payment_data["currency"],
                    "externalId": payment_data["reference"],
                    "payer": {
                        "partyIdType": "MSISDN",
                        "partyId": payment_data["customer_phone"]
                    },
                    "payerMessage": payment_data["description"],
                    "payeeNote": payment_data["description"]
                }
            )
            
            if response.status_code == 202:
                return {
                    "success": True,
                    "transaction_id": response.headers.get("X-Reference-Id"),
                    "status": "PENDING",
                    "message": "Payment request sent to customer",
                    "provider": "MTN Mobile Money"
                }
            """
            
            # SIMULATION RESPONSE
            return {
                "success": True,
                "transaction_id": f"MTN-{payment_data['reference']}",
                "status": "PENDING",
                "message": f"Payment request of UGX {payment_data['amount']:,.0f} sent to {payment_data['customer_phone']}. Customer will approve on their phone.",
                "provider": "MTN Mobile Money",
                "merchant_number": payment_data['merchant_phone'],
                "simulation": True  # Remove in production
            }
            
        except Exception as e:
            logger.error(f"MTN payment error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "MTN Mobile Money payment failed"
            }
    
    async def _process_airtel_payment(self, payment_data: Dict) -> Dict:
        """
        Process Airtel Money payment.
        
        In production, this would call the actual Airtel Money API.
        For now, it simulates the payment process.
        """
        try:
            # SIMULATION MODE (Remove in production)
            # In production, you would make an actual API call to Airtel
            """
            response = requests.post(
                f"{self.airtel_api_url}/v1/payments",
                headers={
                    "Authorization": f"Bearer {airtel_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "amount": payment_data["amount"],
                    "currency": payment_data["currency"],
                    "reference": payment_data["reference"],
                    "subscriber": {
                        "msisdn": payment_data["customer_phone"]
                    },
                    "transaction": {
                        "type": "B2C",
                        "description": payment_data["description"]
                    }
                }
            )
            """
            
            # SIMULATION RESPONSE
            return {
                "success": True,
                "transaction_id": f"AIRTEL-{payment_data['reference']}",
                "status": "PENDING",
                "message": f"Payment request of UGX {payment_data['amount']:,.0f} sent to {payment_data['customer_phone']}. Customer will approve on their phone.",
                "provider": "Airtel Money",
                "merchant_number": payment_data['merchant_phone'],
                "simulation": True  # Remove in production
            }
            
        except Exception as e:
            logger.error(f"Airtel payment error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Airtel Money payment failed"
            }
    
    async def check_payment_status(
        self,
        transaction_id: str,
        provider: str
    ) -> Dict:
        """Check the status of a mobile money payment."""
        try:
            # In production, query the payment provider's API
            # For now, return a simulated response
            return {
                "transaction_id": transaction_id,
                "status": "COMPLETED",  # or PENDING, FAILED
                "provider": provider,
                "message": "Payment completed successfully"
            }
        except Exception as e:
            return {
                "error": str(e),
                "message": "Failed to check payment status"
            }


# Global instance
mobile_money_service = MobileMoneyService()
