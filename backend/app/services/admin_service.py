from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from ..core.mongo_utils import current_round_number, user_doc_to_response, utcnow
from .cbe_service import CommercialBankOfEthiopiaService
from .winner_service import WinnerService

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

    def get_pending_users(self, limit: int = 50, skip: int = 0) -> Dict[str, Any]:
        query = {
            "$and": [
                {"status": {"$in": ["pending", "PENDING"]}},
                {
                    "$or": [
                        {"approval_status": {"$exists": False}},
                        {"approval_status": {"$in": ["pending", "PENDING", None]}},
                    ]
                },
            ]
        }
        users = list(self.db["users"].find(query).sort("created_at", -1).skip(skip).limit(limit))
        return {
            "success": True,
            "users": [self._serialize_admin_user(user) for user in users],
            "total": self.db["users"].count_documents(query),
            "limit": limit,
            "skip": skip,
        }

    def get_all_users(self, limit: int = 50, skip: int = 0, status: Optional[str] = None) -> Dict[str, Any]:
        query: Dict[str, Any] = {}
        if status and status != "all":
            query["status"] = {"$in": [status, status.upper()]}
        users = list(self.db["users"].find(query).sort("created_at", -1).skip(skip).limit(limit))
        return {
            "success": True,
            "users": [self._serialize_admin_user(user) for user in users],
            "total": self.db["users"].count_documents(query),
            "limit": limit,
            "skip": skip,
        }

    def approve_user(self, admin_id: str, user_id: str, reason: Optional[str] = None) -> Dict[str, Any]:
        user = self.db["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        status = str(user.get("status") or "").lower()
        if status not in {"pending", "rejected", "blocked"}:
            return {"success": False, "error": f"User status is {user.get('status')}, cannot approve"}

        now = utcnow()
        self.db["users"].update_one(
            {"_id": str(user_id)},
            {
                "$set": {
                    "status": "active",
                    "approval_status": "approved",
                    "approved_by": str(admin_id),
                    "approved_at": now,
                    "updated_at": now,
                },
                "$unset": {
                    "rejected_by": "",
                    "rejected_at": "",
                    "rejection_reason": "",
                    "blocked_by": "",
                    "blocked_at": "",
                    "blocked_reason": "",
                },
            },
        )
        self._insert_user_action_log(user_id, user.get("full_name"), "approved", admin_id, reason)
        self._create_user_notification(
            str(user_id),
            "Account Approved",
            "Your DigiEqub account has been approved. You can now join groups and start saving.",
            "account_approval",
        )
        logger.info("Approved user %s", user.get("email"))
        return {
            "success": True,
            "message": f"User {user.get('full_name', 'User')} approved successfully",
            "user": self._serialize_admin_user(self.db["users"].find_one({"_id": str(user_id)}) or user),
        }

    def reject_user(self, admin_id: str, user_id: str, reason: str) -> Dict[str, Any]:
        user = self.db["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        if str(user.get("status") or "").lower() != "pending":
            return {"success": False, "error": f"User status is {user.get('status')}, cannot reject"}

        now = utcnow()
        self.db["users"].update_one(
            {"_id": str(user_id)},
            {
                "$set": {
                    "status": "rejected",
                    "approval_status": "rejected",
                    "rejected_by": str(admin_id),
                    "rejected_at": now,
                    "rejection_reason": reason,
                    "updated_at": now,
                }
            },
        )
        self._insert_user_action_log(user_id, user.get("full_name"), "rejected", admin_id, reason)
        self._create_user_notification(
            str(user_id),
            "Registration Rejected",
            f"Your registration was rejected. Reason: {reason}",
            "account_rejection",
        )
        return {
            "success": True,
            "message": f"User {user.get('full_name', 'User')} rejected",
            "user": self._serialize_admin_user(self.db["users"].find_one({"_id": str(user_id)}) or user),
        }

    def delete_user(self, admin_id: str, user_id: str, reason: Optional[str] = None) -> Dict[str, Any]:
        user = self.db["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        if self.is_admin(user.get("email", "")):
            return {"success": False, "error": "Cannot delete the main admin account"}

        now = utcnow()
        self.db["users"].update_one(
            {"_id": str(user_id)},
            {
                "$set": {
                    "status": "deleted",
                    "approval_status": "deleted",
                    "deleted_by": str(admin_id),
                    "deleted_at": now,
                    "deletion_reason": reason,
                    "updated_at": now,
                }
            },
        )
        self.db["groups"].update_many({"members.user_id": str(user_id)}, {"$pull": {"members": {"user_id": str(user_id)}}})
        self._insert_user_action_log(user_id, user.get("full_name"), "deleted", admin_id, reason)
        return {
            "success": True,
            "message": f"User {user.get('full_name', 'User')} deleted successfully",
            "user": self._serialize_admin_user(self.db["users"].find_one({"_id": str(user_id)}) or user),
        }

    def block_user(self, admin_id: str, user_id: str, reason: str) -> Dict[str, Any]:
        user = self.db["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        if self.is_admin(user.get("email", "")):
            return {"success": False, "error": "Cannot block the main admin account"}
        now = utcnow()
        self.db["users"].update_one(
            {"_id": str(user_id)},
            {
                "$set": {
                    "status": "blocked",
                    "blocked_by": str(admin_id),
                    "blocked_at": now,
                    "blocked_reason": reason,
                    "updated_at": now,
                }
            },
        )
        self._insert_user_action_log(user_id, user.get("full_name"), "blocked", admin_id, reason)
        self._create_user_notification(
            str(user_id),
            "Account Blocked",
            f"Your DigiEqub account was blocked. Reason: {reason}",
            "account_blocked",
        )
        return {
            "success": True,
            "message": f"User {user.get('full_name', 'User')} blocked successfully",
            "user": self._serialize_admin_user(self.db["users"].find_one({"_id": str(user_id)}) or user),
        }

    def unblock_user(self, admin_id: str, user_id: str) -> Dict[str, Any]:
        user = self.db["users"].find_one({"_id": str(user_id)})
        if not user:
            return {"success": False, "error": "User not found"}
        now = utcnow()
        self.db["users"].update_one(
            {"_id": str(user_id)},
            {
                "$set": {
                    "status": "active",
                    "approval_status": "approved",
                    "unblocked_by": str(admin_id),
                    "unblocked_at": now,
                    "updated_at": now,
                },
                "$unset": {"blocked_by": "", "blocked_at": "", "blocked_reason": ""},
            },
        )
        self._insert_user_action_log(user_id, user.get("full_name"), "unblocked", admin_id, None)
        self._create_user_notification(
            str(user_id),
            "Account Unblocked",
            "Your DigiEqub account has been restored and is now active again.",
            "account_unblocked",
        )
        return {
            "success": True,
            "message": f"User {user.get('full_name', 'User')} unblocked successfully",
            "user": self._serialize_admin_user(self.db["users"].find_one({"_id": str(user_id)}) or user),
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

    def get_groups_ready_for_winner(self) -> Dict[str, Any]:
        return {"success": True, "groups": WinnerService(self.db).get_groups_ready_for_winner()}

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

    def get_transaction_history(
        self,
        transaction_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 200,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        query: Dict[str, Any] = {"type": {"$in": ["deposit", "withdrawal", "equb_payment"]}}
        if transaction_type and transaction_type != "all":
            query["type"] = transaction_type
        if status and status != "all":
            query["status"] = status

        transactions = list(
            self.db["wallet_transactions"]
            .find(query)
            .sort("created_at", -1)
            .skip(max(skip, 0))
            .limit(min(max(limit, 1), 500))
        )

        wallet_ids = list({item.get("wallet_id") for item in transactions if item.get("wallet_id")})
        wallets = {
            wallet["_id"]: wallet
            for wallet in self.db["wallets"].find({"_id": {"$in": wallet_ids}})
        } if wallet_ids else {}

        user_ids = list({wallet.get("user_id") for wallet in wallets.values() if wallet.get("user_id")})
        users = {
            user["_id"]: user
            for user in self.db["users"].find({"_id": {"$in": user_ids}})
        } if user_ids else {}

        group_ids = list({str(item.get("group_id")) for item in transactions if item.get("group_id")})
        groups = {
            group["_id"]: group
            for group in self.db["groups"].find({"_id": {"$in": group_ids}})
        } if group_ids else {}

        return [
            self._serialize_transaction(item, wallets, users, groups)
            for item in transactions
        ]

    def get_transaction_stats(self) -> Dict[str, Any]:
        query = {"type": {"$in": ["deposit", "withdrawal", "equb_payment"]}}
        transactions = list(self.db["wallet_transactions"].find(query))

        def _amount_for(tx_type: str) -> float:
            return abs(sum(float(item.get("amount") or 0) for item in transactions if item.get("type") == tx_type))

        completed = [item for item in transactions if item.get("status") == "completed"]
        return {
            "totalVolume": sum(abs(float(item.get("amount") or 0)) for item in transactions),
            "totalCount": len(transactions),
            "depositTotal": _amount_for("deposit"),
            "withdrawalTotal": _amount_for("withdrawal"),
            "equbPaidTotal": _amount_for("equb_payment"),
            "pending": len([item for item in transactions if item.get("status") in {"pending", "processing", "approved"}]),
            "successRate": round((len(completed) / len(transactions)) * 100, 1) if transactions else 0,
        }

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

    def get_group_members_status(self, group_id: str) -> Dict[str, Any]:
        return WinnerService(self.db).get_group_members_status(group_id)

    def get_winner_announcements(self, group_id: str, limit: int = 100) -> Dict[str, Any]:
        announcements = list(
            self.db["winner_announcements"]
            .find({"group_id": str(group_id)})
            .sort("sent_at", -1)
            .limit(limit)
        )
        return {"success": True, "announcements": [self._normalize_doc(item) for item in announcements]}

    def get_user_action_logs(self, limit: int = 100) -> Dict[str, Any]:
        items = list(self.db["user_approval_logs"].find({}).sort("created_at", -1).limit(limit))
        return {"success": True, "logs": [self._normalize_doc(item) for item in items]}

    def _serialize_admin_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        data = user_doc_to_response(user)
        data["_id"] = user["_id"]
        data["approval_status"] = str(user.get("approval_status") or ("approved" if data["status"] == "active" else data["status"])).lower()
        data["approved_at"] = user.get("approved_at")
        data["approved_by"] = user.get("approved_by")
        data["rejected_at"] = user.get("rejected_at")
        data["rejected_by"] = user.get("rejected_by")
        data["rejection_reason"] = user.get("rejection_reason")
        data["deleted_at"] = user.get("deleted_at")
        data["deleted_by"] = user.get("deleted_by")
        data["blocked_at"] = user.get("blocked_at")
        data["blocked_by"] = user.get("blocked_by")
        data["blocked_reason"] = user.get("blocked_reason")
        data["wallet"] = user.get("wallet") or {}
        data["registration_files"] = user.get("registration_files") or {}
        registration_files = data["registration_files"]
        data["registration_file_count"] = int(bool(registration_files.get("property_file"))) + len(registration_files.get("wealth_files") or [])
        return data

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

    def _normalize_doc(self, item: Dict[str, Any]) -> Dict[str, Any]:
        normalized = dict(item)
        for key, value in list(normalized.items()):
            if hasattr(value, "isoformat"):
                normalized[key] = value
        return normalized

    def _serialize_transaction(
        self,
        item: Dict[str, Any],
        wallets: Dict[str, Dict[str, Any]],
        users: Dict[str, Dict[str, Any]],
        groups: Dict[str, Dict[str, Any]],
    ) -> Dict[str, Any]:
        wallet = wallets.get(item.get("wallet_id")) or {}
        user = users.get(wallet.get("user_id")) or {}
        metadata = item.get("transaction_metadata") or {}
        group_id = str(item.get("group_id") or metadata.get("group_id") or "")
        group = groups.get(group_id) or {}
        return {
            "id": str(item.get("_id")),
            "wallet_id": str(item.get("wallet_id") or ""),
            "reference": item.get("reference"),
            "type": item.get("type"),
            "amount": abs(float(item.get("amount") or 0)),
            "signed_amount": float(item.get("amount") or 0),
            "fee": float(item.get("fee") or 0),
            "net_amount": float(item.get("net_amount") or 0),
            "payment_method": item.get("payment_method") or "wallet",
            "description": item.get("description"),
            "status": item.get("status", "pending"),
            "balance_before": float(item.get("balance_before") or 0),
            "balance_after": float(item.get("balance_after") or 0),
            "transaction_hash": item.get("transaction_hash"),
            "blockchain_tx_hash": item.get("blockchain_tx_hash"),
            "created_at": item.get("created_at"),
            "updated_at": item.get("updated_at"),
            "completed_at": item.get("completed_at"),
            "metadata": metadata,
            "user": {
                "id": str(user.get("_id") or wallet.get("user_id") or ""),
                "full_name": user.get("full_name", "Unknown User"),
                "email": user.get("email", ""),
                "phone_number": user.get("phone_number", ""),
                "bank_account": user.get("bank_account") or {},
            },
            "group": {
                "id": group_id,
                "name": group.get("name") or item.get("group_name") or metadata.get("group_name") or "N/A",
                "current_members": group.get("current_members") or len(group.get("members") or []),
                "max_members": group.get("max_members") or group.get("total_members"),
            },
        }
