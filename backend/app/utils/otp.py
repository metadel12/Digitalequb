import random
import string
from app.core.config import settings

def generate_otp() -> str:
    """Generate a random OTP of specified length"""
    characters = string.digits
    otp = ''.join(random.choice(characters) for _ in range(settings.OTP_LENGTH))
    return otp

def validate_otp_format(otp: str) -> bool:
    """Validate OTP format (digits only, correct length)"""
    if not otp or len(otp) != settings.OTP_LENGTH:
        return False
    return otp.isdigit()