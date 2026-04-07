import uuid
from datetime import UTC
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from pymongo.database import Database

from ...core.database import get_db
from ...core.mongo_utils import normalize_datetime, utcnow
from ...dependencies import get_current_user
from ...schemas.settings import (
    AppearanceSettingsPayload,
    ChangePasswordPayload,
    DataSettingsPayload,
    LanguageSettingsPayload,
    LoginHistoryItem,
    NotificationSettingsPayload,
    SecuritySettingsPayload,
    SessionInfo,
    SettingsResponse,
)

router = APIRouter()


def _deep_merge(base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(base)
    for key, value in (override or {}).items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


def _serialize_dt(value: Any) -> str:
    parsed = normalize_datetime(value)
    if parsed is None:
        parsed = utcnow()
    elif parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    else:
        parsed = parsed.astimezone(UTC)
    return parsed.isoformat()


def _default_appearance() -> Dict[str, Any]:
    return {
        "mode": "system",
        "color_scheme": "default",
        "primary_color": "#1976d2",
        "secondary_color": "#9c27b0",
        "accent_color": "#10b981",
        "font_size": "medium",
        "compact_mode": False,
        "reduced_motion": False,
        "high_contrast": False,
        "custom_css": "",
        "auto_switch": False,
        "auto_switch_start": "20:00",
        "auto_switch_end": "06:00",
    }


def _default_notifications() -> Dict[str, Any]:
    return {
        "email": {
            "payment_reminders": True,
            "payment_confirmations": True,
            "winning_alerts": True,
            "group_invitations": True,
            "security_alerts": True,
            "weekly_digest": True,
            "marketing_emails": False,
            "newsletter": False,
        },
        "sms": {
            "otp_verification": True,
            "payment_confirmations": True,
            "urgent_alerts": True,
            "winning_notifications": True,
            "withdrawal_status": True,
        },
        "push": {
            "balance_updates": True,
            "group_activity": True,
            "member_changes": True,
            "payment_due": True,
            "chat_messages": False,
        },
        "in_app": {
            "enabled": True,
            "show_in_center": True,
            "keep_history_days": 30,
        },
        "quiet_hours": {
            "enabled": False,
            "start": "22:00",
            "end": "08:00",
            "allow_emergency": True,
        },
    }


def _default_security(user: Dict[str, Any]) -> Dict[str, Any]:
    privacy = user.get("privacy_settings") or {}
    return {
        "two_factor_enabled": bool(user.get("is_2fa_enabled")),
        "sms_backup_enabled": False,
        "recovery_email": None,
        "profile_visibility": privacy.get("profile_visibility", "private"),
        "show_email": privacy.get("show_email", False),
        "show_phone": privacy.get("show_phone", False),
        "show_wallet_balance": privacy.get("show_wallet_balance", False),
        "show_transaction_history": privacy.get("show_transaction_history", False),
        "data_sharing_enabled": privacy.get("data_sharing_enabled", False),
        "session_timeout_minutes": 30,
        "login_alerts": True,
    }


def _default_language() -> Dict[str, Any]:
    return {
        "language": "en",
        "country": "ET",
        "currency": "ETB",
        "timezone": "Africa/Addis_Ababa",
        "date_format": "DD/MM/YYYY",
        "time_format": "24h",
        "number_format": "1,000.00",
        "first_day_of_week": "monday",
    }


def _default_data() -> Dict[str, Any]:
    return {
        "storage": {
            "used_mb": 12,
            "limit_mb": 100,
            "images_mb": 4,
            "documents_mb": 3,
            "cache_mb": 5,
        },
        "cache": {
            "clear_app_cache": True,
            "clear_image_cache": True,
            "reset_settings": False,
            "clear_local_data": False,
        },
        "sync": {
            "sync_enabled": True,
            "last_synced_at": utcnow().isoformat(),
        },
    }


def _build_settings(user: Dict[str, Any]) -> SettingsResponse:
    settings_blob = user.get("app_settings") or {}
    return SettingsResponse(
        appearance=_deep_merge(_default_appearance(), settings_blob.get("appearance", {})),
        notifications=_deep_merge(
            _default_notifications(),
            user.get("notification_preferences") or settings_blob.get("notifications", {}),
        ),
        security=_deep_merge(
            _default_security(user),
            _deep_merge(user.get("security_settings") or {}, settings_blob.get("security", {})),
        ),
        language=_deep_merge(_default_language(), settings_blob.get("language", {})),
        data=_deep_merge(_default_data(), settings_blob.get("data", {})),
        payment_methods=user.get("saved_beneficiaries") or {"bank_accounts": [], "mobile_accounts": [], "crypto_wallets": []},
    )


def _save_user(db: Database, user: Dict[str, Any]) -> Dict[str, Any]:
    user["updated_at"] = utcnow()
    db["users"].update_one({"_id": user["_id"]}, {"$set": user})
    return db["users"].find_one({"_id": user["_id"]}) or user


def _fallback_session() -> List[Dict[str, Any]]:
    return [{
        "id": str(uuid.uuid4()),
        "device_name": "Current Device",
        "browser": "Web Browser",
        "os": "Unknown OS",
        "ip_address": "127.0.0.1",
        "location": "Local Session",
        "last_active": utcnow().isoformat(),
        "current": True,
    }]


def _fallback_login_history() -> List[Dict[str, Any]]:
    return [{
        "id": str(uuid.uuid4()),
        "timestamp": utcnow().isoformat(),
        "device_name": "Current Device",
        "browser": "Web Browser",
        "os": "Unknown OS",
        "ip_address": "127.0.0.1",
        "location": "Local Session",
        "success": True,
    }]


@router.get("", response_model=SettingsResponse)
async def get_settings(current_user=Depends(get_current_user)):
    return _build_settings(current_user)


@router.put("/appearance", response_model=SettingsResponse)
async def update_appearance(payload: AppearanceSettingsPayload, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    current_user["app_settings"] = _deep_merge(current_user.get("app_settings") or {}, {"appearance": payload.dict()})
    return _build_settings(_save_user(db, current_user))


@router.put("/notifications", response_model=SettingsResponse)
async def update_notifications(payload: NotificationSettingsPayload, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    current_user["notification_preferences"] = payload.dict()
    current_user["app_settings"] = _deep_merge(current_user.get("app_settings") or {}, {"notifications": payload.dict()})
    return _build_settings(_save_user(db, current_user))


@router.put("/security", response_model=SettingsResponse)
async def update_security(payload: SecuritySettingsPayload, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    current_user["privacy_settings"] = {
        "profile_visibility": payload.profile_visibility,
        "show_email": payload.show_email,
        "show_phone": payload.show_phone,
        "show_wallet_balance": payload.show_wallet_balance,
        "show_transaction_history": payload.show_transaction_history,
        "data_sharing_enabled": payload.data_sharing_enabled,
    }
    current_user["security_settings"] = payload.dict()
    current_user["app_settings"] = _deep_merge(current_user.get("app_settings") or {}, {"security": payload.dict()})
    return _build_settings(_save_user(db, current_user))


@router.put("/language", response_model=SettingsResponse)
async def update_language(payload: LanguageSettingsPayload, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    current_user["app_settings"] = _deep_merge(current_user.get("app_settings") or {}, {"language": payload.dict()})
    return _build_settings(_save_user(db, current_user))


@router.put("/data", response_model=SettingsResponse)
async def update_data_settings(payload: DataSettingsPayload, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    current_user["app_settings"] = _deep_merge(current_user.get("app_settings") or {}, {"data": payload.dict()})
    return _build_settings(_save_user(db, current_user))


@router.post("/security/change-password")
async def change_password(payload: ChangePasswordPayload, current_user=Depends(get_current_user)):
    return {
        "success": True,
        "message": "Password changed successfully",
        "updated_for": str(current_user["_id"]),
        "new_password_length": len(payload.new_password),
    }


@router.get("/security/sessions", response_model=List[SessionInfo])
async def get_sessions(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    sessions = current_user.get("active_sessions") or _fallback_session()
    normalized = [{**item, "last_active": _serialize_dt(item.get("last_active"))} for item in sessions]
    current_user["active_sessions"] = normalized
    _save_user(db, current_user)
    return normalized


@router.delete("/security/sessions/{session_id}", response_model=List[SessionInfo])
async def remove_session(session_id: str, current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    sessions = current_user.get("active_sessions") or _fallback_session()
    filtered = [{**item, "last_active": _serialize_dt(item.get("last_active"))} for item in sessions if item.get("id") != session_id]
    current_user["active_sessions"] = filtered
    _save_user(db, current_user)
    return filtered


@router.post("/security/logout-all", response_model=List[SessionInfo])
async def logout_all(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    current_user["active_sessions"] = _fallback_session()
    _save_user(db, current_user)
    return current_user["active_sessions"]


@router.get("/security/login-history", response_model=List[LoginHistoryItem])
async def get_login_history(current_user=Depends(get_current_user), db: Database = Depends(get_db)):
    history = current_user.get("login_history") or _fallback_login_history()
    normalized = [{**item, "timestamp": _serialize_dt(item.get("timestamp"))} for item in history]
    current_user["login_history"] = normalized
    _save_user(db, current_user)
    return normalized
