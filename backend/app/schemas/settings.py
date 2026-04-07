from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AppearanceSettingsPayload(BaseModel):
    mode: str = Field(default="system")
    color_scheme: str = Field(default="default")
    primary_color: str = Field(default="#1976d2")
    secondary_color: str = Field(default="#9c27b0")
    accent_color: str = Field(default="#10b981")
    font_size: str = Field(default="medium")
    compact_mode: bool = False
    reduced_motion: bool = False
    high_contrast: bool = False
    custom_css: str = Field(default="")
    auto_switch: bool = False
    auto_switch_start: str = Field(default="20:00")
    auto_switch_end: str = Field(default="06:00")


class NotificationSettingsPayload(BaseModel):
    email: Dict[str, bool] = Field(default_factory=dict)
    sms: Dict[str, bool] = Field(default_factory=dict)
    push: Dict[str, bool] = Field(default_factory=dict)
    in_app: Dict[str, Any] = Field(default_factory=dict)
    quiet_hours: Dict[str, Any] = Field(default_factory=dict)


class SecuritySettingsPayload(BaseModel):
    two_factor_enabled: bool = False
    sms_backup_enabled: bool = False
    recovery_email: Optional[str] = None
    profile_visibility: str = Field(default="private")
    show_email: bool = False
    show_phone: bool = False
    show_wallet_balance: bool = False
    show_transaction_history: bool = False
    data_sharing_enabled: bool = False
    session_timeout_minutes: int = Field(default=30)
    login_alerts: bool = True


class LanguageSettingsPayload(BaseModel):
    language: str = Field(default="en")
    country: str = Field(default="ET")
    currency: str = Field(default="ETB")
    timezone: str = Field(default="Africa/Addis_Ababa")
    date_format: str = Field(default="DD/MM/YYYY")
    time_format: str = Field(default="24h")
    number_format: str = Field(default="1,000.00")
    first_day_of_week: str = Field(default="monday")


class DataSettingsPayload(BaseModel):
    storage: Dict[str, Any] = Field(default_factory=dict)
    cache: Dict[str, Any] = Field(default_factory=dict)
    sync: Dict[str, Any] = Field(default_factory=dict)


class SettingsResponse(BaseModel):
    appearance: Dict[str, Any]
    notifications: Dict[str, Any]
    security: Dict[str, Any]
    language: Dict[str, Any]
    data: Dict[str, Any]
    payment_methods: Dict[str, List[Dict[str, Any]]]


class SessionInfo(BaseModel):
    id: str
    device_name: str
    browser: str
    os: str
    ip_address: str
    location: str
    last_active: str
    current: bool = False


class LoginHistoryItem(BaseModel):
    id: str
    timestamp: str
    device_name: str
    browser: str
    os: str
    ip_address: str
    location: str
    success: bool = True


class ChangePasswordPayload(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str
