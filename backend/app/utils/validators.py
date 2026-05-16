import re
from typing import Optional

GMAIL_DOMAINS = {"gmail.com", "googlemail.com"}
GMAIL_PATTERN = re.compile(r"^[a-z0-9.]+@(gmail\.com|googlemail\.com)$", re.IGNORECASE)

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_registration_email(email: str) -> tuple[bool, Optional[str]]:
    """Validate public registration emails before sending verification mail."""
    normalized = (email or "").strip().lower()
    if not normalized:
        return False, "Email address is required"
    if not validate_email(normalized):
        return False, "Please enter a valid email address"

    parts = normalized.split("@", 1)
    if len(parts) != 2 or parts[1] not in GMAIL_DOMAINS:
        return False, "Registration currently requires a Gmail address"
    local_part = parts[0]
    if (
        len(local_part) < 6
        or len(local_part) > 30
        or local_part.startswith(".")
        or local_part.endswith(".")
        or ".." in local_part
        or not GMAIL_PATTERN.match(normalized)
    ):
        return False, "Please enter a real Gmail address you can receive mail at"

    return True, None

def validate_phone(phone: str) -> bool:
    """Validate phone number (basic)"""
    pattern = r'^\+?[\d\s\-\(\)]{10,}$'
    return re.match(pattern, phone) is not None

def validate_password(password: str) -> tuple[bool, Optional[str]]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, None
