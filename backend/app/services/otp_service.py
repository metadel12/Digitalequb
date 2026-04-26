from __future__ import annotations

import logging
import secrets
import smtplib
import string
from datetime import timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Optional

import httpx
from pymongo.database import Database

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
except ImportError:
    SendGridAPIClient = None
    Mail = None

try:
    from twilio.rest import Client as TwilioClient
except ImportError:
    TwilioClient = None

from app.core.config import settings
from app.core.mongo_utils import ensure_utc_datetime, utcnow

logger = logging.getLogger(__name__)


class OTPService:
    def __init__(self, db: Optional[Database] = None):
        self.db = db
        self.length = getattr(settings, "OTP_LENGTH", 6)

    def generate_otp(self) -> str:
        return "".join(secrets.choice(string.digits) for _ in range(self.length))

    @staticmethod
    def _has_real_value(value: Optional[str]) -> bool:
        if not value:
            return False
        v = str(value).strip().lower()
        return bool(v) and "your_" not in v and "your-" not in v and v not in {
            "your-sendgrid-api-key", "your_16_char_app_password_here",
            "your-app-password", "your-africastalking-api-key",
            "your_africastalking_api_key", "your_api_key",
        }

    @staticmethod
    def _normalize_phone(phone: str) -> str:
        p = (phone or "").replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        if p and not p.startswith("+"):
            p = f"+{p}"
        return p

    def _email_configured(self) -> bool:
        return bool(
            self._has_real_value(settings.SENDGRID_API_KEY)
            or (settings.SMTP_HOST and self._has_real_value(settings.SMTP_USER) and self._has_real_value(settings.SMTP_PASSWORD))
        )

    def _sms_configured(self) -> bool:
        return bool(
            self._has_real_value(settings.AFRICASTALKING_API_KEY)
            or (self._has_real_value(settings.TWILIO_ACCOUNT_SID) and self._has_real_value(settings.TWILIO_AUTH_TOKEN) and self._has_real_value(settings.TWILIO_PHONE_NUMBER))
        )

    # ── email delivery ────────────────────────────────────────────────────────

    async def _send_via_sendgrid(self, to: str, subject: str, body: str) -> bool:
        if not self._has_real_value(settings.SENDGRID_API_KEY) or not SendGridAPIClient or not Mail:
            return False
        try:
            msg = Mail(from_email=settings.FROM_EMAIL, to_emails=to, subject=subject, html_content=body)
            r = SendGridAPIClient(settings.SENDGRID_API_KEY).send(msg)
            return 200 <= r.status_code < 300
        except Exception:
            logger.exception("SendGrid failed for %s", to)
            return False

    async def _send_via_smtp(self, to: str, subject: str, body: str) -> bool:
        if not settings.SMTP_HOST or not self._has_real_value(settings.SMTP_USER) or not self._has_real_value(settings.SMTP_PASSWORD):
            return False
        try:
            msg = MIMEMultipart()
            msg["From"] = settings.FROM_EMAIL
            msg["To"] = to
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "html"))
            srv = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            srv.starttls()
            srv.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            srv.send_message(msg)
            srv.quit()
            logger.info("Email sent to %s via SMTP", to)
            return True
        except Exception:
            logger.exception("SMTP failed for %s", to)
            return False

    async def send_email_otp(self, email: str, otp: str, purpose: str = "verification") -> bool:
        subject = f"DigiEqub - Your {purpose.replace('_', ' ')} code"
        body = f"""
        <html><body style="font-family:Arial,sans-serif;">
        <div style="max-width:500px;margin:0 auto;padding:20px;">
            <h2 style="color:#185a9d;">DigiEqub</h2>
            <p>Your <b>{purpose.replace('_', ' ')}</b> code:</p>
            <div style="font-size:32px;font-weight:bold;color:#185a9d;letter-spacing:6px;padding:16px 0;">{otp}</div>
            <p>Expires in {settings.OTP_EXPIRY_MINUTES} minutes. If you didn't request this, ignore this email.</p>
        </div>
        </body></html>
        """
        if not self._email_configured():
            print(f"\nEMAIL OTP for {email}: {otp}")
            logger.warning("Email dev fallback for %s: %s", email, otp)
            return True
        if await self._send_via_sendgrid(email, subject, body):
            return True
        if await self._send_via_smtp(email, subject, body):
            return True
        print(f"\nEMAIL OTP for {email}: {otp}")
        logger.warning("Email fallback for %s: %s", email, otp)
        return bool(settings.DEBUG)

    # ── SMS delivery ──────────────────────────────────────────────────────────

    async def _send_via_africastalking(self, phone: str, message: str) -> bool:
        if not self._has_real_value(settings.AFRICASTALKING_API_KEY):
            return False
        base = settings.AFRICASTALKING_BASE_URL or (
            "https://api.sandbox.africastalking.com" if settings.AFRICASTALKING_USERNAME == "sandbox"
            else "https://api.africastalking.com"
        )
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.post(
                    f"{base.rstrip('/')}/version1/messaging",
                    headers={"apiKey": settings.AFRICASTALKING_API_KEY, "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
                    data={"username": settings.AFRICASTALKING_USERNAME, "to": phone, "message": message, "from": settings.AFRICASTALKING_SENDER},
                )
            if r.status_code == 201:
                logger.info("SMS sent to %s via AT", phone)
                return True
            logger.error("AT SMS failed for %s: %s", phone, r.text)
        except Exception:
            logger.exception("AT SMS failed for %s", phone)
        return False

    async def _send_via_twilio(self, phone: str, message: str) -> bool:
        if not TwilioClient or not self._has_real_value(settings.TWILIO_ACCOUNT_SID):
            return False
        try:
            TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN).messages.create(
                body=message, from_=settings.TWILIO_PHONE_NUMBER, to=phone
            )
            return True
        except Exception:
            logger.exception("Twilio SMS failed for %s", phone)
        return False

    async def send_sms_otp(self, phone: str, otp: str, purpose: str = "verification") -> bool:
        normalized = self._normalize_phone(phone)
        message = f"DigiEqub: Your {purpose.replace('_', ' ')} code is {otp}. Valid for {settings.OTP_EXPIRY_MINUTES} minutes."
        if not self._sms_configured():
            print(f"SMS VERIFICATION CODE for {normalized or phone}: {otp}")
            logger.warning("SMS dev fallback for %s (%s): %s", normalized or phone, purpose, otp)
            return True
        if await self._send_via_africastalking(normalized, message):
            return True
        if await self._send_via_twilio(normalized, message):
            return True
        print(f"SMS VERIFICATION CODE for {normalized or phone}: {otp}")
        logger.warning("SMS fallback for %s (%s): %s", normalized or phone, purpose, otp)
        return bool(settings.DEBUG)

    # ── DB helpers (synchronous pymongo) ──────────────────────────────────────

    def _db(self) -> Database:
        if self.db is None:
            raise RuntimeError("OTPService requires a db instance")
        return self.db

    # ── email verification ────────────────────────────────────────────────────

    async def create_email_verification(self, user_id: str, email: str) -> dict[str, Any]:
        otp = self.generate_otp()
        expires_at = utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
        self._db()["users"].update_one(
            {"_id": str(user_id)},
            {"$set": {"email_otp": {"code": otp, "expires_at": expires_at, "attempts": 0, "created_at": utcnow()}, "updated_at": utcnow()}},
        )
        sent = await self.send_email_otp(email, otp, "email_verification")
        if not sent:
            return {"success": False, "error": f"Failed to send verification code to {email}"}
        return {"success": True, "message": f"Verification code sent to {email}", "expires_in_seconds": settings.OTP_EXPIRY_MINUTES * 60, "resend_in_seconds": 30}

    async def send_email_verification(self, user_id: str, email: str) -> dict[str, Any]:
        return await self.create_email_verification(user_id, email)

    async def resend_email_verification(self, user_id: str, email: str) -> dict[str, Any]:
        user = self._db()["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        if user.get("email_verified"):
            return {"success": False, "error": "Email already verified"}
        return await self.create_email_verification(user_id, email)

    async def verify_email_otp(self, user_id: str, code: str) -> dict[str, Any]:
        user = self._db()["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        otp_data = user.get("email_otp") or {}
        if not otp_data.get("code"):
            return {"success": False, "error": "No verification code found"}
        if int(otp_data.get("attempts", 0)) >= 5:
            return {"success": False, "error": "Too many attempts. Request a new code."}
        expires_at = ensure_utc_datetime(otp_data.get("expires_at"))
        if not expires_at or expires_at < utcnow():
            return {"success": False, "error": "Verification code has expired"}
        if otp_data.get("code") != code:
            self._db()["users"].update_one({"_id": str(user_id)}, {"$inc": {"email_otp.attempts": 1}})
            return {"success": False, "error": "Invalid verification code"}
        self._db()["users"].update_one(
            {"_id": str(user_id)},
            {"$set": {"email_verified": True, "email_otp.verified_at": utcnow(), "updated_at": utcnow()}},
        )
        return {"success": True, "message": "Email verified successfully"}

    # ── phone verification ────────────────────────────────────────────────────

    async def create_phone_verification(self, user_id: str, phone_number: str) -> dict[str, Any]:
        user = self._db()["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        otp = self.generate_otp()
        expires_at = utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
        self._db()["users"].update_one(
            {"_id": str(user_id)},
            {"$set": {"phone_number": phone_number.strip(), "phone_otp": {"code": otp, "expires_at": expires_at, "attempts": 0, "created_at": utcnow()}, "updated_at": utcnow()}},
        )
        sent = await self.send_sms_otp(phone_number.strip(), otp, "phone_verification")
        if not sent:
            return {"success": False, "error": f"Failed to send verification code to {phone_number}"}
        return {"success": True, "message": f"Verification code sent to {phone_number}", "expires_in_seconds": settings.OTP_EXPIRY_MINUTES * 60, "resend_in_seconds": 30}

    async def send_phone_verification(self, user_id: str, phone_number: str) -> dict[str, Any]:
        return await self.create_phone_verification(user_id, phone_number)

    async def verify_phone_otp(self, user_id: str, phone_number: str, code: str) -> dict[str, Any]:
        user = self._db()["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        otp_data = user.get("phone_otp") or {}
        if not otp_data.get("code"):
            return {"success": False, "error": "No verification code found"}
        if int(otp_data.get("attempts", 0)) >= 5:
            return {"success": False, "error": "Too many attempts. Request a new code."}
        expires_at = ensure_utc_datetime(otp_data.get("expires_at"))
        if not expires_at or expires_at < utcnow():
            return {"success": False, "error": "Verification code has expired"}
        if otp_data.get("code") != code:
            self._db()["users"].update_one({"_id": str(user_id)}, {"$inc": {"phone_otp.attempts": 1}})
            return {"success": False, "error": "Invalid verification code"}
        self._db()["users"].update_one(
            {"_id": str(user_id)},
            {"$set": {"phone_number": phone_number.strip(), "phone_verified": True, "phone_otp.verified_at": utcnow(), "updated_at": utcnow()}},
        )
        return {"success": True, "message": "Phone verified successfully"}

    # ── 2FA OTP ───────────────────────────────────────────────────────────────

    async def create_2fa_otp(self, user_id: str, method: str) -> dict[str, Any]:
        user = self._db()["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        otp = self.generate_otp()
        expires_at = utcnow() + timedelta(minutes=5)
        self._db()["users"].update_one(
            {"_id": str(user_id)},
            {"$set": {"two_factor.email_otp": {"code": otp, "expires_at": expires_at, "attempts": 0, "created_at": utcnow()}, "two_factor.method": "email", "updated_at": utcnow()}},
        )
        sent = await self.send_email_otp(user["email"], otp, "2fa_login")
        if not sent:
            return {"success": False, "error": f"Failed to send 2FA code to your email"}
        return {"success": True, "method": "email", "message": "Verification code sent to your email", "target": user["email"], "expires_in_seconds": 300, "resend_in_seconds": 30}

    async def send_2fa_otp(self, user_id: str, method: str) -> dict[str, Any]:
        return await self.create_2fa_otp(user_id, method)

    async def verify_2fa_otp(self, user_id: str, method: str, code: str) -> dict[str, Any]:
        user = self._db()["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        method = method.lower()
        otp_data = (user.get("two_factor") or {}).get(f"{method}_otp") or {}
        if not otp_data.get("code"):
            return {"success": False, "error": "No verification code found"}
        if int(otp_data.get("attempts", 0)) >= 3:
            return {"success": False, "error": "Too many attempts. Request a new code."}
        expires_at = ensure_utc_datetime(otp_data.get("expires_at"))
        if not expires_at or expires_at < utcnow():
            return {"success": False, "error": "Verification code has expired"}
        if otp_data.get("code") != code:
            self._db()["users"].update_one({"_id": str(user_id)}, {"$inc": {f"two_factor.{method}_otp.attempts": 1}})
            return {"success": False, "error": "Invalid verification code"}
        self._db()["users"].update_one(
            {"_id": str(user_id)},
            {"$set": {f"two_factor.{method}_otp": None, "updated_at": utcnow()}},
        )
        return {"success": True, "message": "2FA verification successful"}
