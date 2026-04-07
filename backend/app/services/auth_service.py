from __future__ import annotations

from datetime import timedelta
from typing import Any, Dict, Optional

import pyotp
from pymongo.database import Database

from ..core.mongo_utils import new_id, utcnow, user_doc_to_response
from ..core.security import get_password_hash, verify_password
from ..models.user import KYCStatus, UserRole, UserStatus
from ..schemas.user import UserCreate

SYSTEM_ADMIN_EMAIL = "metizomawa@gmail.com"
SYSTEM_ADMIN_NAME = "Bekel Melese"
SYSTEM_ADMIN_PHONE = "+251911111111"
SYSTEM_ADMIN_ACCOUNT = "1000529496331"
SYSTEM_ADMIN_PASSWORD = "Admin@123456"


class AuthService:
    def __init__(self, db: Database):
        self.db = db
        self.otp_store: Dict[str, Dict[str, Any]] = {}

    def create_user(self, user_data: UserCreate) -> Dict[str, Any]:
        now = utcnow()
        user_id = new_id()
        user = {
            "_id": user_id,
            "email": user_data.email.strip().lower(),
            "phone_number": user_data.phone_number.strip(),
            "full_name": user_data.full_name.strip(),
            "hashed_password": get_password_hash(user_data.password),
            "role": UserRole.USER.value,
            "is_admin": False,
            "is_participant": True,
            "status": UserStatus.ACTIVE.value,
            "kyc_status": KYCStatus.NOT_SUBMITTED.value,
            "credit_score": 600,
            "total_savings": 0.0,
            "total_borrowed": 0.0,
            "total_repaid": 0.0,
            "default_count": 0,
            "wallet_address": None,
            "private_key_encrypted": None,
            "is_2fa_enabled": False,
            "totp_secret": None,
            "profile_picture": None,
            "date_of_birth": None,
            "address": {},
            "saved_beneficiaries": {"bank_accounts": [], "mobile_accounts": [], "crypto_wallets": []},
            "withdrawal_settings": {
                "daily_limit": 50000,
                "weekly_limit": 200000,
                "monthly_limit": 500000,
                "auto_approve_limit": 1000,
                "require_2fa": True,
            },
            "notification_preferences": {"email": True, "sms": True, "push": True},
            "profile_metadata": {},
            "app_settings": {},
            "privacy_settings": {},
            "security_settings": {},
            "active_sessions": [],
            "login_history": [],
            "last_login": None,
            "login_attempts": 0,
            "locked_until": None,
            "created_at": now,
            "updated_at": now,
        }
        if getattr(user_data, 'username', None):
            user["username"] = user_data.username.strip()
        if getattr(user_data, 'bank_account', None):
            bank_account = user_data.bank_account
            user["bank_account"] = {
                "bank_name": bank_account.bank_name or "Commercial Bank of Ethiopia",
                "account_number": bank_account.account_number.strip(),
                "account_name": bank_account.account_name.strip(),
                "bank_code": "CBE",
                "verified": True,
                "verified_at": utcnow(),
                "verified_by_bank": True,
            }
        self.db["users"].insert_one(user)
        return user

    def register_user(self, user_data: UserCreate) -> Dict[str, Any]:
        return self.create_user(user_data)

    def ensure_demo_user(self) -> Dict[str, Any]:
        existing = self.get_user_by_email("demo@digiequb.com")
        if existing:
            return existing
        demo = UserCreate(
            email="demo@digiequb.com",
            phone_number="+15550000001",
            full_name="Demo User",
            password="Demo123!",
            confirm_password="Demo123!",
        )
        return self.create_user(demo)

    def ensure_system_admin(self) -> Dict[str, Any]:
        existing_admin = self.get_user_by_email(SYSTEM_ADMIN_EMAIL)
        now = utcnow()
        admin_doc = {
            "_id": existing_admin["_id"] if existing_admin else new_id(),
            "email": SYSTEM_ADMIN_EMAIL,
            "phone_number": SYSTEM_ADMIN_PHONE,
            "full_name": SYSTEM_ADMIN_NAME,
            "hashed_password": (
                existing_admin.get("hashed_password")
                if existing_admin and verify_password(SYSTEM_ADMIN_PASSWORD, existing_admin.get("hashed_password", ""))
                else get_password_hash(SYSTEM_ADMIN_PASSWORD)
            ),
            "role": UserRole.SUPER_ADMIN.value,
            "is_admin": True,
            "is_participant": False,
            "status": UserStatus.ACTIVE.value,
            "kyc_status": KYCStatus.VERIFIED.value,
            "credit_score": int((existing_admin or {}).get("credit_score", 850)),
            "total_savings": float((existing_admin or {}).get("total_savings", 0.0)),
            "total_borrowed": float((existing_admin or {}).get("total_borrowed", 0.0)),
            "total_repaid": float((existing_admin or {}).get("total_repaid", 0.0)),
            "default_count": int((existing_admin or {}).get("default_count", 0)),
            "wallet_address": (existing_admin or {}).get("wallet_address"),
            "private_key_encrypted": (existing_admin or {}).get("private_key_encrypted"),
            "is_2fa_enabled": bool((existing_admin or {}).get("is_2fa_enabled", False)),
            "totp_secret": (existing_admin or {}).get("totp_secret"),
            "profile_picture": (existing_admin or {}).get("profile_picture"),
            "date_of_birth": (existing_admin or {}).get("date_of_birth"),
            "address": (existing_admin or {}).get("address", {}),
            "saved_beneficiaries": (existing_admin or {}).get("saved_beneficiaries", {"bank_accounts": [], "mobile_accounts": [], "crypto_wallets": []}),
            "withdrawal_settings": (existing_admin or {}).get("withdrawal_settings", {
                "daily_limit": 50000,
                "weekly_limit": 200000,
                "monthly_limit": 500000,
                "auto_approve_limit": 1000,
                "require_2fa": True,
            }),
            "notification_preferences": (existing_admin or {}).get("notification_preferences", {"email": True, "sms": True, "push": True}),
            "profile_metadata": (existing_admin or {}).get("profile_metadata", {}),
            "app_settings": (existing_admin or {}).get("app_settings", {}),
            "privacy_settings": (existing_admin or {}).get("privacy_settings", {}),
            "security_settings": (existing_admin or {}).get("security_settings", {}),
            "active_sessions": (existing_admin or {}).get("active_sessions", []),
            "login_history": (existing_admin or {}).get("login_history", []),
            "last_login": (existing_admin or {}).get("last_login"),
            "login_attempts": int((existing_admin or {}).get("login_attempts", 0)),
            "locked_until": (existing_admin or {}).get("locked_until"),
            "bank_account": {
                "bank_name": "Commercial Bank of Ethiopia",
                "bank_code": "CBE",
                "account_number": SYSTEM_ADMIN_ACCOUNT,
                "account_name": SYSTEM_ADMIN_NAME.upper(),
                "verified": True,
                "verified_at": now,
                "verified_by_bank": True,
            },
            "created_at": (existing_admin or {}).get("created_at", now),
            "updated_at": now,
        }
        self.db["users"].replace_one({"email": SYSTEM_ADMIN_EMAIL}, admin_doc, upsert=True)
        self.db["users"].update_many(
            {
                "email": {"$ne": SYSTEM_ADMIN_EMAIL},
                "$or": [
                    {"role": UserRole.SUPER_ADMIN.value},
                    {"role": UserRole.ADMIN.value},
                    {"is_admin": True},
                ],
            },
            {
                "$set": {
                    "role": UserRole.USER.value,
                    "is_admin": False,
                    "is_participant": True,
                    "updated_at": now,
                }
            },
        )
        return self.get_user_by_email(SYSTEM_ADMIN_EMAIL)

    def authenticate_user(self, identifier: str, password: str) -> Optional[Dict[str, Any]]:
        user = self.get_user_by_email(identifier) or self.get_user_by_phone(identifier)
        if not user:
            return None
        if not verify_password(password, user.get("hashed_password", "")):
            self.db["users"].update_one(
                {"_id": user["_id"]},
                {"$set": {"login_attempts": int(user.get("login_attempts", 0)) + 1, "updated_at": utcnow()}},
            )
            return None
        self.db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"login_attempts": 0, "locked_until": None, "updated_at": utcnow()}},
        )
        return self.get_user_by_id(user["_id"])

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return self.db["users"].find_one({"email": email.strip().lower()})

    def get_user_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        return self.db["users"].find_one({"phone_number": phone.strip()})

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.db["users"].find_one({"_id": str(user_id)})

    def update_last_login(self, user_id: str) -> None:
        now = utcnow()
        self.db["users"].update_one(
            {"_id": str(user_id)},
            {"$set": {"last_login": now, "updated_at": now}},
        )

    def generate_otp(self, user_id: str) -> str:
        otp = pyotp.random_base32()[:6]
        self.otp_store[str(user_id)] = {"otp": otp, "expires_at": utcnow() + timedelta(minutes=5)}
        return otp

    def verify_otp(self, user_id: str, otp: str) -> Optional[Dict[str, Any]]:
        data = self.otp_store.get(str(user_id))
        if not data or data["expires_at"] < utcnow() or data["otp"] != otp:
            return None
        del self.otp_store[str(user_id)]
        return self.get_user_by_id(user_id)

    async def blacklist_token(self, token: str) -> None:
        self.db["blacklisted_tokens"].insert_one({"_id": token, "created_at": utcnow()})

    def verify_email_token(self, token: str) -> Optional[Dict[str, Any]]:
        return None

    def generate_password_reset_token(self, user_id: str) -> str:
        return new_id()

    def reset_password(self, token: str, new_password: str) -> Optional[Dict[str, Any]]:
        return None

    def setup_2fa(self, user_id: str) -> str:
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        totp_secret = pyotp.random_base32()
        self.db["users"].update_one(
            {"_id": str(user_id)},
            {"$set": {"totp_secret": totp_secret, "is_2fa_enabled": True, "updated_at": utcnow()}},
        )
        return pyotp.TOTP(totp_secret).provisioning_uri(user["email"], issuer_name="DigiEqub")

    def verify_2fa_code(self, user_id: str, code: str) -> bool:
        user = self.get_user_by_id(user_id)
        if not user or not user.get("totp_secret"):
            return False
        return pyotp.TOTP(user["totp_secret"]).verify(code)


def user_to_response(user: Dict[str, Any]) -> Dict[str, Any]:
    return user_doc_to_response(user)
