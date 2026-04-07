from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..core.mongo_utils import current_round_number, utcnow
from .cbe_service import CommercialBankOfEthiopiaService
from .winner_service import WinnerService


class AdminService:
    """Single-admin management service for Bekel Melese."""

    ADMIN_EMAIL = CommercialBankOfEthiopiaService.ADMIN_ACCOUNT["email"]
    ADMIN_NAME = "Bekel Melese"
    ADMIN_CBE_ACCOUNT = CommercialBankOfEthiopiaService.ADMIN_ACCOUNT["account_number"]

    def __init__(self, db):
        self.db = db

    def is_admin(self, user_email: str) -> bool:
        return str(user_email or "").strip().lower() == self.ADMIN_EMAIL.lower()

    def get_admin_profile(self) -> Dict[str, Any]:
        return {
            "success": True,
            "admin": {
                "name": self.ADMIN_NAME,
                "email": self.ADMIN_EMAIL,
                "bank_account": self.ADMIN_CBE_ACCOUNT,
                "bank_name": CommercialBankOfEthiopiaService.BANK_NAME,
                "role": "super_admin",
            },
        }

    def get_all_groups(self) -> List[Dict[str, Any]]:
        groups = list(self.db["groups"].find({"status": "active"}).sort("created_at", -1))
        result: List[Dict[str, Any]] = []
        for group in groups:
            members = list(group.get("members") or [])
            total_members = len(members)
            paid_members = len([m for m in members if m.get("has_paid_current_round", False)])
            total_collected = round(float(group.get("contribution_amount", 0)) * total_members, 2)
            result.append(
                {
                    "group_id": str(group["_id"]),
                    "group_name": group.get("name", "Unnamed Group"),
                    "contribution_amount": float(group.get("contribution_amount", 0)),
                    "current_round": int(group.get("current_round") or current_round_number(group)),
                    "total_rounds": int(group.get("total_rounds") or 0),
                    "total_members": total_members,
                    "paid_members": paid_members,
                    "pending_members": max(total_members - paid_members, 0),
                    "all_paid": total_members > 0 and paid_members == total_members,
                    "total_collected": total_collected,
                    "winner_amount": round(total_collected * 0.75, 2),
                    "platform_fee": round(total_collected * 0.25, 2),
                    "admin_bank": self.ADMIN_CBE_ACCOUNT,
                }
            )
        return result

    def get_pending_payments(self, group_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query: Dict[str, Any] = {"status": "pending"}
        if group_id:
            query["group_id"] = group_id

        payments = list(self.db["payment_verifications"].find(query).sort("submitted_at", -1))
        result: List[Dict[str, Any]] = []
        for payment in payments:
            member = self.db["users"].find_one({"_id": payment.get("member_id")}) or {}
            group = self.db["groups"].find_one({"_id": payment.get("group_id")}) or {}
            result.append(
                {
                    "payment_id": str(payment["_id"]),
                    "group_id": str(payment.get("group_id")),
                    "group_name": group.get("name", "Unknown"),
                    "member_id": str(payment.get("member_id")),
                    "member_name": payment.get("member_name") or member.get("full_name", "Unknown"),
                    "member_account": (member.get("bank_account") or {}).get("account_number"),
                    "amount": float(payment.get("amount") or 0),
                    "round_number": int(payment.get("round_number") or 1),
                    "transaction_reference": payment.get("transaction_reference"),
                    "proof_image": payment.get("proof_image"),
                    "submitted_at": payment.get("submitted_at"),
                }
            )
        return result

    def verify_payment(self, payment_id: str, admin_id: str) -> Dict[str, Any]:
        payment = self.db["payment_verifications"].find_one({"_id": payment_id})
        if not payment:
            return {"success": False, "error": "Payment not found"}
        if payment.get("status") != "pending":
            return {"success": False, "error": "Payment already processed"}

        now = utcnow()
        self.db["payment_verifications"].update_one(
            {"_id": payment_id},
            {
                "$set": {
                    "status": "verified",
                    "verified": True,
                    "verified_by_admin": admin_id,
                    "verified_at": now,
                    "updated_at": now,
                }
            },
        )
        self.db["groups"].update_one(
            {"_id": payment["group_id"], "members.user_id": payment["member_id"]},
            {
                "$set": {
                    "members.$.has_paid_current_round": True,
                    "members.$.payment_verified_at": now,
                    "updated_at": now,
                },
                "$inc": {"members.$.total_contributed": float(payment.get("amount") or 0)},
            },
        )
        return {"success": True, "message": f"Payment verified for {payment.get('member_name', 'member')}"}

    def select_random_winner(self, group_id: str, admin_id: str) -> Dict[str, Any]:
        service = WinnerService(self.db)
        result = service.select_weekly_winner(group_id, "random")
        result["selected_by_admin"] = admin_id
        return result
