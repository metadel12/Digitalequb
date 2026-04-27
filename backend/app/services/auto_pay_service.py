from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from pymongo.database import Database

from ..core.mongo_utils import new_id, next_payment_due, utcnow

logger = logging.getLogger(__name__)


class AutoPayService:
    """
    Automatically pays overdue equb contributions from member wallets.
    Runs on a schedule — called from the background task loop.
    """

    def __init__(self, db: Database):
        self.db = db

    def run(self) -> dict[str, Any]:
        """
        Check all active groups for members who missed their payment due date
        and auto-pay from their wallet if they have sufficient balance.
        Returns a summary of what was processed.
        """
        now = utcnow()
        processed = 0
        failed = 0
        skipped = 0
        results = []

        active_groups = list(self.db["groups"].find({"status": "active"}))

        for group in active_groups:
            gid = str(group["_id"])
            gname = group.get("name", "Equb Group")
            amount = float(group.get("contribution_amount") or 0)
            frequency = group.get("frequency", "weekly")

            if amount <= 0:
                continue

            members = list(group.get("members") or [])

            for member in members:
                uid = str(member.get("user_id", ""))
                if not uid:
                    continue

                # Skip if already paid this round
                if member.get("has_paid_current_round"):
                    skipped += 1
                    continue

                # Check if payment is overdue
                due_date = member.get("next_payment_due")
                if due_date:
                    from ..core.mongo_utils import ensure_utc_datetime
                    due_dt = ensure_utc_datetime(due_date)
                    if due_dt and due_dt > now:
                        # Not yet overdue
                        skipped += 1
                        continue
                else:
                    # No due date set — skip (first payment not yet triggered)
                    skipped += 1
                    continue

                # Try to auto-pay from wallet
                result = self._auto_pay(uid, gid, gname, amount, frequency)
                if result["success"]:
                    processed += 1
                    results.append({
                        "user_id": uid,
                        "group_id": gid,
                        "group_name": gname,
                        "amount": amount,
                        "reference": result["reference"],
                        "status": "auto_paid",
                    })
                    logger.info("Auto-paid ETB %.0f for user %s in group %s", amount, uid, gname)
                else:
                    failed += 1
                    results.append({
                        "user_id": uid,
                        "group_id": gid,
                        "group_name": gname,
                        "amount": amount,
                        "status": "failed",
                        "reason": result.get("error"),
                    })
                    logger.warning(
                        "Auto-pay failed for user %s in group %s: %s",
                        uid, gname, result.get("error"),
                    )

        summary = {
            "run_at": now.isoformat(),
            "processed": processed,
            "failed": failed,
            "skipped": skipped,
            "results": results,
        }
        if processed or failed:
            logger.info("Auto-pay run complete: %d paid, %d failed, %d skipped", processed, failed, skipped)
        return summary

    def _auto_pay(self, user_id: str, group_id: str, group_name: str,
                  amount: float, frequency: str) -> dict[str, Any]:
        """Deduct from wallet and update group member record."""
        now = utcnow()

        # Check wallet balance
        wallet = self.db["wallets"].find_one({"user_id": user_id})
        if not wallet:
            return {"success": False, "error": "No wallet found"}

        balance = float(wallet.get("balance", 0))
        if balance < amount:
            # Insufficient balance — notify user and increment missed_payments
            self.db["groups"].update_one(
                {"_id": group_id, "members.user_id": user_id},
                {"$inc": {"members.$.missed_payments": 1}, "$set": {"updated_at": now}},
            )
            self._notify(
                user_id, group_name, amount,
                title="Auto-Pay Failed — Insufficient Balance",
                message=(
                    f"Auto-payment of ETB {amount:,.0f} for '{group_name}' failed. "
                    f"Your wallet balance (ETB {balance:,.0f}) is insufficient. "
                    f"Please top up your wallet to avoid penalties."
                ),
                ntype="warning",
            )
            return {"success": False, "error": f"Insufficient balance (ETB {balance:,.0f})"}

        # Deduct from wallet
        reference = f"AUTOPAY-{new_id().split('-')[0].upper()}"
        balance_after = balance - amount

        tx = {
            "_id": new_id(),
            "wallet_id": wallet["_id"],
            "group_id": group_id,
            "group_name": group_name,
            "type": "equb_payment",
            "amount": -amount,
            "fee": 0.0,
            "net_amount": -amount,
            "balance_before": balance,
            "balance_after": balance_after,
            "status": "completed",
            "payment_method": "wallet_auto",
            "reference": reference,
            "description": f"Auto-payment: equb contribution to {group_name}",
            "transaction_metadata": {
                "auto_pay": True,
                "group_id": group_id,
                "group_name": group_name,
            },
            "completed_at": now,
            "created_at": now,
            "updated_at": now,
        }
        self.db["wallet_transactions"].insert_one(tx)
        self.db["wallets"].update_one(
            {"_id": wallet["_id"]},
            {
                "$set": {"balance": balance_after, "last_transaction_at": now, "updated_at": now},
                "$inc": {"total_equb_paid": amount, "total_transactions": 1},
            },
        )

        # Update group member record
        next_due = next_payment_due(frequency)
        self.db["groups"].update_one(
            {"_id": group_id, "members.user_id": user_id},
            {
                "$set": {
                    "members.$.has_paid_current_round": True,
                    "members.$.next_payment_due": next_due,
                    "updated_at": now,
                },
                "$inc": {
                    "members.$.contribution_count": 1,
                    "members.$.total_contributed": amount,
                },
            },
        )

        # Save to transactions collection
        self.db["transactions"].insert_one({
            "_id": new_id(),
            "user_id": user_id,
            "sender_id": user_id,
            "group_id": group_id,
            "group_name": group_name,
            "amount": amount,
            "type": "equb_contribution_auto",
            "status": "completed",
            "reference": reference,
            "auto_pay": True,
            "created_at": now,
            "updated_at": now,
        })

        # Notify user
        self._notify(
            user_id, group_name, amount,
            title="Auto-Payment Successful",
            message=(
                f"Your overdue equb contribution of ETB {amount:,.0f} for '{group_name}' "
                f"was automatically paid from your wallet. Reference: {reference}."
            ),
            ntype="success",
        )

        return {"success": True, "reference": reference, "balance_after": balance_after}

    def _notify(self, user_id: str, group_name: str, amount: float,
                title: str, message: str, ntype: str = "info") -> None:
        self.db["notifications"].insert_one({
            "_id": new_id(),
            "user_id": str(user_id),
            "title": title,
            "message": message,
            "type": ntype,
            "read": False,
            "priority": "high",
            "link": "/wallet",
            "metadata": {"group_name": group_name, "amount": amount, "auto_pay": True},
            "actions": [],
            "created_at": utcnow(),
        })
