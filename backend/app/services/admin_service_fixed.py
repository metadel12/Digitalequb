from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from ..core.mongo_utils import current_round_number, current_round_total_collected, new_id, user_doc_to_response, utcnow
from ..services.cbe_service import CommercialBankOfEthiopiaService
from ..services.winner_service import WinnerService
from ..utils.email import send_email

logger = logging.getLogger(__name__)


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
            total_collected = current_round_total_collected(group)
            contribution_amount = float(group.get("contribution_amount", 0))
            
            # Calculate expected amount intelligently - expect what members actually paid
            expected_amount = 0.0
            for member in members:
                round_contribs = member.get("round_contributions") or {}
                current_round = int(group.get("current_round") or current_round_number(group))
                paid_amount = float(round_contribs.get(str(current_round), 0))
                
                if member.get("has_paid_current_round") and paid_amount > 0:
                    # For members who have paid, expect what they actually paid
                    expected_amount += paid_amount
                elif member.get("is_shortfall_member") and "shortfall_amount_due" in member and not member.get("has_paid_current_round"):
                    # For shortfall members who haven't paid yet, expect their shortfall amount only
                    expected_amount += float(member.get("shortfall_amount_due", contribution_amount))
                else:
                    # For regular members who haven't paid yet, expect full contribution
                    expected_amount += contribution_amount
            
            # Check if all paid: all members paid AND total collected equals expected amount
            all_paid = (
                total_members > 0 
                and paid_members == total_members 
                and abs(total_collected - expected_amount) < 0.01  # Allow small floating point differences
            )
            
            result.append(
                {
                    "group_id": str(group["_id"]),
                    "group_name": group.get("name", "Unnamed Group"),
                    "contribution_amount": contribution_amount,
                    "current_round": int(group.get("current_round") or current_round_number(group)),
                    "total_rounds": int(group.get("total_rounds") or 0),
                    "total_members": total_members,
                    "paid_members": paid_members,
                    "pending_members": max(total_members - paid_members, 0),
                    "all_paid": all_paid,
                    "total_collected": total_collected,
                    "expected_amount": expected_amount,
                    "winner_amount": round(total_collected * 0.90, 2),
                    "platform_fee": round(total_collected * 0.10, 2),
                    "admin_bank": self.ADMIN_CBE_ACCOUNT,
                }
            )
        return result

    def get_groups_ready_for_winner(self) -> Dict[str, Any]:
        return {"success": True, "groups": WinnerService(self.db).get_groups_ready_for_winner()}

    def select_random_winner(self, group_id: str, admin_id: str) -> Dict[str, Any]:
        service = WinnerService(self.db)
        result = service.select_weekly_winner(group_id, "random")
        result["selected_by_admin"] = admin_id
        return result

    def get_pending_payments(self, group_id: Optional[str] = None) -> List[Dict[str, Any]]:
        payment_verification_query: Dict[str, Any] = {"status": "pending"}
        if group_id:
            payment_verification_query["group_id"] = group_id

        payments = list(self.db["payment_verifications"].find(payment_verification_query).sort("submitted_at", -1))
        result: List[Dict[str, Any]] = []
        for payment in payments:
            member = self.db["users"].find_one({"_id": payment.get("member_id")}) or {}
            group = self.db["groups"].find_one({"_id": payment.get("group_id")}) or {}
            member_name = payment.get("member_name") or member.get("full_name") or member.get("email") or "Unknown"
            member_email = payment.get("member_email") or member.get("email") or None
            proof_image = payment.get("proof_image") or ""
            result.append(
                {
                    "payment_id": str(payment["_id"]),
                    "group_id": str(payment.get("group_id")),
                    "group_name": group.get("name", "Unknown"),
                    "member_id": str(payment.get("member_id")),
                    "member_name": member_name,
                    "member_email": member_email,
                    "member_account": (member.get("bank_account") or {}).get("account_number"),
                    "amount": float(payment.get("amount") or 0),
                    "round_number": int(payment.get("round_number") or 1),
                    "transaction_reference": payment.get("transaction_reference"),
                    "proof_image": proof_image,
                    "receipt_number": payment.get("receipt_number") or payment.get("transaction_reference"),
                    "receipt_status": proof_image and "Uploaded" or "Missing",
                    "requires_receipt": not bool(proof_image),
                    "payment_source": "bank",
                    "payment_type": payment.get("payment_method") or payment.get("payment_type") or "bank",
                    "status": payment.get("status"),
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
                    f"members.$.round_contributions.{payment.get('round_number', 1)}": float(payment.get("amount") or 0),
                    "updated_at": now,
                },
                "$inc": {"members.$.total_contributed": float(payment.get("amount") or 0)},
            },
        )
        return {"success": True, "message": f"Payment verified"}

    def _create_user_notification(self, user_id: str, title: str, message: str, notification_type: str) -> None:
        self.db["notifications"].insert_one(
            {
                "_id": f"notif-{user_id}-{utcnow().timestamp()}",
                "user_id": str(user_id),
                "title": title,
                "message": message,
                "type": notification_type,
                "read": False,
                "delivered": True,
                "created_at": utcnow(),
                "updated_at": utcnow(),
            }
        )

    def _insert_user_action_log(
        self,
        user_id: str,
        user_name: Optional[str],
        action: str,
        admin_id: str,
        reason: Optional[str],
    ) -> None:
        admin = self.db["users"].find_one({"_id": str(admin_id)}) or {}
        self.db["user_approval_logs"].insert_one(
            {
                "_id": f"user-log-{utcnow().timestamp()}-{user_id}",
                "user_id": str(user_id),
                "user_name": user_name or "Unknown User",
                "action": action,
                "performed_by": str(admin_id),
                "performed_by_name": admin.get("full_name", self.ADMIN_NAME),
                "reason": reason,
                "created_at": utcnow(),
            }
        )