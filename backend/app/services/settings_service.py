import uuid
from datetime import datetime
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from ..models.user import User
from ..schemas.settings import (
    AppearanceSettingsPayload,
    DataSettingsPayload,
    LanguageSettingsPayload,
    NotificationSettingsPayload,
    SecuritySettingsPayload,
    SettingsResponse,
)


def _deep_merge(base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(base)
    for key, value in (override or {}).items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


class SettingsService:
    def __init__(self, db: Session):
        self.db = db

    def get_settings(self, user: User) -> SettingsResponse:
        settings_blob = user.app_settings or {}
        return SettingsResponse(
            appearance=_deep_merge(self._default_appearance(), settings_blob.get("appearance", {})),
            notifications=_deep_merge(self._default_notifications(), user.notification_preferences or settings_blob.get("notifications", {})),
            security=_deep_merge(self._default_security(user), _deep_merge(user.security_settings or {}, settings_blob.get("security", {}))),
            language=_deep_merge(self._default_language(), settings_blob.get("language", {})),
            data=_deep_merge(self._default_data(), settings_blob.get("data", {})),
            payment_methods=user.saved_beneficiaries or {"bank_accounts": [], "mobile_accounts": [], "crypto_wallets": []},
        )

    def update_appearance(self, user: User, payload: AppearanceSettingsPayload) -> SettingsResponse:
        user.app_settings = _deep_merge(user.app_settings or {}, {"appearance": payload.dict()})
        self._save(user)
        return self.get_settings(user)

    def update_notifications(self, user: User, payload: NotificationSettingsPayload) -> SettingsResponse:
        user.notification_preferences = payload.dict()
        user.app_settings = _deep_merge(user.app_settings or {}, {"notifications": payload.dict()})
        self._save(user)
        return self.get_settings(user)

    def update_security(self, user: User, payload: SecuritySettingsPayload) -> SettingsResponse:
        user.privacy_settings = {
            "profile_visibility": payload.profile_visibility,
            "show_email": payload.show_email,
            "show_phone": payload.show_phone,
            "show_wallet_balance": payload.show_wallet_balance,
            "show_transaction_history": payload.show_transaction_history,
            "data_sharing_enabled": payload.data_sharing_enabled,
        }
        user.security_settings = payload.dict()
        user.app_settings = _deep_merge(user.app_settings or {}, {"security": payload.dict()})
        self._save(user)
        return self.get_settings(user)

    def update_language(self, user: User, payload: LanguageSettingsPayload) -> SettingsResponse:
        user.app_settings = _deep_merge(user.app_settings or {}, {"language": payload.dict()})
        self._save(user)
        return self.get_settings(user)

    def update_data_settings(self, user: User, payload: DataSettingsPayload) -> SettingsResponse:
        user.app_settings = _deep_merge(user.app_settings or {}, {"data": payload.dict()})
        self._save(user)
        return self.get_settings(user)

    def get_sessions(self, user: User) -> List[Dict[str, Any]]:
        sessions = user.active_sessions or []
        if sessions:
            return sessions
        fallback = [{
            "id": str(uuid.uuid4()),
            "device_name": "Current Device",
            "browser": "Web Browser",
            "os": "Unknown OS",
            "ip_address": "127.0.0.1",
            "location": "Local Session",
            "last_active": datetime.utcnow().isoformat(),
            "current": True,
        }]
        user.active_sessions = fallback
        self._save(user)
        return fallback

    def remove_session(self, user: User, session_id: str) -> List[Dict[str, Any]]:
        user.active_sessions = [item for item in (user.active_sessions or []) if item.get("id") != session_id]
        self._save(user)
        return user.active_sessions or []

    def logout_all_sessions(self, user: User) -> List[Dict[str, Any]]:
        user.active_sessions = [{
            "id": str(uuid.uuid4()),
            "device_name": "Current Device",
            "browser": "Web Browser",
            "os": "Unknown OS",
            "ip_address": "127.0.0.1",
            "location": "Local Session",
            "last_active": datetime.utcnow().isoformat(),
            "current": True,
        }]
        self._save(user)
        return user.active_sessions

    def get_login_history(self, user: User) -> List[Dict[str, Any]]:
        history = user.login_history or []
        if history:
            return history
        sample = [{
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "device_name": "Current Device",
            "browser": "Web Browser",
            "os": "Unknown OS",
            "ip_address": "127.0.0.1",
            "location": "Local Session",
            "success": True,
        }]
        user.login_history = sample
        self._save(user)
        return sample

    def _save(self, user: User) -> None:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

    def _default_appearance(self) -> Dict[str, Any]:
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

    def _default_notifications(self) -> Dict[str, Any]:
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

    def _default_security(self, user: User) -> Dict[str, Any]:
        privacy = user.privacy_settings or {}
        return {
            "two_factor_enabled": bool(user.is_2fa_enabled),
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

    def _default_language(self) -> Dict[str, Any]:
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

    def _default_data(self) -> Dict[str, Any]:
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
                "last_synced_at": datetime.utcnow().isoformat(),
            },
        }
