import httpx
import hashlib
import hmac
import base64
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class TeleBirrService:
    """TeleBirr Payment Integration Service"""

    def __init__(self):
        self.api_url = "https://api.telebirr.et/v1"
        self.app_id = "YOUR_APP_ID"
        self.app_key = "YOUR_APP_KEY"
        self.short_code = "YOUR_SHORT_CODE"

    async def initiate_payment(self, phone_number: str, amount: float, reference: str):
        """Initiate TeleBirr payment"""
        try:
            # Generate signature
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            nonce = self.generate_nonce()

            signature_data = f"{self.app_id}{reference}{amount}{phone_number}{timestamp}{nonce}"
            signature = self.generate_signature(signature_data)

            # Prepare request payload
            payload = {
                "appId": self.app_id,
                "appKey": self.app_key,
                "shortCode": self.short_code,
                "reference": reference,
                "amount": amount,
                "phoneNumber": phone_number,
                "timestamp": timestamp,
                "nonce": nonce,
                "signature": signature,
                "notifyUrl": "https://api.digiequb.com/api/v1/payments/telebirr/callback"
            }

            # Call TeleBirr API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/payment/initiate",
                    json=payload,
                    timeout=30.0
                )

                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"TeleBirr API error: {response.text}")
                    return {"success": False, "error": "Payment initiation failed"}

        except Exception as e:
            logger.error(f"TeleBirr service error: {str(e)}")
            return {"success": False, "error": str(e)}

    async def check_payment_status(self, reference: str):
        """Check TeleBirr payment status"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/payment/status/{reference}",
                    timeout=30.0
                )

                if response.status_code == 200:
                    return response.json()
                else:
                    return {"success": False, "error": "Status check failed"}

        except Exception as e:
            logger.error(f"Status check error: {str(e)}")
            return {"success": False, "error": str(e)}

    def generate_nonce(self):
        """Generate random nonce"""
        import random
        import string
        return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

    def generate_signature(self, data: str):
        """Generate HMAC-SHA256 signature"""
        signature = hmac.new(
            self.app_key.encode('utf-8'),
            data.encode('utf-8'),
            hashlib.sha256
        ).digest()
        return base64.b64encode(signature).decode('utf-8')