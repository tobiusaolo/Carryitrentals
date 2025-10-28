import requests
from typing import Optional
import urllib.parse

class AfricasTalkingService:
    def __init__(self):
        # Africa's Talking Configuration
        self.api_key = "atsk_bcdef9936a178337878f9f608f54ed5758e5bdbc2e10237f8e6db70db012cafbdae62fd7"
        self.username = "phosai"
        self.sender_id = None  # Don't use sender ID (not approved yet) - will use default
        self.base_url = "https://api.africastalking.com/version1/messaging"
    
    async def send_sms(self, to_phone: str, message: str, db = None) -> bool:
        """
        Send SMS via Africa's Talking API.
        
        Args:
            to_phone: Phone number in international format (+256...)
            message: SMS message text
            db: Database session (for getting dynamic sender ID if needed)
        
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        try:
            print(f"📱 Sending SMS via Africa's Talking...")
            print(f"   To: {to_phone}")
            print(f"   From: Africa's Talking ({self.username})")
            print(f"   Message: {message[:100]}...")
            
            # Prepare headers
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'apiKey': self.api_key
            }
            
            # Prepare data - URL encode to handle spaces and special characters
            data = {
                'username': self.username,
                'to': to_phone,
                'message': message,
            }
            
            # If we have an approved sender ID, use it
            if self.sender_id:
                data['from'] = self.sender_id
            
            # Send SMS
            response = requests.post(
                self.base_url,
                headers=headers,
                data=data  # requests will automatically URL-encode
            )
            
            print(f"   Response Status: {response.status_code}")
            
            if response.status_code == 201 or response.status_code == 200:
                result = response.json()
                recipients = result.get('SMSMessageData', {}).get('Recipients', [])
                
                if recipients:
                    recipient = recipients[0]
                    status = recipient.get('status')
                    status_code = recipient.get('statusCode')
                    message_id = recipient.get('messageId', 'N/A')
                    cost = recipient.get('cost', 'N/A')
                    
                    print(f"   ✅ SMS sent successfully!")
                    print(f"   Status: {status}")
                    print(f"   Code: {status_code}")
                    print(f"   Message ID: {message_id}")
                    print(f"   Cost: {cost}")
                    
                    # Success if status is "Success" or statusCode is 100-102
                    return status == 'Success' or status_code in [100, 101, 102]
                else:
                    print(f"   ⚠️ No recipient data in response")
                    print(f"   Response: {result}")
                    return False
            else:
                print(f"   ❌ SMS failed!")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Error sending SMS: {str(e)}")
            return False
    
    def check_balance(self) -> Optional[str]:
        """Check account balance."""
        try:
            url = "https://api.africastalking.com/version1/user"
            headers = {
                'Accept': 'application/json',
                'apiKey': self.api_key
            }
            params = {
                'username': self.username
            }
            
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('UserData', {}).get('balance', 'Unknown')
            return None
        except Exception as e:
            print(f"Error checking balance: {e}")
            return None

# Global instance
africas_talking_service = AfricasTalkingService()

