import qrcode
import io
import base64
import os
from typing import Dict, Any
from datetime import datetime
from ..models.enums import PaymentMethod

class QRCodeService:
    def __init__(self):
        self.qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )

    def generate_qr_code_data(self, payment_data: Dict[str, Any]) -> str:
        """Generate QR code data string for mobile money payment."""
        # Generate a web URL that opens the mobile payment form
        # Use BACKEND_URL for API endpoints, FRONTEND_URL for frontend pages
        backend_url = "https://carryit-backend.onrender.com"
        qr_payment_id = payment_data.get("qr_payment_id")
        
        if qr_payment_id:
            # URL to the mobile payment form
            qr_string = f"{backend_url}/api/v1/mobile-payment/form/{qr_payment_id}"
        else:
            # Fallback to old format if no QR payment ID
            qr_data = {
                "type": "mobile_money_payment",
                "account_number": payment_data["account_number"],
                "amount": str(payment_data["amount"]),
                "currency": "UGX",  # Uganda Shillings
                "provider": payment_data["mobile_money_provider"],
                "unit_id": payment_data["unit_id"],
                "tenant_id": payment_data.get("tenant_id"),
                "payer_id": payment_data["payer_id"],
                "timestamp": datetime.utcnow().isoformat(),
                "description": f"Rent payment for Unit {payment_data.get('unit_number', 'N/A')}"
            }
            
            # Convert to string format suitable for QR code
            qr_string = f"mobile_money_payment://{payment_data['account_number']}?amount={payment_data['amount']}&currency=UGX&provider={payment_data['mobile_money_provider']}&unit_id={payment_data['unit_id']}&tenant_id={payment_data.get('tenant_id', '')}&payer_id={payment_data['payer_id']}&timestamp={qr_data['timestamp']}&description={qr_data['description']}"
        
        return qr_string

    def generate_qr_code_image(self, qr_data: str) -> str:
        """Generate QR code image and return as base64 string."""
        self.qr.clear()
        self.qr.add_data(qr_data)
        self.qr.make(fit=True)
        
        # Create QR code image
        img = self.qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return img_str

    def generate_mobile_money_payment_qr(self, payment_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate complete QR code for mobile money payment."""
        qr_data = self.generate_qr_code_data(payment_data)
        qr_image = self.generate_qr_code_image(qr_data)
        
        return {
            "qr_data": qr_data,
            "qr_image": qr_image,
            "payment_info": {
                "account_number": payment_data["account_number"],
                "amount": payment_data["amount"],
                "currency": "UGX",
                "provider": payment_data["mobile_money_provider"],
                "description": f"Rent payment for Unit {payment_data.get('unit_number', 'N/A')}"
            }
        }

    def parse_qr_code_data(self, qr_data: str) -> Dict[str, Any]:
        """Parse QR code data to extract payment information."""
        try:
            if qr_data.startswith("mobile_money_payment://"):
                # Parse the mobile money payment URL
                parts = qr_data.split("://")[1].split("?")
                account_number = parts[0]
                params = {}
                
                for param in parts[1].split("&"):
                    if "=" in param:
                        key, value = param.split("=", 1)
                        params[key] = value
                
                return {
                    "type": "mobile_money_payment",
                    "account_number": account_number,
                    "amount": params.get("amount"),
                    "currency": params.get("currency"),
                    "provider": params.get("provider"),
                    "unit_id": params.get("unit_id"),
                    "tenant_id": params.get("tenant_id"),
                    "payer_id": params.get("payer_id"),
                    "timestamp": params.get("timestamp"),
                    "description": params.get("description")
                }
        except Exception as e:
            raise ValueError(f"Invalid QR code data: {str(e)}")

qr_code_service = QRCodeService()
