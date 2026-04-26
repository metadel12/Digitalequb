# backend/app/api/v1/auth.py

from __future__ import annotations

from datetime import timedelta
from typing import Any
from urllib.parse import urlencode

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from pymongo.database import Database

logger = logging.getLogger(__name__)

from ...core.config import settings
from ...core.database import get_db
from ...core.mongo_utils import ensure_utc_datetime, new_id, utcnow
from ...core.security import create_access_token, create_refresh_token, oauth2_scheme, verify_token
from ...dependencies import get_current_user
from ...schemas.auth import (
    EmailVerificationRequest,
    EmailOTPRequest,
    ForgotPasswordRequest,
    LoginResponse,
    OAuthSessionRequest,
    PhoneOTPRequest,
    PhoneVerificationRequest,
    RefreshToken,
    ResendVerificationRequest,
    ResetPasswordRequest,
    SecurityQuestionsRequest,
    SecurityQuestionVerifyRequest,
    Token,
    TwoFactorSetupRequest,
    TwoFactorSetupVerifyRequest,
    VerifyOTP,
    VerifyResetCodeRequest,
)
from ...schemas.user import UserCreate, UserResponse
from ...services.auth_service import AuthService, SYSTEM_ADMIN_EMAIL, user_to_response
from ...services.cbe_service import CommercialBankOfEthiopiaService
from ...services.otp_service import OTPService
from ...services.social_auth_service import SocialAuthService

router = APIRouter()


def _frontend_url(path: str) -> str:
    base = settings.FRONTEND_URL.rstrip("/")
    if path.startswith("/"):
        return f"{base}{path}"
    return f"{base}/{path}"


def _oauth_error_redirect(provider: str, error_code: str, message: str | None = None) -> RedirectResponse:
    params = {"oauth_error": error_code}
    if message:
        params["error_message"] = message
    return RedirectResponse(url=f"{_frontend_url('/login')}?{urlencode(params)}", status_code=302)


MAX_SESSIONS = 2


async def _issue_login_response(db: Database, user: dict[str, Any], request: Request | None = None) -> dict[str, Any]:
    import uuid as _uuid
    auth_service = AuthService(db)
    access_token = create_access_token(data={"sub": str(user["_id"]), "role": user.get("role", "user").lower()})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
    auth_service.update_last_login(user["_id"])

    # Build session record
    ua = (request.headers.get("user-agent") or "Unknown") if request else "Unknown"
    ip = (request.client.host if request and request.client else "127.0.0.1")
    session_entry = {
        "id": str(_uuid.uuid4()),
        "device_name": ua[:80],
        "browser": ua.split("/")[0][:40] if "/" in ua else ua[:40],
        "os": "Windows" if "Windows" in ua else ("Mac" if "Mac" in ua else ("Linux" if "Linux" in ua else "Unknown")),
        "ip_address": ip,
        "location": "Local",
        "last_active": utcnow().isoformat(),
        "current": True,
        "access_token_prefix": access_token[:16],
    }

    # Keep max 2 sessions — drop oldest non-current first
    existing = db["users"].find_one({"_id": user["_id"]}, {"active_sessions": 1}) or {}
    sessions = [dict(s, current=False) for s in (existing.get("active_sessions") or [])]
    sessions.append(session_entry)
    if len(sessions) > MAX_SESSIONS:
        sessions = sessions[-MAX_SESSIONS:]  # keep newest

    db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"active_sessions": sessions, "updated_at": utcnow()}},
    )

    refreshed = auth_service.get_user_by_id(user["_id"])
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_to_response(refreshed),
    }


async def _create_2fa_challenge(db: Database, user: dict[str, Any]) -> dict[str, Any]:
    otp_service = OTPService(db)
    method = ((user.get("two_factor") or {}).get("method") or "email").lower()
    if method == "google_authenticator" and user.get("totp_secret"):
        session_token = new_id()
        db["session_codes"].insert_one(
            {
                "_id": session_token,
                "token": session_token,
                "user_id": user["_id"],
                "type": "2fa_pending",
                "method": method,
                "used": False,
                "created_at": utcnow(),
                "expires_at": utcnow() + timedelta(minutes=5),
            }
        )
        return {
            "requires_2fa": True,
            "user_id": user["_id"],
            "session_token": session_token,
            "method": method,
            "message": "Enter the code from your authenticator app.",
        }

    otp_result = await otp_service.create_2fa_otp(user["_id"], "email")
    if not otp_result["success"]:
        raise HTTPException(status_code=500, detail=otp_result["error"])

    session_token = new_id()
    db["session_codes"].insert_one(
        {
            "_id": session_token,
            "token": session_token,
            "user_id": user["_id"],
            "type": "2fa_pending",
            "method": otp_result["method"],
            "used": False,
            "created_at": utcnow(),
            "expires_at": utcnow() + timedelta(minutes=5),
        }
    )
    return {
        "requires_2fa": True,
        "user_id": user["_id"],
        "session_token": session_token,
        "method": otp_result["method"],
        "message": otp_result["message"],
    }


async def _send_registration_notifications(db: Database, user_id: str, email: str) -> None:
    await OTPService(db).send_email_verification(user_id, email)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, background_tasks: BackgroundTasks, db: Database = Depends(get_db)) -> Any:
    auth_service = AuthService(db)
    if user_data.email.strip().lower() == SYSTEM_ADMIN_EMAIL:
        raise HTTPException(status_code=400, detail="This email is reserved for the system admin")
    if auth_service.get_user_by_email(user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if auth_service.get_user_by_phone(user_data.phone_number):
        raise HTTPException(status_code=400, detail="Phone number already registered")
    if not user_data.bank_account or not user_data.bank_account.account_number or not user_data.bank_account.account_name:
        raise HTTPException(status_code=400, detail="Commercial Bank of Ethiopia account number and account name are required")

    bank_service = CommercialBankOfEthiopiaService(db)
    verification = await bank_service.verify_account_ownership(
        user_data.bank_account.account_number,
        user_data.bank_account.account_name,
    )
    if not verification.get("success"):
        raise HTTPException(status_code=400, detail=verification.get("error", "Bank account verification failed"))
    if db["users"].find_one({"bank_account.account_number": user_data.bank_account.account_number}):
        raise HTTPException(status_code=400, detail="This bank account is already registered")

    user_data.bank_account.bank_name = CommercialBankOfEthiopiaService.BANK_NAME
    bank_service._create_or_update_account(
        user_data.bank_account.account_number,
        user_data.bank_account.account_name,
        CommercialBankOfEthiopiaService.BANK_NAME,
        initial_balance=100000.0,
    )
    user = auth_service.create_user(user_data)
    background_tasks.add_task(_send_registration_notifications, db, user["_id"], user["email"])
    return user_to_response(user)


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, db: Database = Depends(get_db)) -> Any:  # noqa: C901
    auth_service = AuthService(db)
    username = ""
    password = ""

    content_type = (request.headers.get("content-type") or "").lower()
    if "application/json" in content_type:
        payload = await request.json()
        username = str(payload.get("username") or payload.get("email") or "").strip()
        password = str(payload.get("password") or "")
    else:
        form = await request.form()
        username = str(form.get("username") or form.get("email") or "").strip()
        password = str(form.get("password") or "")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username/email and password are required")

    user = auth_service.authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    if user.get("status") not in {"ACTIVE", "active"}:
        raise HTTPException(status_code=403, detail=f"Account is {user.get('status')}. Please contact support.")
    if not user.get("email_verified"):
        await OTPService(db).send_email_verification(user["_id"], user["email"])
        raise HTTPException(status_code=403, detail="Email not verified. A new verification code was sent to your inbox.")
    if user.get("is_2fa_enabled") or (user.get("two_factor") or {}).get("enabled"):
        return await _create_2fa_challenge(db, user)
    return await _issue_login_response(db, user, request)


@router.post("/verify-email")
async def verify_email(payload: EmailVerificationRequest, db: Database = Depends(get_db)) -> Any:
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("email_verified"):
        if payload.session_token:
            return await complete_oauth_session(OAuthSessionRequest(session_token=payload.session_token), db)
        return {"success": True, "message": "Email already verified", "already_verified": True}

    result = await OTPService(db).verify_email_otp(user["_id"], payload.code)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    if payload.session_token:
        return await complete_oauth_session(OAuthSessionRequest(session_token=payload.session_token), db)

    return {"success": True, "message": "Email verified successfully. You can now login."}


@router.post("/resend-verification")
async def resend_verification(payload: ResendVerificationRequest, db: Database = Depends(get_db)) -> Any:
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    result = await OTPService(db).resend_email_verification(user["_id"], user["email"])
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/verify-2fa", response_model=LoginResponse)
@router.post("/login/2fa", response_model=LoginResponse)
async def verify_2fa(verify_data: VerifyOTP, db: Database = Depends(get_db)) -> Any:
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(verify_data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if verify_data.session_token:
        session = db["session_codes"].find_one(
            {
                "token": verify_data.session_token,
                "type": "2fa_pending",
                "user_id": user["_id"],
                "used": False,
            }
        )
        expires_at = ensure_utc_datetime((session or {}).get("expires_at"))
        if not session or not expires_at or expires_at < utcnow():
            raise HTTPException(status_code=401, detail="2FA session expired")
        method = session.get("method", "email")
    else:
        method = ((user.get("two_factor") or {}).get("method") or "email").lower()
        session = None

    if method == "google_authenticator":
        if not auth_service.verify_2fa_code(user["_id"], verify_data.otp):
            raise HTTPException(status_code=401, detail="Invalid OTP")
    else:
        result = await OTPService(db).verify_2fa_otp(user["_id"], method, verify_data.otp)
        if not result["success"]:
            raise HTTPException(status_code=401, detail=result["error"])

    if session:
        db["session_codes"].update_one({"_id": session["_id"]}, {"$set": {"used": True}})
    return await _issue_login_response(db, user)


@router.post("/oauth/complete", response_model=LoginResponse)
async def complete_oauth_session(payload: OAuthSessionRequest, db: Database = Depends(get_db)) -> Any:
    session = db["session_codes"].find_one(
        {"token": payload.session_token, "type": "oauth_pending", "used": False}
    )
    expires_at = ensure_utc_datetime((session or {}).get("expires_at"))
    if not session or not expires_at or expires_at < utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    user = AuthService(db).get_user_by_id(session["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.get("email_verified"):
        raise HTTPException(status_code=403, detail="Email not verified")

    # Consume the OAuth session before issuing a login or 2FA challenge so the
    # one-time token cannot be replayed into duplicate OTP sends.
    db["session_codes"].update_one({"_id": session["_id"]}, {"$set": {"used": True, "used_at": utcnow()}})

    if user.get("is_2fa_enabled") or (user.get("two_factor") or {}).get("enabled"):
        return await _create_2fa_challenge(db, user)
    return await _issue_login_response(db, user)


async def _handle_oauth_callback(provider: str, code: str, state: str, db: Database, callback_user_payload: str | None = None) -> RedirectResponse:
    social_service = SocialAuthService(db)
    if not social_service.is_configured(provider):
        raise HTTPException(status_code=503, detail=f"{provider.title()} OAuth is not configured")

    state_record = social_service.get_valid_state_record(provider, state)
    if not state_record:
        return _oauth_error_redirect(provider, "invalid_state", "OAuth state is invalid or has expired.")

    try:
        user_info = await social_service.resolve_user_info(provider, code, callback_user_payload)
    except Exception as exc:
        logger.exception("OAuth token exchange failed for provider=%s: %s", provider, exc)
        return _oauth_error_redirect(provider, "token_exchange_failed", f"OAuth error: {exc}")

    if not user_info.get("email") or not user_info.get("provider_user_id"):
        return _oauth_error_redirect(provider, "incomplete_account", f"{provider.title()} account data is incomplete")

    social_service.consume_state(state_record["_id"])

    auth_service = AuthService(db)
    user = db["users"].find_one({f"social_logins.{provider}_id": user_info["provider_user_id"]})
    if not user:
        user = auth_service.get_user_by_email(user_info["email"])
        if user:
            auth_service.link_social_login(user["_id"], provider, user_info["provider_user_id"])
            user = auth_service.get_user_by_id(user["_id"])
        else:
            now = utcnow()
            user = {
                "_id": new_id(),
                "email": user_info["email"].strip().lower(),
                "full_name": user_info["full_name"],
                "email_verified": False,
                "phone_verified": False,
                "hashed_password": "",
                "role": "user",
                "is_admin": False,
                "is_participant": True,
                "status": "active",
                "kyc_status": "not_submitted",
                "credit_score": 600,
                "total_savings": 0.0,
                "total_borrowed": 0.0,
                "total_repaid": 0.0,
                "default_count": 0,
                "wallet_address": None,
                "private_key_encrypted": None,
                "is_2fa_enabled": False,
                "totp_secret": None,
                "social_logins": {f"{provider}_id": user_info["provider_user_id"]},
                "email_otp": None,
                "phone_otp": None,
                "two_factor": {
                    "enabled": False,
                    "method": "email",
                    "email_otp": None,
                    "sms_otp": None,
                    "pending_method": None,
                    "setup_completed": False,
                },
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
            db["users"].insert_one(user)

    session_token = new_id()
    db["session_codes"].insert_one(
        {
            "_id": session_token,
            "token": session_token,
            "user_id": user["_id"],
            "type": "oauth_pending",
            "provider": provider,
            "used": False,
            "created_at": utcnow(),
            "expires_at": utcnow() + timedelta(minutes=30),
        }
    )

    if not user.get("email_verified"):
        # ✅ FIXED: Changed from create_email_verification to send_email_verification
        await OTPService(db).send_email_verification(user["_id"], user["email"])
        target = _frontend_url(f"/verify-email?email={user['email']}&session_token={session_token}&provider={provider}")
    else:
        target = _frontend_url(f"/login?oauth_session={session_token}&provider={provider}")
    return RedirectResponse(url=target, status_code=302)


@router.get("/google/url")
async def google_auth_url(db: Database = Depends(get_db)) -> Any:
    social_service = SocialAuthService(db)
    if not social_service.is_configured("google"):
        raise HTTPException(status_code=503, detail="Google OAuth is not configured")
    return RedirectResponse(url=social_service.build_auth_url("google"), status_code=302)


@router.get("/apple/url")
async def apple_auth_url(db: Database = Depends(get_db)) -> Any:
    social_service = SocialAuthService(db)
    if not social_service.is_configured("apple"):
        raise HTTPException(status_code=503, detail="Apple OAuth is not configured")
    return RedirectResponse(url=social_service.build_auth_url("apple"), status_code=302)


@router.get("/google/callback")
async def google_callback(code: str, state: str, db: Database = Depends(get_db)) -> Any:
    return await _handle_oauth_callback("google", code, state, db)


@router.api_route("/apple/callback", methods=["GET", "POST"])
async def apple_callback(request: Request, db: Database = Depends(get_db)) -> Any:
    if request.method == "POST":
        form = await request.form()
        code = str(form.get("code") or "")
        state = str(form.get("state") or "")
        user_payload = str(form.get("user") or "")
    else:
        code = str(request.query_params.get("code") or "")
        state = str(request.query_params.get("state") or "")
        user_payload = str(request.query_params.get("user") or "")

    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing Apple OAuth callback parameters")
    return await _handle_oauth_callback("apple", code, state, db, callback_user_payload=user_payload)


@router.get("/onboarding-status")
async def onboarding_status(current_user=Depends(get_current_user)) -> Any:
    security_questions = current_user.get("security_questions") or []
    two_factor = current_user.get("two_factor") or {}
    complete = bool(
        current_user.get("email_verified")
        and current_user.get("phone_verified")
        and len(security_questions) >= 3
        and (current_user.get("is_2fa_enabled") or two_factor.get("enabled"))
    )
    return {
        "email_verified": bool(current_user.get("email_verified")),
        "phone_verified": bool(current_user.get("phone_verified")),
        "phone_number": current_user.get("phone_number"),
        "security_questions_configured": len(security_questions) >= 3,
        "security_questions_count": len(security_questions),
        "two_factor_enabled": bool(current_user.get("is_2fa_enabled") or two_factor.get("enabled")),
        "two_factor_method": two_factor.get("method"),
        "complete": complete,
    }


@router.post("/send-sms-otp")
async def send_sms_otp(payload: PhoneOTPRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)) -> Any:
    normalized_phone = payload.phone_number.strip()
    existing = AuthService(db).get_user_by_phone(normalized_phone)
    if existing and existing["_id"] != current_user["_id"]:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    result = await OTPService(db).send_phone_verification(current_user["_id"], normalized_phone)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/send-email-otp")
async def send_email_otp(payload: EmailOTPRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)) -> Any:
    email = (payload.email or current_user["email"]).strip().lower()
    if email != current_user["email"]:
        existing = AuthService(db).get_user_by_email(email)
        if existing and existing["_id"] != current_user["_id"]:
            raise HTTPException(status_code=400, detail="Email already registered")
        db["users"].update_one(
            {"_id": current_user["_id"]},
            {"$set": {"email": email, "email_verified": False, "updated_at": utcnow()}},
        )

    result = await OTPService(db).send_email_verification(current_user["_id"], email)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/verify-phone")
async def verify_phone(payload: PhoneVerificationRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)) -> Any:
    phone_number = (payload.phone_number or current_user.get("phone_number") or "").strip()
    if not phone_number:
        raise HTTPException(status_code=400, detail="Phone number required")
    result = await OTPService(db).verify_phone_otp(current_user["_id"], phone_number, payload.code)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/security-questions")
async def save_security_questions(payload: SecurityQuestionsRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)) -> Any:
    questions = payload.questions or []
    if len(questions) != 3:
        raise HTTPException(status_code=400, detail="Exactly 3 security questions are required")
    normalized_questions = []
    seen = set()
    for item in questions:
        question = item.question.strip()
        answer = item.answer.strip()
        if not question or not answer:
            raise HTTPException(status_code=400, detail="Each security question must include a question and answer")
        if question.lower() in seen:
            raise HTTPException(status_code=400, detail="Security questions must be unique")
        seen.add(question.lower())
        normalized_questions.append({"question": question, "answer": answer})

    AuthService(db).set_security_questions(current_user["_id"], normalized_questions)
    return {"success": True, "message": "Security questions saved successfully"}


@router.post("/2fa/setup")
async def setup_2fa_method(payload: TwoFactorSetupRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)) -> Any:
    method = payload.method.lower()
    if method not in {"email", "google_authenticator"}:
        raise HTTPException(status_code=400, detail="Invalid 2FA method. Only email and authenticator app are supported.")

    auth_service = AuthService(db)
    if method == "google_authenticator":
        provisioning_uri = auth_service.setup_2fa(current_user["_id"])
        db["users"].update_one(
            {"_id": current_user["_id"]},
            {
                "$set": {
                    "is_2fa_enabled": False,
                    "two_factor.enabled": False,
                    "two_factor.method": method,
                    "two_factor.pending_method": method,
                    "two_factor.setup_completed": False,
                    "updated_at": utcnow(),
                }
            },
        )
        return {"success": True, "method": method, "provisioning_uri": provisioning_uri}

    result = await OTPService(db).create_2fa_otp(current_user["_id"], method)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"two_factor.pending_method": method, "updated_at": utcnow()}},
    )
    return result


@router.post("/2fa/verify-setup")
async def verify_2fa_setup(payload: TwoFactorSetupVerifyRequest, current_user=Depends(get_current_user), db: Database = Depends(get_db)) -> Any:
    method = payload.method.lower()
    if method == "google_authenticator":
        if not AuthService(db).verify_2fa_code(current_user["_id"], payload.code):
            raise HTTPException(status_code=400, detail="Invalid OTP")
    else:
        result = await OTPService(db).verify_2fa_otp(current_user["_id"], method, payload.code)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])

    backup_codes = AuthService(db).generate_backup_codes()
    db["users"].update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "is_2fa_enabled": True,
                "two_factor.enabled": True,
                "two_factor.method": method,
                "two_factor.pending_method": None,
                "two_factor.setup_completed": True,
                "two_factor.backup_codes": backup_codes,
                "updated_at": utcnow(),
            }
        },
    )
    return {"success": True, "message": "2FA enabled successfully", "backup_codes": backup_codes}


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token_data: RefreshToken, db: Database = Depends(get_db)) -> Any:
    payload = verify_token(refresh_token_data.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = AuthService(db).get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token(data={"sub": str(user["_id"]), "role": user.get("role", "user").lower()})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_authenticated_user(current_user=Depends(get_current_user)) -> Any:
    return user_to_response(current_user)


@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme), db: Database = Depends(get_db)) -> Any:
    await AuthService(db).blacklist_token(token)
    return {"message": "Successfully logged out"}


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: Database = Depends(get_db)) -> Any:
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(payload.email)
    # Always return success to prevent email enumeration
    if not user:
        return {"success": True, "message": "If that email is registered, a reset code was sent."}
    otp_service = OTPService(db)
    otp = otp_service.generate_otp()
    from datetime import timedelta
    expires_at = utcnow() + timedelta(minutes=15)
    db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"password_reset_otp": {"code": otp, "expires_at": expires_at, "attempts": 0}, "updated_at": utcnow()}},
    )
    await otp_service.send_email_otp(user["email"], otp, "password_reset")
    return {"success": True, "message": "If that email is registered, a reset code was sent."}


@router.post("/verify-reset-code")
async def verify_reset_code(payload: VerifyResetCodeRequest, db: Database = Depends(get_db)) -> Any:
    from app.core.mongo_utils import ensure_utc_datetime
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    otp_data = user.get("password_reset_otp") or {}
    if not otp_data.get("code"):
        raise HTTPException(status_code=400, detail="No reset code found. Request a new one.")
    expires_at = ensure_utc_datetime(otp_data.get("expires_at"))
    if not expires_at or expires_at < utcnow():
        raise HTTPException(status_code=400, detail="Reset code has expired")
    if int(otp_data.get("attempts", 0)) >= 5:
        raise HTTPException(status_code=400, detail="Too many attempts. Request a new reset code.")
    if otp_data.get("code") != payload.code:
        db["users"].update_one({"_id": user["_id"]}, {"$inc": {"password_reset_otp.attempts": 1}})
        raise HTTPException(status_code=400, detail="Invalid reset code")
    return {"success": True, "message": "Code verified"}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: Database = Depends(get_db)) -> Any:
    from app.core.mongo_utils import ensure_utc_datetime
    from app.core.security import get_password_hash
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
    otp_data = user.get("password_reset_otp") or {}
    expires_at = ensure_utc_datetime(otp_data.get("expires_at"))
    if not otp_data.get("code") or not expires_at or expires_at < utcnow():
        raise HTTPException(status_code=400, detail="Reset code expired. Request a new one.")
    if otp_data.get("code") != payload.code:
        raise HTTPException(status_code=400, detail="Invalid reset code")
    db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"hashed_password": get_password_hash(payload.password), "password_reset_otp": None, "updated_at": utcnow()}},
    )
    return {"success": True, "message": "Password reset successfully. You can now sign in."}


@router.post("/security-questions/verify")
async def verify_security_question(payload: SecurityQuestionVerifyRequest, db: Database = Depends(get_db)) -> Any:
    from app.core.security import verify_password
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
    questions = user.get("security_questions") or []
    matched = next((q for q in questions if q.get("question", "").strip().lower() == payload.question.strip().lower()), None)
    if not matched:
        raise HTTPException(status_code=400, detail="Question not found")
    if not verify_password(payload.answer.strip().lower(), matched.get("answer_hash", "")):
        raise HTTPException(status_code=400, detail="Incorrect answer")
    # Issue a short-lived reset OTP so they can proceed to reset password
    otp_service = OTPService(db)
    otp = otp_service.generate_otp()
    from datetime import timedelta
    expires_at = utcnow() + timedelta(minutes=15)
    db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"password_reset_otp": {"code": otp, "expires_at": expires_at, "attempts": 0}, "updated_at": utcnow()}},
    )
    return {"success": True, "message": "Identity verified", "code": otp}


@router.get("/check-email")
async def check_email(email: str, db: Database = Depends(get_db)) -> Any:
    user = AuthService(db).get_user_by_email(email)
    return {"exists": bool(user)}


@router.get("/check-phone")
async def check_phone(phone: str, db: Database = Depends(get_db)) -> Any:
    user = AuthService(db).get_user_by_phone(phone)
    return {"exists": bool(user)}


@router.get("/check-account")
async def check_account(account_number: str, db: Database = Depends(get_db)) -> Any:
    exists = bool(db["users"].find_one({"bank_account.account_number": account_number.strip()}))
    return {"exists": exists}


@router.get("/security-questions/list")
async def get_security_questions(email: str, db: Database = Depends(get_db)) -> Any:
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    questions = [q.get("question") for q in (user.get("security_questions") or [])]
    return {"questions": questions}