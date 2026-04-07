from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class BeneficiaryCreateRequest(BaseModel):
    data: Dict[str, Any]


class BeneficiaryListResponse(BaseModel):
    bank_accounts: List[Dict[str, Any]]
    mobile_accounts: List[Dict[str, Any]]
    crypto_wallets: List[Dict[str, Any]]


class ProfileWalletResponse(BaseModel):
    balance: float
    total_deposits: float
    total_withdrawals: float
    total_winnings: float
    pending_deposits: float
    pending_withdrawals: float
    currency: str
    wallet_address: Optional[str]
    available_balance: float
    pending_transactions_count: int
    updated_at: Optional[datetime]


class ProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone_number: str
    profile_picture: Optional[str]
    date_of_birth: Optional[datetime]
    address: Dict[str, Any]
    profile_metadata: Dict[str, Any]
    notification_preferences: Dict[str, Any]
    privacy_settings: Dict[str, Any]
    security_settings: Dict[str, Any]
    app_settings: Dict[str, Any]


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[Dict[str, Any]] = None
    profile_metadata: Optional[Dict[str, Any]] = None
    notification_preferences: Optional[Dict[str, Any]] = None
    privacy_settings: Optional[Dict[str, Any]] = None
    security_settings: Optional[Dict[str, Any]] = None
    app_settings: Optional[Dict[str, Any]] = None


class AvatarPayload(BaseModel):
    image_data: str
