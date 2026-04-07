from __future__ import annotations

import math
from datetime import timedelta
from typing import Any, Dict, List, Optional

from pymongo.database import Database

from ..core.mongo_utils import current_round_number, new_id, next_payment_due, utcnow
from ..models.payment_proof import PaymentProof

WINNER_PAYOUT_RATIO = 0.75
SYSTEM_PAYOUT_RATIO = 0.25


class BankPaymentService:
    def __init__(self, db: Database):
        self.db = db

    def submit_payment_proof(self, user_id: str, group_id: str, amount: float, transaction_reference: str, proof_image: str) -> Dict[str, Any]:
        """Submit payment proof for bank transfer"""
        group = self.db["groups"].find_one({"_id": str(group_id)})
        if not group:
            raise ValueError("Group not found")

        if group.get("status") != "active":
            raise ValueError("Group is not active")

        expected = float(group.get("contribution_amount") or 0)
        if float(amount) != expected:
            raise ValueError(f"Contribution amount must be {expected}")

        member = next((item for item in group.get("members", []) if str(item.get("user_id")) == str(user_id)), None)
        if not member:
            raise ValueError("Only group members can contribute")

        round_number = current_round_number(group)

        # Check if payment proof already exists for this round
        existing_proof = self.db["payment_proofs"].find_one({
            "user_id": str(user_id),
            "group_id": str(group_id),
            "round_number": round_number,
            "status": {"$in": ["pending", "verified"]}
        })

        if existing_proof:
            raise ValueError("Payment proof already submitted for this round")

        now = utcnow()
        payment_proof = PaymentProof(
            user_id=str(user_id),
            group_id=str(group_id),
            round_number=round_number,
            amount=float(amount),
            transaction_reference=transaction_reference,
            proof_image=proof_image,
            status="pending"
        )

        result = self.db["payment_proofs"].insert_one(payment_proof.dict(by_alias=True))

        return {
            "payment_id": str(result.inserted_id),
            "message": "Payment proof submitted successfully. Waiting for admin verification.",
            "round_number": round_number,
            "status": "pending"
        }

    def verify_payment(self, payment_id: str, admin_id: str, status: str, admin_notes: Optional[str] = None) -> Dict[str, Any]:
        """Admin verifies or rejects payment proof"""
        payment_proof = self.db["payment_proofs"].find_one({"_id": payment_id})
        if not payment_proof:
            raise ValueError("Payment proof not found")

        if status not in ["verified", "rejected"]:
            raise ValueError("Status must be 'verified' or 'rejected'")

        now = utcnow()
        update_data = {
            "status": status,
            "verified_by": admin_id,
            "verified_at": now,
            "updated_at": now
        }

        if admin_notes:
            update_data["admin_notes"] = admin_notes

        self.db["payment_proofs"].update_one({"_id": payment_id}, {"$set": update_data})

        if status == "verified":
            # Update member contribution status
            self._update_member_contribution(payment_proof)

        return {
            "payment_id": payment_id,
            "status": status,
            "message": f"Payment {status} successfully"
        }

    def _update_member_contribution(self, payment_proof: Dict[str, Any]) -> None:
        """Update member contribution status after payment verification"""
        group = self.db["groups"].find_one({"_id": payment_proof["group_id"]})
        if not group:
            return

        user_id = payment_proof["user_id"]
        round_number = payment_proof["round_number"]
        amount = payment_proof["amount"]

        now = utcnow()
        updated_members = []
        for item in group.get("members", []):
            if str(item.get("user_id")) == user_id:
                rounds_completed = list(item.get("rounds_completed") or [])
                if round_number not in rounds_completed:
                    rounds_completed.append(round_number)

                item = {
                    **item,
                    "contribution_count": int(item.get("contribution_count") or 0) + 1,
                    "has_paid_current_round": True,
                    "rounds_completed": sorted(set(int(entry) for entry in rounds_completed)),
                    "total_contributed": float(item.get("total_contributed") or 0) + float(amount),
                    "next_payment_due": next_payment_due(group.get("frequency", "weekly")),
                }
            updated_members.append(item)

        # Check if all members have paid
        all_paid = all(bool(item.get("has_paid_current_round")) or int(item.get("contribution_count") or 0) >= round_number for item in updated_members)

        rules = dict(group.get("rules") or {})
        rules["ready_for_winner_selection"] = all_paid
        rules["current_round_fund"] = round(float(group.get("contribution_amount") or 0) * len(updated_members), 2) if all_paid else 0.0
        rules["last_contribution_received_at"] = now

        # Update round payment status
        round_payment = self.db["round_payments"].find_one({"group_id": payment_proof["group_id"], "round_number": round_number}) or {
            "_id": new_id(),
            "group_id": payment_proof["group_id"],
            "group_name": group.get("name"),
            "round_number": round_number,
            "total_collected": round(float(group.get("contribution_amount") or 0) * len(updated_members), 2),
            "winner_id": None,
            "winner_amount": 0.0,
            "system_fee": 0.0,
            "status": "pending",
            "payment_status": {"all_members_paid": False, "paid_members": [], "pending_members": []},
            "created_at": now,
            "completed_at": None,
        }

        round_payment["payment_status"] = {
            "all_members_paid": all_paid,
            "paid_members": sorted({str(item.get("user_id")) for item in updated_members if item.get("has_paid_current_round")}),
            "pending_members": [str(item.get("user_id")) for item in updated_members if not item.get("has_paid_current_round")],
        }
        round_payment["updated_at"] = now

        self.db["round_payments"].replace_one({"_id": round_payment["_id"]}, round_payment, upsert=True)

        # Update group
        self.db["groups"].update_one(
            {"_id": payment_proof["group_id"]},
            {"$set": {"members": updated_members, "rules": rules, "updated_at": now, "current_round": round_number, "total_rounds": int(group.get("total_rounds") or 0)}},
        )

    def get_pending_payments(self, group_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get pending payment proofs for admin verification"""
        query = {"status": "pending"}
        if group_id:
            query["group_id"] = group_id

        payments = list(self.db["payment_proofs"].find(query).sort("submitted_at", 1))

        # Enrich with user and group info
        for payment in payments:
            user = self.db["users"].find_one({"_id": payment["user_id"]})
            group = self.db["groups"].find_one({"_id": payment["group_id"]})

            payment["user_name"] = user.get("full_name", "Unknown") if user else "Unknown"
            payment["user_phone"] = user.get("phone_number", "") if user else ""
            payment["group_name"] = group.get("name", "Unknown") if group else "Unknown"

        return payments

    def get_user_payment_status(self, user_id: str, group_id: Optional[str] = None) -> Dict[str, Any]:
        """Get user's payment status across groups"""
        query = {"user_id": str(user_id)}
        if group_id:
            query["group_id"] = group_id

        payments = list(self.db["payment_proofs"].find(query).sort("submitted_at", -1))

        return {
            "total_submitted": len(payments),
            "verified_count": len([p for p in payments if p["status"] == "verified"]),
            "pending_count": len([p for p in payments if p["status"] == "pending"]),
            "rejected_count": len([p for p in payments if p["status"] == "rejected"]),
            "payments": payments
        }