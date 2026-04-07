from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import ensure_indexes, get_database_instance
from app.core.mongo_utils import group_member_doc, utcnow
from app.core.security import get_password_hash
from app.services.cbe_service import CommercialBankOfEthiopiaService
from app.services.wallet_service import WalletService

ADMIN_ID = "67f2a2f54286e1a6b4c8d000"
GROUP_ID = "67f2a2f54286e1a6b4c8d100"

ADMIN = {
    "_id": ADMIN_ID,
    "full_name": "Bekel Melese",
    "email": "metizomawa@gmail.com",
    "phone_number": "+251911111111",
    "password": "Admin@123456",
    "bank_account": "1000529496331",
}

MEMBERS: List[Dict[str, Any]] = [
    {
        "_id": "67f2a2f54286e1a6b4c8d001",
        "full_name": "Alemu Tadesse",
        "email": "alemu@example.com",
        "phone_number": "+251912345678",
        "password": "Member@123",
        "bank_account": "1000134567890",
    },
    {
        "_id": "67f2a2f54286e1a6b4c8d002",
        "full_name": "Beti Haile",
        "email": "beti@example.com",
        "phone_number": "+251922345679",
        "password": "Member@123",
        "bank_account": "1000234567891",
    },
    {
        "_id": "67f2a2f54286e1a6b4c8d003",
        "full_name": "Chala Desta",
        "email": "chala@example.com",
        "phone_number": "+251932345680",
        "password": "Member@123",
        "bank_account": "1000334567892",
    },
    {
        "_id": "67f2a2f54286e1a6b4c8d004",
        "full_name": "Daniel Mekonnen",
        "email": "daniel@example.com",
        "phone_number": "+251942345681",
        "password": "Member@123",
        "bank_account": "1000434567893",
    },
    {
        "_id": "67f2a2f54286e1a6b4c8d005",
        "full_name": "Eden Tesfaye",
        "email": "eden@example.com",
        "phone_number": "+251952345682",
        "password": "Member@123",
        "bank_account": "1000534567894",
    },
]


def _base_user_doc(user: Dict[str, Any], *, role: str, is_admin: bool, is_participant: bool, opening_balance: float) -> Dict[str, Any]:
    now = utcnow()
    return {
        "_id": user["_id"],
        "full_name": user["full_name"],
        "email": user["email"].lower(),
        "phone_number": user["phone_number"],
        "hashed_password": get_password_hash(user["password"]),
        "role": role,
        "is_admin": is_admin,
        "is_participant": is_participant,
        "status": "active",
        "kyc_status": "verified",
        "credit_score": 850 if is_admin else 700,
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
        "bank_account": {
            "bank_name": "Commercial Bank of Ethiopia",
            "bank_code": "CBE",
            "account_number": user["bank_account"],
            "account_name": user["full_name"].upper(),
            "verified": True,
            "verified_at": now,
            "verified_by_bank": True,
        },
        "wallet": {
            "balance": opening_balance,
            "currency": "ETB",
            "total_deposited": opening_balance,
            "total_withdrawn": 0.0,
            "total_winnings": 0.0,
        },
        "created_at": now,
        "updated_at": now,
    }


def main() -> None:
    db = get_database_instance()
    ensure_indexes(db)

    print("Cleaning existing DigiEqub production seed data...")
    for collection_name in [
        "users",
        "groups",
        "wallets",
        "wallet_transactions",
        "winner_records",
        "payment_verifications",
        "round_payments",
        "system_wallets",
        "system_wallet_transactions",
        "cbe_accounts",
    ]:
        db[collection_name].delete_many({})

    admin_doc = _base_user_doc(ADMIN, role="super_admin", is_admin=True, is_participant=False, opening_balance=0.0)
    db["users"].insert_one(admin_doc)

    member_docs: List[Dict[str, Any]] = []
    for member in MEMBERS:
        doc = _base_user_doc(member, role="user", is_admin=False, is_participant=True, opening_balance=5000.0)
        member_docs.append(doc)
        db["users"].insert_one(doc)

    bank_service = CommercialBankOfEthiopiaService(db)
    bank_service._create_or_update_account(
        ADMIN["bank_account"],
        ADMIN["full_name"].upper(),
        CommercialBankOfEthiopiaService.BANK_NAME,
        initial_balance=1_000_000.0,
    )
    for member in MEMBERS:
        bank_service._create_or_update_account(
            member["bank_account"],
            member["full_name"].upper(),
            CommercialBankOfEthiopiaService.BANK_NAME,
            initial_balance=100_000.0,
        )

    wallet_service = WalletService(db)
    for member in member_docs:
        wallet = wallet_service.ensure_wallet_for_user(member["_id"])
        db["wallets"].update_one(
            {"_id": wallet["_id"]},
            {
                "$set": {
                    "balance": 5000.0,
                    "currency": "ETB",
                    "total_deposits": 5000.0,
                    "total_withdrawals": 0.0,
                    "total_winnings": 0.0,
                    "total_equb_paid": 0.0,
                    "pending_deposits": 0.0,
                    "pending_withdrawals": 0.0,
                    "total_transactions": 0,
                    "last_transaction_at": None,
                    "updated_at": utcnow(),
                }
            },
        )

    members = []
    for index, member in enumerate(member_docs, start=1):
        member_entry = group_member_doc(member, index)
        member_entry.update(
            {
                "role": "member",
                "bank_account": member["bank_account"],
                "has_won_this_cycle": False,
                "payment_history": [],
            }
        )
        members.append(member_entry)

    now = utcnow()
    db["groups"].insert_one(
        {
            "_id": GROUP_ID,
            "name": "Family Wealth Builders",
            "description": "A real Equb group for family wealth building",
            "contribution_amount": 1000.0,
            "frequency": "weekly",
            "duration_weeks": 12,
            "total_rounds": 12,
            "current_round": 1,
            "max_members": 5,
            "current_members": 5,
            "status": "active",
            "privacy": "private",
            "is_private": True,
            "join_code": "FAM2024",
            "created_by": ADMIN_ID,
            "created_by_name": ADMIN["full_name"],
            "admin_bank_account": {
                "bank_name": "Commercial Bank of Ethiopia",
                "bank_code": "CBE",
                "account_number": ADMIN["bank_account"],
                "account_name": ADMIN["full_name"].upper(),
            },
            "members": members,
            "winners": [],
            "round_status": {},
            "rules": {
                "winner_selection_method": "random",
                "winner_payout_ratio": 0.75,
                "system_fee_ratio": 0.25,
                "ready_for_winner_selection": False,
                "current_round_fund": 0.0,
                "winner_history": [],
            },
            "created_at": now,
            "updated_at": now,
        }
    )

    print("")
    print("SETUP COMPLETE")
    print("=========================================")
    print(f"Admin: {ADMIN['full_name']}")
    print(f"  Email: {ADMIN['email']}")
    print(f"  Password: {ADMIN['password']}")
    print(f"  CBE Account: {ADMIN['bank_account']}")
    print("")
    print("Members:")
    for member in MEMBERS:
        print(f"  - {member['full_name']} | {member['email']} | {member['bank_account']}")
    print("")
    print("Group: Family Wealth Builders")
    print("  Join Code: FAM2024")
    print("  Contribution: 1000 ETB/week")
    print("  Duration: 12 weeks")
    print("  Members: 5/5")
    print("=========================================")


if __name__ == "__main__":
    main()
