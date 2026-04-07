from __future__ import annotations

import secrets
from typing import Any, Dict, List, Optional

from pymongo.database import Database

from ..core.mongo_utils import current_round_number, group_total_rounds, new_id, next_payment_due, utcnow
from .cbe_service import CommercialBankOfEthiopiaService
from .wallet_service import SYSTEM_PAYOUT_RATIO, WINNER_PAYOUT_RATIO, WalletService

DEFAULT_SYSTEM_WALLET_LABEL = "DigiEqub Earnings Wallet"


class WinnerService:
    def __init__(self, db: Database):
        self.db = db
        self.wallet_service = WalletService(db)

    def get_groups_ready_for_winner(self) -> List[Dict[str, Any]]:
        groups = list(self.db["groups"].find({"status": "active"}))
        ready_groups: List[Dict[str, Any]] = []
        for group in groups:
            members = list(group.get("members") or [])
            if not members:
                continue

            round_number = int(group.get("current_round") or current_round_number(group))
            round_status = dict(group.get("round_status") or {})
            round_completed = bool((round_status.get(str(round_number)) or {}).get("completed"))
            all_paid = all(bool(member.get("has_paid_current_round")) for member in members)
            if not all_paid or round_completed:
                continue

            total_collected = round(float(group.get("contribution_amount", 0)) * len(members), 2)
            ready_groups.append(
                {
                    "group_id": str(group["_id"]),
                    "group_name": group.get("name", "Unnamed Group"),
                    "current_round": round_number,
                    "total_rounds": int(group.get("total_rounds") or group_total_rounds(group)),
                    "prize_pool": total_collected,
                    "members_count": len(members),
                    "members": [
                        {
                            "user_id": str(member.get("user_id")),
                            "full_name": member.get("full_name", "Unknown"),
                            "email": member.get("email", ""),
                            "has_paid_current_round": bool(member.get("has_paid_current_round")),
                            "rounds_completed": member.get("rounds_completed", []),
                            "has_received_payout": bool(member.get("has_received_payout") or member.get("received_payout")),
                            "total_contributed": float(member.get("total_contributed") or 0),
                        }
                        for member in members
                    ],
                }
            )
        return ready_groups

    def select_random_winner(self, group_id: str) -> Dict[str, Any]:
        group = self.db["groups"].find_one({"_id": str(group_id)})
        if not group:
            return {"success": False, "error": "Group not found"}
        if group.get("status") != "active":
            return {"success": False, "error": "Group must be active before selecting a winner"}

        members = list(group.get("members") or [])
        if not members:
            return {"success": False, "error": "This group has no members"}

        round_number = int(group.get("current_round") or current_round_number(group))
        all_paid = all(bool(member.get("has_paid_current_round")) for member in members)
        if not all_paid:
            return {"success": False, "error": f"Not all members have paid for round {round_number}"}

        eligible_members = [member for member in members if not bool(member.get("has_received_payout") or member.get("received_payout"))]
        if not eligible_members:
            eligible_members = members

        winner = eligible_members[secrets.randbelow(len(eligible_members))]
        total_collected = round(float(group.get("contribution_amount", 0)) * len(members), 2)
        winner_amount = round(total_collected * WINNER_PAYOUT_RATIO, 2)
        system_fee = round(total_collected * SYSTEM_PAYOUT_RATIO, 2)

        return {
            "success": True,
            "winner": winner,
            "current_round": round_number,
            "total_collected": total_collected,
            "winner_amount": winner_amount,
            "system_fee": system_fee,
        }

    def process_winner_payout(self, group_id: str, winner_user_id: str, round_number: int, winner_amount: float, system_fee: float) -> Dict[str, Any]:
        group = self.db["groups"].find_one({"_id": str(group_id)})
        if not group:
            return {"success": False, "error": "Group not found"}

        winner_user = self.db["users"].find_one({"_id": str(winner_user_id)})
        winner_member = next((member for member in group.get("members", []) if str(member.get("user_id")) == str(winner_user_id)), None)
        if not winner_member:
            return {"success": False, "error": "Winner not found in group"}

        winner_bank = None
        if winner_user:
            winner_bank = winner_user.get("bank_account")
        if not winner_bank or not winner_bank.get("account_number") or not winner_bank.get("account_name"):
            return {"success": False, "error": "Winner bank account details are required for payout"}

        total_collected = round(float(winner_amount) + float(system_fee), 2)
        payout_reference = f"WIN-{new_id().split('-')[0].upper()}"

        bank_service = CommercialBankOfEthiopiaService()
        transfer = bank_service.transfer_to_member(
            winner_bank["account_number"],
            winner_bank["account_name"],
            float(winner_amount),
            payout_reference,
        )

        if not transfer.get("success"):
            return {"success": False, "error": transfer.get("error", "Bank payout failed")}

        winner_wallet_credit = self.wallet_service.transfer_winning(
            str(winner_user_id),
            str(group_id),
            float(winner_amount),
            f"{group.get('name', 'Equb group')} round {round_number}",
            round_number=round_number,
            metadata={
                "group_name": group.get("name"),
                "round_number": round_number,
                "bank_reference": transfer.get("reference"),
                "payout_reference": payout_reference,
            },
        )

        system_wallet = self._get_or_create_system_wallet()
        before_balance = float(system_wallet.get("balance", 0))
        after_balance = round(before_balance + float(system_fee), 2)
        system_tx = {
            "_id": new_id(),
            "system_wallet_id": system_wallet["_id"],
            "group_id": str(group_id),
            "winner_record_id": None,
            "type": "fee_collected",
            "amount": float(system_fee),
            "balance_before": before_balance,
            "balance_after": after_balance,
            "round_number": round_number,
            "status": "completed",
            "reference": f"SYS-{new_id().split('-')[0].upper()}",
            "description": f"Platform fee collected from {group.get('name')} for round {round_number}",
            "transaction_metadata": {"group_name": group.get("name"), "payout_reference": payout_reference, "percentage": "25%"},
            "completed_at": utcnow(),
            "created_at": utcnow(),
            "updated_at": utcnow(),
        }
        self.db["system_wallet_transactions"].insert_one(system_tx)
        self.db["system_wallets"].update_one(
            {"_id": system_wallet["_id"]},
            {
                "$set": {"balance": after_balance, "last_transaction_at": utcnow(), "updated_at": utcnow()},
                "$inc": {"total_fees_collected": float(system_fee), "total_payouts_processed": total_collected},
            },
        )

        admin_wallet_credit = None
        admin_user_id = str(group.get("created_by") or "")
        if admin_user_id:
            admin_wallet_credit = self.wallet_service.credit_wallet(
                admin_user_id,
                float(system_fee),
                transaction_type="platform_fee_credit",
                description=f"Platform fee from {group.get('name')} round {round_number}",
                group_id=str(group_id),
                round_number=round_number,
                metadata={
                    "group_name": group.get("name"),
                    "round_number": round_number,
                    "percentage": "25%",
                    "winner_user_id": str(winner_user_id),
                    "system_wallet_reference": system_tx["reference"],
                },
                totals_field="total_deposits",
                reference_prefix="FEE",
            )

        winner_record = {
            "_id": new_id(),
            "group_id": str(group_id),
            "group_name": group.get("name"),
            "round_number": round_number,
            "winner_user_id": str(winner_user_id),
            "winner_name": (winner_user or {}).get("full_name", winner_member.get("full_name", "Unknown")),
            "winner_email": (winner_user or {}).get("email", winner_member.get("email", "")),
            "selection_method": "random",
            "total_collected": total_collected,
            "winner_amount": float(winner_amount),
            "system_fee": float(system_fee),
            "payout_reference": payout_reference,
            "winner_transaction_reference": transfer["reference"],
            "status": "paid",
            "selected_at": utcnow(),
            "paid_at": utcnow(),
            "created_at": utcnow(),
            "updated_at": utcnow(),
        }
        self.db["winner_records"].insert_one(winner_record)

        next_round = round_number + 1
        next_due = next_payment_due(group.get("frequency", "weekly"))
        updated_members = []
        for member in group.get("members", []):
            rounds_completed = list(member.get("rounds_completed") or [])
            if str(member.get("user_id")) == str(winner_user_id):
                if round_number not in rounds_completed:
                    rounds_completed.append(round_number)
                updated_members.append(
                    {
                        **member,
                        "has_paid_current_round": False,
                        "rounds_completed": sorted(set(int(item) for item in rounds_completed)),
                        "received_payout": True,
                        "has_received_payout": True,
                        "payout_amount": float(winner_amount),
                        "payout_received_at": utcnow(),
                        "next_payment_due": next_due,
                    }
                )
            else:
                updated_members.append({**member, "has_paid_current_round": False, "next_payment_due": next_due})

        round_status = dict(group.get("round_status") or {})
        round_status[str(round_number)] = {
            "completed": True,
            "winner_id": str(winner_user_id),
            "winner_name": winner_record["winner_name"],
            "paid_at": utcnow(),
        }

        rules = dict(group.get("rules") or {})
        winner_history = list(rules.get("winner_history") or [])
        winner_history.insert(
            0,
            {
                "id": f"winner-{winner_user_id}-{round_number}",
                "record_id": winner_record["_id"],
                "round": round_number,
                "member_id": str(winner_user_id),
                "member_name": winner_record["winner_name"],
                "member_email": winner_record["winner_email"],
                "winner_amount": float(winner_amount),
                "total_collected": total_collected,
                "system_fee": float(system_fee),
                "drawn_at": utcnow(),
                "status": "paid",
                "payout_reference": payout_reference,
                "winner_transaction_reference": transfer["reference"],
                "winner_wallet_transaction_reference": winner_wallet_credit.get("reference"),
                "system_wallet_transaction_reference": system_tx["reference"],
            },
        )
        rules["winner_history"] = winner_history
        rules["ready_for_winner_selection"] = False
        rules["current_round_fund"] = 0.0
        rules["next_round_number"] = next_round
        rules["next_collection_due"] = next_due
        rules["last_winner_selected_at"] = utcnow()
        rules["system_wallet_balance"] = after_balance

        self.db["groups"].update_one(
            {"_id": str(group_id)},
            {
                "$set": {
                    "members": updated_members,
                    "rules": rules,
                    "round_status": round_status,
                    "current_round": next_round,
                    "updated_at": utcnow(),
                }
            },
        )

        round_payment = self.db["round_payments"].find_one({"group_id": str(group_id), "round_number": round_number}) or {
            "_id": new_id(),
            "group_id": str(group_id),
            "group_name": group.get("name"),
            "round_number": round_number,
            "created_at": utcnow(),
        }
        round_payment.update(
            {
                "total_collected": total_collected,
                "winner_id": str(winner_user_id),
                "winner_name": winner_record["winner_name"],
                "winner_amount": float(winner_amount),
                "system_fee": float(system_fee),
                "status": "completed",
                "payment_status": {
                    "all_members_paid": True,
                    "paid_members": [str(member.get("user_id")) for member in group.get("members", [])],
                    "pending_members": [],
                },
                "completed_at": utcnow(),
                "updated_at": utcnow(),
            }
        )
        self.db["round_payments"].replace_one({"_id": round_payment["_id"]}, round_payment, upsert=True)

        self.send_winner_notification(
            {
                "full_name": winner_record["winner_name"],
                "phone_number": (winner_user or {}).get("phone_number"),
                "email": winner_record["winner_email"],
            },
            float(winner_amount),
            group,
        )

        self._sync_user_wallet_snapshot(str(winner_user_id))
        if admin_user_id:
            self._sync_user_wallet_snapshot(admin_user_id)

        return {
            "success": True,
            "winner": {
                "user_id": str(winner_user_id),
                "member_id": str(winner_user_id),
                "full_name": winner_record["winner_name"],
                "phone": (winner_user or {}).get("phone_number"),
            },
            "winner_amount": float(winner_amount),
            "winner_wallet_balance": float(winner_wallet_credit.get("balance_after", 0.0)),
            "winner_wallet_reference": winner_wallet_credit.get("reference"),
            "system_fee": float(system_fee),
            "system_balance": after_balance,
            "system_wallet_balance": after_balance,
            "admin_wallet_balance": float((admin_wallet_credit or {}).get("balance_after", 0.0)),
            "transaction_reference": transfer.get("reference"),
            "transaction_id": transfer.get("transaction_id"),
            "next_round": next_round,
            "round_number": round_number,
        }

    def select_weekly_winner(self, group_id: str, method: str = "random") -> Dict[str, Any]:
        if method != "random":
            raise ValueError("Only random selection is supported in the admin winner manager")
        selection = self.select_random_winner(group_id)
        if not selection.get("success"):
            raise ValueError(selection.get("error", "Winner selection failed"))
        result = self.process_winner_payout(
            group_id=group_id,
            winner_user_id=str(selection["winner"].get("user_id")),
            round_number=int(selection["current_round"]),
            winner_amount=float(selection["winner_amount"]),
            system_fee=float(selection["system_fee"]),
        )
        if not result.get("success"):
            raise ValueError(result.get("error", "Payout failed"))
        return result

    def get_group_members_status(self, group_id: str) -> Dict[str, Any]:
        group = self.db["groups"].find_one({"_id": str(group_id)})
        if not group:
            raise ValueError("Group not found")
        members_status = []
        for member in group.get("members", []):
            user = self.db["users"].find_one({"_id": str(member.get("user_id"))})
            members_status.append(
                {
                    "user_id": str(member.get("user_id")),
                    "full_name": (user or {}).get("full_name", member.get("full_name", "Unknown")),
                    "phone": (user or {}).get("phone_number", "Unknown"),
                    "has_paid_current_round": bool(member.get("has_paid_current_round")),
                    "rounds_completed": member.get("rounds_completed", []),
                    "has_received_payout": bool(member.get("has_received_payout") or member.get("received_payout")),
                    "total_contributed": float(member.get("total_contributed", 0)),
                }
            )
        return {
            "success": True,
            "group_name": group.get("name"),
            "current_round": int(group.get("current_round") or current_round_number(group)),
            "members": members_status,
        }

    def get_group_winners(self, group_id: str) -> List[dict]:
        group = self.db["groups"].find_one({"_id": str(group_id)})
        if not group:
            raise ValueError("Group not found")
        winners = list((group.get("rules") or {}).get("winner_history", []))
        winners.sort(key=lambda item: int(item.get("round", 0)), reverse=True)
        return winners

    def current_round_number(self, group: Dict[str, Any]) -> int:
        return current_round_number(group)

    def get_system_wallet_summary(self) -> Dict[str, Any]:
        wallet = self._get_or_create_system_wallet()
        transactions = list(self.db["system_wallet_transactions"].find({"system_wallet_id": wallet["_id"]}).sort("created_at", -1).limit(100))
        return {
            "wallet_name": wallet.get("label", DEFAULT_SYSTEM_WALLET_LABEL),
            "balance": float(wallet.get("balance", 0)),
            "currency": wallet.get("currency", "ETB"),
            "total_fees_collected": float(wallet.get("total_fees_collected", 0)),
            "total_payouts_processed": float(wallet.get("total_payouts_processed", 0)),
            "last_transaction_at": wallet.get("last_transaction_at"),
            "transactions": transactions,
        }

    def send_winner_notification(self, winner: dict, amount: float, group: dict) -> None:
        phone = winner.get("phone_number") or winner.get("phone")
        message = f"Congratulations {winner.get('full_name', 'winner')}! You won {amount:,.0f} ETB from {group.get('name', 'your group')}."
        if phone:
            print(f"SMS to {phone}: {message}")

    def _get_or_create_system_wallet(self) -> Dict[str, Any]:
        wallet = self.db["system_wallets"].find_one({})
        if wallet:
            return wallet
        wallet = {
            "_id": new_id(),
            "label": DEFAULT_SYSTEM_WALLET_LABEL,
            "currency": "ETB",
            "balance": 0.0,
            "total_fees_collected": 0.0,
            "total_payouts_processed": 0.0,
            "last_transaction_at": None,
            "created_at": utcnow(),
            "updated_at": utcnow(),
        }
        self.db["system_wallets"].insert_one(wallet)
        return wallet

    def _sync_user_wallet_snapshot(self, user_id: str) -> None:
        wallet = self.db["wallets"].find_one({"user_id": str(user_id)})
        if not wallet:
            return
        self.db["users"].update_one(
            {"_id": str(user_id)},
            {
                "$set": {
                    "wallet": {
                        "balance": float(wallet.get("balance", 0.0)),
                        "total_deposited": float(wallet.get("total_deposits", 0.0)),
                        "total_withdrawn": float(wallet.get("total_withdrawals", 0.0)),
                        "total_winnings": float(wallet.get("total_winnings", 0.0)),
                        "updated_at": utcnow(),
                    },
                    "updated_at": utcnow(),
                }
            },
        )
