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
            contribution_amount = float(group.get("contribution_amount", 0))
            
            # Get current round number first
            current_round = int(group.get("current_round") or current_round_number(group))
            
            # Now get total collected for the current round
            total_collected = current_round_total_collected(group, current_round)
            
            # Calculate round 1's total - this becomes the baseline expected amount
            # For all future rounds, this amount is fixed (not recalculated)
            round1_total = 0.0
            for member in members:
                round_contribs = member.get("round_contributions") or {}
                round1_total += float(round_contribs.get("1", 0))
            
            # Determine expected amount:
            # - For round 1: sum of actual contributions from ORIGINAL members
            #               + shortfall amounts from SHORTFALL members
            # - For round 2+: use round 1's total as fixed baseline
            if current_round == 1:
                # Round 1: calculate from actual payments
                expected_amount = 0.0
                for member in members:
                    round_contribs = member.get("round_contributions") or {}
                    paid_amount = float(round_contribs.get("1", 0))
                    
                    if member.get("is_shortfall_member"):
                        # For shortfall members, always use their shortfall_amount_due
                        expected_amount += float(member.get("shortfall_amount_due", 0))
                    elif paid_amount > 0:
                        # For original members who paid, use actual payment
                        expected_amount += paid_amount
                    else:
                        # For original members who haven't paid, use contribution_amount
                        expected_amount += contribution_amount
            else:
                # Round 2+: use round 1's total as fixed expected
                expected_amount = round1_total if round1_total > 0 else total_members * contribution_amount

            # Check if all paid: all members paid AND total collected equals expected amount
            # Count members who actually paid in the current round
            paid_members_in_round = len([m for m in members 
                if float(m.get("round_contributions", {}).get(str(current_round), 0)) > 0])
            
            all_paid = (
                total_members > 0 
                and paid_members_in_round == total_members 
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
                    "paid_members": paid_members_in_round,
                    "pending_members": max(total_members - paid_members_in_round, 0),
                    "all_paid": all_paid,
                    "total_collected": total_collected,
                    "expected_amount": expected_amount,
                    "winner_amount": round(total_collected * 0.90, 2),
                    "platform_fee": round(total_collected * 0.10, 2),
                    "admin_bank": self.ADMIN_CBE_ACCOUNT,
                }
            )
        return result

    def get_group_members_status(self, group_id: str) -> Dict[str, Any]:
        """Get detailed member status for a specific group."""
        group = self.db["groups"].find_one({"_id": group_id})
        if not group:
            raise ValueError("Group not found")
        
        members = group.get("members", [])
        current_round = int(group.get("current_round") or current_round_number(group))
        contribution_amount = float(group.get("contribution_amount", 0))
        
        member_details = []
        for member in members:
            round_contribs = member.get("round_contributions", {})
            paid_amount = float(round_contribs.get(str(current_round), 0))
            
            # For shortfall members, expected amount is their shortfall_amount_due
            # For regular members, expected amount is the contribution_amount
            expected_amt = float(member.get("shortfall_amount_due", 0)) if member.get("is_shortfall_member") else contribution_amount
            
            member_details.append({
                "user_id": member.get("user_id"),
                "full_name": member.get("full_name", "Unknown"),
                "email": member.get("email", ""),
                "has_paid_current_round": member.get("has_paid_current_round", False),
                "paid_amount": paid_amount,
                "expected_amount": expected_amt,
                "is_shortfall_member": member.get("is_shortfall_member", False),
                "shortfall_amount_due": member.get("shortfall_amount_due"),
                "position": member.get("position", 0),
                "total_contributed": member.get("total_contributed", 0.0),
            })
        
        return {
            "success": True,
            "group_id": group_id,
            "group_name": group.get("name", "Unnamed Group"),
            "current_round": current_round,
            "contribution_amount": contribution_amount,
            "members": member_details,
        }

    def get_groups_ready_for_winner(self) -> Dict[str, Any]:
        return {"success": True, "groups": WinnerService(self.db).get_groups_ready_for_winner()}

    def get_winner_announcements(self, group_id: str) -> Dict[str, Any]:
        """Get winner announcements for a group."""
        announcements = list(
            self.db["winner_announcements"]
            .find({"group_id": group_id})
            .sort("created_at", -1)
        )
        return {
            "success": True,
            "group_id": group_id,
            "announcements": announcements,
        }

    def select_random_winner(self, group_id: str, admin_id: str) -> Dict[str, Any]:
        service = WinnerService(self.db)
        result = service.select_weekly_winner(group_id, "random")
        result["selected_by_admin"] = admin_id
        return result

    def add_member_for_shortfall(
        self,
        group_id: str,
        member_email: str,
        shortfall_amount: float,
        admin_id: str,
    ) -> Dict[str, Any]:
        """Add a new member to cover a shortfall without marking them as paid.

        The new member is added with `has_paid_current_round=False` and
        `shortfall_amount_due` set. No payment record is created; the member
        must submit payment proof which admin will verify as usual.
        """
        group = self.db["groups"].find_one({"_id": group_id})
        if not group:
            raise ValueError("Group not found")

        # Find or create user by email
        user = self.db["users"].find_one({"email": member_email})
        if not user:
            user = {
                "_id": new_id(),
                "email": member_email,
                "full_name": (member_email.split("@")[0] if member_email else "Unknown"),
                "created_at": utcnow(),
            }
            try:
                self.db["users"].insert_one(user)
            except Exception:
                # In case of race or duplicate, try to read again
                user = self.db["users"].find_one({"email": member_email}) or user

        members = list(group.get("members") or [])
        # Prevent duplicate membership by email
        for m in members:
            if str(m.get("email") or "").lower() == str(member_email or "").lower():
                return {"success": False, "error": "Member already in group"}

        current_round = int(group.get("current_round") or current_round_number(group))
        actual_shortfall = float(shortfall_amount or 0.0)

        new_member = {
            "user_id": user.get("_id"),
            "full_name": user.get("full_name", "Unknown"),
            "email": user.get("email", ""),
            "phone": user.get("phone_number", ""),
            "joined_at": utcnow(),
            "has_paid_current_round": False,
            "payment_verified_at": None,
            "total_contributed": 0.0,
            "round_contributions": {},
            "is_shortfall_member": True,
            "shortfall_round": current_round,
            "shortfall_amount_due": actual_shortfall,
            "position": len(members) + 1,
        }

        self.db["groups"].update_one(
            {"_id": group_id},
            {"$push": {"members": new_member}, "$set": {"updated_at": utcnow()}},
        )

        # Notify the user
        try:
            title = f"Added to Group - Shortfall Coverage"
            message = (
                f"You've been added to {group.get('name','a group')} to cover a shortfall of {actual_shortfall:.2f} ETB "
                f"for Round {current_round}. Please submit your payment of {actual_shortfall:.2f} ETB to complete the round. Welcome!"
            )
            self._create_user_notification(user.get("_id"), title, message, "shortfall")
        except Exception:
            logger.exception("Failed to create shortfall notification")

        return {
            "success": True,
            "message": f"Successfully added {user.get('full_name')} to the group. They need to pay {actual_shortfall:.2f} ETB to cover the shortfall.",
            "shortfall_amount_due": actual_shortfall,
            "payment_status": "pending",
        }

    def get_pending_payments(self, group_id: Optional[str] = None) -> List[Dict[str, Any]]:
        # Get bank transfer payments
        bank_payment_query: Dict[str, Any] = {"status": "pending"}
        if group_id:
            bank_payment_query["group_id"] = group_id

        bank_payments = list(self.db["payment_verifications"].find(bank_payment_query).sort("submitted_at", -1))
        
        # Get wallet payments
        wallet_payment_query: Dict[str, Any] = {
            "status": "pending",
            "wallet_pending": True
        }
        if group_id:
            wallet_payment_query["group_id"] = group_id
            
        wallet_payments = list(self.db["wallet_payments"].find(wallet_payment_query).sort("created_at", -1))
        
        result: List[Dict[str, Any]] = []
        
        # Process bank transfer payments
        for payment in bank_payments:
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
            
        # Process wallet payments
        for payment in wallet_payments:
            member = self.db["users"].find_one({"_id": payment.get("user_id")}) or {}
            group = self.db["groups"].find_one({"_id": payment.get("group_id")}) or {}
            member_name = payment.get("user_name") or member.get("full_name") or member.get("email") or "Unknown"
            member_email = member.get("email") or None
            result.append(
                {
                    "payment_id": str(payment["_id"]),
                    "group_id": str(payment.get("group_id")),
                    "group_name": group.get("name", "Unknown"),
                    "member_id": str(payment.get("user_id")),
                    "member_name": member_name,
                    "member_email": member_email,
                    "member_account": "DigiEqub Wallet",
                    "amount": float(payment.get("amount") or 0),
                    "round_number": int(payment.get("round_number") or 1),
                    "transaction_reference": payment.get("receipt_number"),
                    "proof_image": "",
                    "receipt_number": payment.get("receipt_number"),
                    "receipt_status": "Auto-Generated",
                    "requires_receipt": False,
                    "payment_source": "wallet",
                    "payment_type": "wallet",
                    "status": payment.get("status"),
                    "submitted_at": payment.get("created_at"),
                }
            )
            
        # Sort by submission time (newest first)
        result.sort(key=lambda x: x.get("submitted_at") or utcnow(), reverse=True)
        return result

    def verify_payment(self, payment_id: str, admin_id: str) -> Dict[str, Any]:
        # Try to find payment in bank transfers first
        payment = self.db["payment_verifications"].find_one({"_id": payment_id})
        payment_source = "bank"
        
        # If not found, try wallet payments
        if not payment:
            payment = self.db["wallet_payments"].find_one({"_id": payment_id})
            payment_source = "wallet"
            
        if not payment:
            return {"success": False, "error": "Payment not found"}
            
        if payment.get("status") != "pending":
            return {"success": False, "error": "Payment already processed"}

        now = utcnow()
        
        if payment_source == "bank":
            # Handle bank transfer verification
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
            
        else:
            # Handle wallet payment verification (approve and debit wallet)
            # Approve receipt
            try:
                from ..services.receipt_service import ReceiptService
                receipt_service = ReceiptService(self.db)
                receipt_service.approve_receipt(payment["receipt_id"], admin_id)
            except Exception as e:
                logger.warning(f"Failed to approve receipt: {str(e)}")
            
            # Debit wallet
            wallet_update = self.db["wallets"].update_one(
                {"user_id": payment["user_id"]},
                {
                    "$inc": {"balance": -payment["amount"]},
                    "$set": {"updated_at": now}
                }
            )
            
            if wallet_update.matched_count == 0:
                return {"success": False, "error": "User wallet not found"}
            
            # Update wallet payment status
            self.db["wallet_payments"].update_one(
                {"_id": payment_id},
                {
                    "$set": {
                        "status": "completed",
                        "approved_by": admin_id,
                        "approved_at": now,
                        "updated_at": now,
                        "wallet_pending": False
                    }
                }
            )
            
            # Update group member status
            self.db["groups"].update_one(
                {"_id": payment["group_id"], "members.user_id": payment["user_id"]},
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
            
        return {"success": True, "message": f"Payment verified", "payment_source": payment_source}

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