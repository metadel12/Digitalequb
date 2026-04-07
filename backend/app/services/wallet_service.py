from __future__ import annotations

import math
from datetime import timedelta
from typing import Any, Dict, List, Optional

from pymongo.database import Database

from ..core.mongo_utils import current_round_number, new_id, next_payment_due, utcnow, wallet_defaults
from ..services.cbe_service import CommercialBankOfEthiopiaService

WINNER_PAYOUT_RATIO = 0.75
SYSTEM_PAYOUT_RATIO = 0.25


class WalletService:
    def __init__(self, db: Database):
        self.db = db

    def ensure_wallet_for_user(self, user_id: str) -> Dict[str, Any]:
        wallet = self.db["wallets"].find_one({"user_id": str(user_id)})
        if wallet:
            return wallet
        wallet = wallet_defaults(str(user_id))
        self.db["wallets"].insert_one(wallet)
        return wallet

    def get_wallet_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        wallet = self.db["wallets"].find_one({"user_id": str(user_id)}) or self.ensure_wallet_for_user(str(user_id))
        return self._wallet_response(wallet)

    def get_wallet_balance(self, user_id: str) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        pending = self.db["wallet_transactions"].count_documents(
            {"wallet_id": wallet["_id"], "status": {"$in": ["pending", "processing", "on_hold"]}}
        )
        return {
            "balance": wallet.get("balance", 0.0),
            "currency": wallet.get("currency", "ETB"),
            "available_balance": wallet.get("balance", 0.0),
            "pending_deposits": wallet.get("pending_deposits", 0.0),
            "pending_withdrawals": wallet.get("pending_withdrawals", 0.0),
            "total_deposits": wallet.get("total_deposits", 0.0),
            "total_withdrawals": wallet.get("total_withdrawals", 0.0),
            "total_winnings": wallet.get("total_winnings", 0.0),
            "total_equb_paid": wallet.get("total_equb_paid", 0.0),
            "total_transactions": wallet.get("total_transactions", 0),
            "last_transaction_at": wallet.get("last_transaction_at"),
            "pending_transactions_count": pending,
        }

    def initiate_deposit(self, user_id: str, deposit_data) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        amount = float(deposit_data.amount)
        now = utcnow()
        reference = self._generate_reference("DEP")
        balance_before = float(wallet.get("balance", 0.0))
        balance_after = balance_before + amount

        source_details = deposit_data.source_details or {}
        payment_method = deposit_data.payment_method
        transaction_metadata = {"source_details": source_details, "metadata": deposit_data.metadata or {}}
        instructions = None
        transfer_result = None

        if payment_method == "bank":
            account_number = source_details.get("account_number")
            account_name = source_details.get("account_name")
            bank_name = source_details.get("bank_name") or CommercialBankOfEthiopiaService.BANK_NAME

            if not account_number or not account_name:
                raise ValueError("Bank deposit requires your CBE account number and account name")

            user = self.db["users"].find_one({"_id": str(user_id)})
            if not user:
                raise ValueError("User not found")
            registered_account = user.get("bank_account") or {}
            if registered_account.get("account_number") and registered_account.get("account_name"):
                if registered_account.get("account_number") != account_number or registered_account.get("account_name").strip().lower() != account_name.strip().lower():
                    raise ValueError("Deposit account details must match your registered CBE account")

            bank_service = CommercialBankOfEthiopiaService(self.db)
            transfer_result = bank_service.transfer_to_admin(account_number, account_name, amount, reference)
            if not transfer_result.get("success"):
                raise ValueError(transfer_result.get("error", "Bank transfer failed"))

            transaction_metadata["bank_transfer"] = transfer_result
            transaction_metadata["source_details"] = {
                "bank_name": bank_name,
                "account_number": account_number,
                "account_name": account_name,
            }
            instructions = {
                "bank_name": CommercialBankOfEthiopiaService.BANK_NAME,
                "account_number": CommercialBankOfEthiopiaService.ADMIN_ACCOUNT["account_number"],
                "account_name": CommercialBankOfEthiopiaService.ADMIN_ACCOUNT["account_name"],
                "message": f"Send {amount} ETB from your CBE account to the DigiEqub bank account and include reference {reference}."
            }

        tx = {
            "_id": new_id(),
            "wallet_id": wallet["_id"],
            "group_id": None,
            "group_name": None,
            "round_number": None,
            "type": "deposit",
            "amount": amount,
            "fee": 0.0,
            "net_amount": amount,
            "balance_before": balance_before,
            "balance_after": balance_after,
            "status": "completed",
            "payment_method": payment_method,
            "reference": reference,
            "description": f"Deposit via {payment_method}",
            "transaction_metadata": transaction_metadata,
            "transaction_hash": transfer_result.get("transaction_id") if payment_method == "bank" else None,
            "blockchain_tx_hash": None,
            "approved_by": None,
            "approved_at": None,
            "completed_at": now,
            "created_at": now,
            "updated_at": now,
        }
        self.db["wallet_transactions"].insert_one(tx)
        self.db["wallets"].update_one(
            {"_id": wallet["_id"]},
            {
                "$set": {"balance": balance_after, "last_transaction_at": now, "updated_at": now},
                "$inc": {"total_deposits": amount, "total_transactions": 1},
            },
        )
        return {
            "transaction_id": tx["_id"],
            "reference": reference,
            "amount": amount,
            "payment_link": f"/wallet/deposit/{payment_method}/{reference}",
            "instructions": instructions or self._payment_instructions(payment_method),
            "expires_at": now,
            "status": "completed",
        }

    def confirm_deposit(self, reference: str, transaction_hash: Optional[str] = None) -> bool:
        return True

    def get_deposit_by_reference(self, user_id: str, reference: str) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        tx = self.db["wallet_transactions"].find_one({"wallet_id": wallet["_id"], "reference": reference, "type": "deposit"})
        if not tx:
            raise ValueError("Deposit request not found")
        return {
            "id": tx["_id"],
            "wallet_id": wallet["_id"],
            "amount": tx["amount"],
            "method": tx.get("payment_method"),
            "status": tx["status"],
            "reference": tx["reference"],
            "expires_at": tx.get("completed_at"),
            "transaction_id": tx["_id"],
            "payment_link": f"/wallet/deposit/{tx.get('payment_method')}/{tx['reference']}",
            "qr_code": None,
            "instructions": None,
            "completed_at": tx.get("completed_at"),
            "created_at": tx.get("created_at"),
        }

    def initiate_withdrawal(self, user_id: str, withdrawal_data) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        amount = float(withdrawal_data.amount)
        balance = float(wallet.get("balance", 0.0))
        if balance < amount:
            raise ValueError("Insufficient balance")

        fee = self._withdrawal_fee(withdrawal_data.withdrawal_method, amount)
        reference = self._generate_reference("WDR")
        now = utcnow()
        destination_details = withdrawal_data.destination_details or {}
        status = "pending"
        completed_at = None
        bank_transfer = None

        if withdrawal_data.withdrawal_method == "bank":
            account_number = destination_details.get("account_number")
            account_name = destination_details.get("account_name")
            bank_name = destination_details.get("bank_name") or CommercialBankOfEthiopiaService.BANK_NAME

            if not account_number or not account_name:
                raise ValueError("Bank withdrawal requires your CBE account number and account name")

            user = self.db["users"].find_one({"_id": str(user_id)})
            if not user:
                raise ValueError("User not found")
            registered_account = user.get("bank_account") or {}
            if not registered_account.get("account_number") or not registered_account.get("account_name"):
                raise ValueError("You must register a Commercial Bank of Ethiopia account before withdrawing")
            if registered_account.get("account_number") != account_number or registered_account.get("account_name") != account_name:
                raise ValueError("Withdrawal destination must match your registered CBE account")

            bank_service = CommercialBankOfEthiopiaService(self.db)
            transfer_result = bank_service.transfer_to_member(account_number, account_name, amount, reference)
            if not transfer_result.get("success"):
                raise ValueError(transfer_result.get("error", "Bank payout failed"))

            status = "completed"
            completed_at = now
            bank_transfer = transfer_result
            destination_details = {
                "bank_name": bank_name,
                "account_number": account_number,
                "account_name": account_name,
            }

        tx = {
            "_id": new_id(),
            "wallet_id": wallet["_id"],
            "group_id": None,
            "group_name": None,
            "round_number": None,
            "type": "withdrawal",
            "amount": -amount,
            "fee": fee,
            "net_amount": amount - fee,
            "balance_before": balance,
            "balance_after": balance - amount,
            "status": status,
            "payment_method": withdrawal_data.withdrawal_method,
            "reference": reference,
            "description": f"Withdrawal via {withdrawal_data.withdrawal_method}",
            "transaction_metadata": {"destination_details": destination_details, "notes": withdrawal_data.notes, "bank_transfer": bank_transfer},
            "completed_at": completed_at,
            "created_at": now,
            "updated_at": now,
        }
        self.db["wallet_transactions"].insert_one(tx)

        update_fields = {
            "balance": balance - amount,
            "last_transaction_at": now,
            "updated_at": now,
        }
        update_increments = {"total_transactions": 1}
        if status == "completed":
            update_increments["total_withdrawals"] = amount
        else:
            update_increments["pending_withdrawals"] = amount

        self.db["wallets"].update_one(
            {"_id": wallet["_id"]},
            {"$set": update_fields, "$inc": update_increments},
        )

        return {
            "withdrawal_id": tx["_id"],
            "amount": amount,
            "status": status,
            "estimated_arrival": now + timedelta(days=2) if status != "completed" else now,
            "fee": fee,
            "reference": reference,
        }

    def get_withdrawal_details(self, user_id: str, withdrawal_id: str) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        tx = self.db["wallet_transactions"].find_one({"wallet_id": wallet["_id"], "_id": withdrawal_id, "type": "withdrawal"})
        if not tx:
            raise ValueError("Withdrawal request not found")
        meta = tx.get("transaction_metadata", {})
        destination = meta.get("destination_details", {}) if isinstance(meta, dict) else {}
        return {
            "id": tx["_id"],
            "wallet_id": wallet["_id"],
            "amount": abs(tx["amount"]),
            "fee": tx.get("fee", 0.0),
            "net_amount": tx.get("net_amount", 0.0),
            "method": tx.get("payment_method"),
            "status": tx["status"],
            "priority": "normal",
            "bank_name": destination.get("bank_name"),
            "account_name": destination.get("account_name"),
            "account_number": destination.get("account_number"),
            "mobile_provider": destination.get("mobile_provider"),
            "mobile_number": destination.get("mobile_number"),
            "crypto_address": destination.get("crypto_address"),
            "cash_pickup_location": destination.get("cash_pickup_location"),
            "reference": tx["reference"],
            "estimated_completion": None,
            "admin_notes": None,
            "processed_by": None,
            "processed_at": None,
            "rejected_reason": None,
            "created_at": tx["created_at"],
            "updated_at": tx.get("updated_at"),
        }

    def cancel_withdrawal(self, user_id: str, withdrawal_id: str) -> bool:
        wallet = self.ensure_wallet_for_user(str(user_id))
        tx = self.db["wallet_transactions"].find_one({"wallet_id": wallet["_id"], "_id": withdrawal_id, "type": "withdrawal"})
        if not tx or tx["status"] != "pending":
            raise ValueError("Only pending withdrawals can be cancelled")
        amount = abs(float(tx["amount"]))
        now = utcnow()
        self.db["wallet_transactions"].update_one({"_id": tx["_id"]}, {"$set": {"status": "cancelled", "updated_at": now}})
        self.db["wallets"].update_one(
            {"_id": wallet["_id"]},
            {"$inc": {"balance": amount, "pending_withdrawals": -amount}, "$set": {"updated_at": now}},
        )
        return True

    def process_withdrawal_request(self, withdrawal_id: str, admin_id: str, action: str, notes: Optional[str] = None) -> bool:
        tx = self.db["wallet_transactions"].find_one({"_id": withdrawal_id, "type": "withdrawal"})
        if not tx:
            return False
        amount = abs(float(tx["amount"]))
        now = utcnow()
        if action == "reject":
            self.db["wallet_transactions"].update_one({"_id": withdrawal_id}, {"$set": {"status": "failed", "updated_at": now}})
            self.db["wallets"].update_one({"_id": tx["wallet_id"]}, {"$inc": {"balance": amount, "pending_withdrawals": -amount}, "$set": {"updated_at": now}})
        elif action == "complete":
            self.db["wallet_transactions"].update_one({"_id": withdrawal_id}, {"$set": {"status": "completed", "completed_at": now, "updated_at": now}})
            self.db["wallets"].update_one({"_id": tx["wallet_id"]}, {"$inc": {"pending_withdrawals": -amount, "total_withdrawals": amount}, "$set": {"last_transaction_at": now, "updated_at": now}})
        else:
            self.db["wallet_transactions"].update_one({"_id": withdrawal_id}, {"$set": {"status": "processing" if action == "hold" else "approved", "updated_at": now}})
        return True

    def credit_wallet(
        self,
        user_id: str,
        amount: float,
        *,
        transaction_type: str = "credit",
        description: str = "",
        group_id: Optional[str] = None,
        round_number: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
        totals_field: Optional[str] = "total_deposits",
        reference_prefix: str = "CRD",
    ) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        group = self.db["groups"].find_one({"_id": str(group_id)}) if group_id else None
        balance_before = float(wallet.get("balance", 0.0))
        balance_after = balance_before + float(amount)
        now = utcnow()
        reference = self._generate_reference(reference_prefix)
        tx = {
            "_id": new_id(),
            "wallet_id": wallet["_id"],
            "group_id": str(group_id) if group_id else None,
            "group_name": group.get("name") if group else None,
            "round_number": round_number,
            "type": transaction_type,
            "amount": float(amount),
            "fee": 0.0,
            "net_amount": float(amount),
            "balance_before": balance_before,
            "balance_after": balance_after,
            "status": "completed",
            "payment_method": None,
            "reference": reference,
            "description": description or transaction_type.replace("_", " ").title(),
            "transaction_metadata": metadata or {},
            "completed_at": now,
            "created_at": now,
            "updated_at": now,
        }
        self.db["wallet_transactions"].insert_one(tx)

        increments: Dict[str, Any] = {"total_transactions": 1}
        if totals_field:
            increments[totals_field] = float(amount)

        self.db["wallets"].update_one(
            {"_id": wallet["_id"]},
            {"$set": {"balance": balance_after, "last_transaction_at": now, "updated_at": now}, "$inc": increments},
        )
        return {"success": True, "reference": reference, "wallet_id": wallet["_id"], "balance_after": balance_after, "transaction_id": tx["_id"]}

    def transfer_winning(self, winner_id: str, group_id: str, amount: float, description: str = "", *, round_number: Optional[int] = None, metadata: Optional[Dict[str, Any]] = None, commit: bool = True) -> Dict[str, Any]:
        return self.credit_wallet(
            str(winner_id),
            float(amount),
            transaction_type="equb_winning",
            description=f"Equb winning: {description}",
            group_id=str(group_id),
            round_number=round_number,
            metadata=metadata,
            totals_field="total_winnings",
            reference_prefix="EQW",
        )

    def pay_equb_contribution(self, user_id: str, group_id: str, amount: float) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        group = self.db["groups"].find_one({"_id": str(group_id)})
        if not group:
            raise ValueError("Group not found")
        if group.get("status") != "active":
            raise ValueError("Group is not active")
        expected = float(group.get("contribution_amount") or 0)
        if float(amount) != expected:
            raise ValueError(f"Contribution amount must be {expected}")
        if float(wallet.get("balance", 0.0)) < float(amount):
            raise ValueError(f"Insufficient wallet balance. Available balance is {wallet.get('balance', 0)} ETB")

        member = next((item for item in group.get("members", []) if str(item.get("user_id")) == str(user_id)), None)
        if not member:
            raise ValueError("Only group members can contribute")

        round_number = current_round_number(group)
        now = utcnow()
        reference = self._generate_reference("EQP")
        balance_before = float(wallet.get("balance", 0.0))
        balance_after = balance_before - float(amount)
        tx = {
            "_id": new_id(),
            "wallet_id": wallet["_id"],
            "group_id": str(group_id),
            "group_name": group.get("name"),
            "round_number": round_number,
            "type": "equb_payment",
            "amount": -float(amount),
            "fee": 0.0,
            "net_amount": -float(amount),
            "balance_before": balance_before,
            "balance_after": balance_after,
            "status": "completed",
            "payment_method": "wallet",
            "reference": reference,
            "description": f"Equb contribution to {group.get('name')}",
            "transaction_metadata": {"group_id": str(group_id), "group_name": group.get("name"), "round_number": round_number, "member_id": str(user_id)},
            "completed_at": now,
            "created_at": now,
            "updated_at": now,
        }
        self.db["wallet_transactions"].insert_one(tx)
        self.db["wallets"].update_one(
            {"_id": wallet["_id"]},
            {"$set": {"balance": balance_after, "last_transaction_at": now, "updated_at": now}, "$inc": {"total_equb_paid": float(amount), "total_transactions": 1}},
        )
        updated_members = []
        for item in group.get("members", []):
            if str(item.get("user_id")) == str(user_id):
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
        all_paid = all(bool(item.get("has_paid_current_round")) or int(item.get("contribution_count") or 0) >= round_number for item in updated_members)
        rules = dict(group.get("rules") or {})
        rules["ready_for_winner_selection"] = all_paid
        rules["current_round_fund"] = round(float(group.get("contribution_amount") or 0) * len(updated_members), 2) if all_paid else 0.0
        rules["last_contribution_received_at"] = now
        round_payment = self.db["round_payments"].find_one({"group_id": str(group_id), "round_number": round_number}) or {
            "_id": new_id(),
            "group_id": str(group_id),
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
        self.db["groups"].update_one(
            {"_id": str(group_id)},
            {"$set": {"members": updated_members, "rules": rules, "updated_at": now, "current_round": round_number, "total_rounds": int(group.get("total_rounds") or 0)}},
        )

        return {
            "reference": reference,
            "transaction_id": tx["_id"],
            "new_balance": balance_after,
            "round_number": round_number,
            "payout": None,
            "ready_for_winner_selection": all_paid,
        }

    def get_transaction_history(self, user_id: str, page: int = 1, page_size: int = 20, transaction_type: Optional[str] = None) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        query = {"wallet_id": wallet["_id"]}
        if transaction_type:
            query["type"] = transaction_type
        total = self.db["wallet_transactions"].count_documents(query)
        items = list(
            self.db["wallet_transactions"]
            .find(query)
            .sort("created_at", -1)
            .skip((page - 1) * page_size)
            .limit(page_size)
        )
        return {
            "transactions": [self._transaction_response(item) for item in items],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total / page_size) if page_size else 0,
        }

    def get_wallet_stats(self, user_id: str) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        now = utcnow() - timedelta(days=30)
        def _sum(tx_type: str) -> float:
            items = self.db["wallet_transactions"].find({"wallet_id": wallet["_id"], "type": tx_type, "created_at": {"$gte": now}})
            return abs(sum(float(item.get("amount", 0.0)) for item in items))
        return {
            "total_balance": wallet.get("balance", 0.0),
            "total_deposits": wallet.get("total_deposits", 0.0),
            "total_withdrawals": wallet.get("total_withdrawals", 0.0),
            "total_winnings": wallet.get("total_winnings", 0.0),
            "total_equb_paid": wallet.get("total_equb_paid", 0.0),
            "pending_deposits": wallet.get("pending_deposits", 0.0),
            "pending_withdrawals": wallet.get("pending_withdrawals", 0.0),
            "monthly_deposits": _sum("deposit"),
            "monthly_withdrawals": _sum("withdrawal"),
            "monthly_winnings": _sum("equb_winning"),
            "monthly_equb_paid": _sum("equb_payment"),
        }

    def get_winning_details(self, user_id: str, group_id: str) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        items = list(self.db["wallet_transactions"].find({"wallet_id": wallet["_id"], "group_id": str(group_id), "type": "equb_winning"}).sort("created_at", -1))
        return {
            "group_id": str(group_id),
            "winning_transactions": [self._transaction_response(item) for item in items],
            "total_amount": sum(float(item.get("amount", 0.0)) for item in items),
        }

    def setup_auto_withdraw(self, user_id: str, setup_data) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        accounts = list(wallet.get("linked_accounts", []))
        accounts.append({"type": setup_data.method, "threshold": float(setup_data.threshold), "destination_details": setup_data.destination_details, "configured_at": utcnow()})
        self.db["wallets"].update_one({"_id": wallet["_id"]}, {"$set": {"auto_withdraw_enabled": setup_data.enabled, "linked_accounts": accounts, "updated_at": utcnow()}})
        return self.get_wallet_by_user_id(str(user_id))

    async def get_bank_account_balance(self, user_id: str) -> Dict[str, Any]:
        user = self.db["users"].find_one({"_id": str(user_id)})
        if not user:
            raise ValueError("User not found")
        bank_account = user.get("bank_account") or {}
        account_number = bank_account.get("account_number")
        if not account_number:
            return {
                "success": False,
                "balance": None,
                "error": "No CBE account registered"
            }
        bank_service = CommercialBankOfEthiopiaService(self.db)
        return await bank_service.check_account_balance(account_number)

    def generate_statement(self, user_id: str, from_date, to_date) -> Dict[str, Any]:
        wallet = self.ensure_wallet_for_user(str(user_id))
        query: Dict[str, Any] = {"wallet_id": wallet["_id"]}
        if from_date or to_date:
            query["created_at"] = {}
            if from_date:
                query["created_at"]["$gte"] = from_date
            if to_date:
                query["created_at"]["$lte"] = to_date
        items = list(self.db["wallet_transactions"].find(query).sort("created_at", -1))
        return {
            "generated_at": utcnow(),
            "from_date": from_date,
            "to_date": to_date,
            "totals": {
                "deposits": sum(float(i.get("amount", 0)) for i in items if i.get("type") == "deposit"),
                "withdrawals": abs(sum(float(i.get("amount", 0)) for i in items if i.get("type") == "withdrawal")),
                "winnings": sum(float(i.get("amount", 0)) for i in items if i.get("type") == "equb_winning"),
                "equb_payments": abs(sum(float(i.get("amount", 0)) for i in items if i.get("type") == "equb_payment")),
            },
            "transactions": [self._transaction_response(item) for item in items],
        }

    def _transaction_response(self, item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": item["_id"],
            "wallet_id": item["wallet_id"],
            "group_id": item.get("group_id"),
            "group_name": item.get("group_name"),
            "round_number": item.get("round_number"),
            "type": item["type"],
            "amount": item.get("amount", 0.0),
            "fee": item.get("fee", 0.0),
            "payment_method": item.get("payment_method"),
            "description": item.get("description"),
            "metadata": item.get("transaction_metadata"),
            "net_amount": item.get("net_amount", 0.0),
            "balance_before": item.get("balance_before", 0.0),
            "balance_after": item.get("balance_after", 0.0),
            "status": item.get("status", "pending"),
            "reference": item.get("reference"),
            "transaction_hash": item.get("transaction_hash"),
            "blockchain_tx_hash": item.get("blockchain_tx_hash"),
            "approved_by": item.get("approved_by"),
            "approved_at": item.get("approved_at"),
            "completed_at": item.get("completed_at"),
            "created_at": item.get("created_at"),
            "updated_at": item.get("updated_at"),
        }

    def _wallet_response(self, wallet: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": wallet.get("_id"),
            "user_id": wallet.get("user_id"),
            "balance": wallet.get("balance", 0.0),
            "currency": wallet.get("currency", "ETB"),
            "wallet_address": wallet.get("wallet_address"),
            "total_deposits": wallet.get("total_deposits", 0.0),
            "total_withdrawals": wallet.get("total_withdrawals", 0.0),
            "total_winnings": wallet.get("total_winnings", 0.0),
            "total_equb_paid": wallet.get("total_equb_paid", 0.0),
            "pending_deposits": wallet.get("pending_deposits", 0.0),
            "pending_withdrawals": wallet.get("pending_withdrawals", 0.0),
            "total_transactions": wallet.get("total_transactions", 0),
            "last_transaction_at": wallet.get("last_transaction_at"),
            "is_locked": wallet.get("is_locked", False),
            "auto_withdraw_enabled": wallet.get("auto_withdraw_enabled", False),
            "auto_deposit_enabled": wallet.get("auto_deposit_enabled", False),
            "daily_withdrawal_limit": wallet.get("daily_withdrawal_limit", 50000.0),
            "weekly_withdrawal_limit": wallet.get("weekly_withdrawal_limit", 200000.0),
            "monthly_withdrawal_limit": wallet.get("monthly_withdrawal_limit", 500000.0),
            "spending_limit": wallet.get("spending_limit", 0.0),
            "linked_accounts": wallet.get("linked_accounts", []),
            "created_at": wallet.get("created_at"),
            "updated_at": wallet.get("updated_at"),
        }

    def _withdrawal_fee(self, method: str, amount: float) -> float:
        if method == "bank":
            return max(5.0, amount * 0.005)
        if method == "mobile":
            return max(2.0, amount * 0.002)
        if method == "crypto":
            return amount * 0.001
        if method == "cash":
            return 10.0
        return 0.0

    def _payment_instructions(self, method: str) -> Dict[str, Any]:
        data = {
            "bank": {"supported_banks": ["CBE", "Dashen", "Awash"], "account_name": "DigiEqub Platform"},
            "mobile": {"providers": ["TeleBirr", "M-Pesa"]},
            "card": {"provider": "Stripe"},
            "crypto": {"assets": ["ETH", "USDT", "BTC"], "network": "Ethereum"},
            "cash": {"note": "Present the reference at a partner location."},
            "p2p": {"note": "Share the reference with another DigiEqub wallet user."},
        }
        return data.get(method, {})

    def _generate_reference(self, prefix: str = "WAL") -> str:
        return f"{prefix}-{new_id().split('-')[0].upper()}"


def ensure_wallet_schema(db: Database) -> None:
    return None
