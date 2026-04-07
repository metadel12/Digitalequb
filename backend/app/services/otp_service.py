import random
import string
from app.core.config import settings

class OTPService:
    def __init__(self):
        self.length = settings.OTP_LENGTH

    def generate_otp(self) -> str:
        """Generate a random OTP of specified length"""
        characters = string.digits
        otp = ''.join(random.choice(characters) for _ in range(self.length))
        return otp

    def validate_otp_format(self, otp: str) -> bool:
        """Validate OTP format (digits only, correct length)"""
        if not otp or len(otp) != self.length:
            return False
        return otp.isdigit()