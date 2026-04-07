from __future__ import annotations

import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any, Dict, Iterable, Optional

from app.models.user import KYCStatus, UserRole, UserStatus


def utcnow() -> datetime:
    return datetime.now(UTC)


def new_id() -> str:
    return str(uuid.uuid4())


def normalize_datetime(value: Any) -> Optional[datetime]:
    if value is None or isinstance(value, datetime):
        return value
    if isinstance(value, str) and value:
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def enum_value(value: Any) -> Any:
    return value.value if hasattr(value, "value") else value


def user_doc_to_response(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": doc["_id"],
        "email": doc["email"],
        "phone_number": doc["phone_number"],
        "full_name": doc["full_name"],
        "role": enum_value(doc.get("role", UserRole.USER.value)),
        "status": enum_value(doc.get("status", UserStatus.PENDING.value)),
        "kyc_status": enum_value(doc.get("kyc_status", KYCStatus.NOT_SUBMITTED.value)),
        "credit_score": int(doc.get("credit_score", 0)),
        "wallet_address": doc.get("wallet_address"),
        "bank_account": doc.get("bank_account"),
        "profile_picture": doc.get("profile_picture"),
        "is_2fa_enabled": bool(doc.get("is_2fa_enabled", False)),
        "created_at": normalize_datetime(doc.get("created_at")) or utcnow(),
        "last_login": normalize_datetime(doc.get("last_login")),
    }


def wallet_defaults(user_id: str) -> Dict[str, Any]:
    now = utcnow()
    return {
        "_id": new_id(),
        "user_id": user_id,
        "balance": 0.0,
        "currency": "ETB",
        "wallet_address": f"0x{secrets.token_hex(20)}",
        "total_deposits": 0.0,
        "total_withdrawals": 0.0,
        "total_winnings": 0.0,
        "total_equb_paid": 0.0,
        "pending_deposits": 0.0,
        "pending_withdrawals": 0.0,
        "total_transactions": 0,
        "last_transaction_at": None,
        "is_locked": False,
        "auto_withdraw_enabled": False,
        "auto_deposit_enabled": False,
        "daily_withdrawal_limit": 50000.0,
        "weekly_withdrawal_limit": 200000.0,
        "monthly_withdrawal_limit": 500000.0,
        "spending_limit": 0.0,
        "linked_accounts": [],
        "created_at": now,
        "updated_at": now,
    }


def group_member_doc(user_doc: Dict[str, Any], position: int) -> Dict[str, Any]:
    return {
        "user_id": user_doc["_id"],
        "joined_at": utcnow(),
        "position": position,
        "contribution_count": 0,
        "has_paid_current_round": False,
        "rounds_completed": [],
        "received_payout": False,
        "has_received_payout": False,
        "payout_amount": 0.0,
        "payout_received_at": None,
        "next_payment_due": None,
        "missed_payments": 0,
        "total_contributed": 0.0,
        "full_name": user_doc.get("full_name", "Unknown"),
        "email": user_doc.get("email", ""),
        "bank_account": user_doc.get("bank_account"),
    }


def group_total_rounds(group_doc: Dict[str, Any]) -> int:
    frequency = group_doc.get("frequency")
    duration_weeks = int(group_doc.get("duration_weeks") or 0)
    if frequency == "daily":
        return max(duration_weeks * 7, 1)
    if frequency == "monthly":
        return max(round(duration_weeks / 4), 1)
    return max(duration_weeks, 1)


def current_round_number(group_doc: Dict[str, Any]) -> int:
    members = group_doc.get("members") or []
    if not members:
        return 1
    return min(int(member.get("contribution_count") or 0) for member in members) + 1


def next_payment_due(frequency: str) -> datetime:
    now = utcnow()
    if frequency == "daily":
        return now + timedelta(days=1)
    if frequency == "monthly":
        return now + timedelta(days=30)
    return now + timedelta(weeks=1)


def first(iterable: Iterable[Dict[str, Any]], predicate) -> Optional[Dict[str, Any]]:
    for item in iterable:
        if predicate(item):
            return item
    return None
