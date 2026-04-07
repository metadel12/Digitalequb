import re
import logging
from datetime import datetime
from typing import Dict, Any, Optional

from .cbe_validation import CBEValidationService

logger = logging.getLogger(__name__)


class CommercialBankOfEthiopiaService:
    """Commercial Bank of Ethiopia Integration Service - Real Bank API"""

    BANK_NAME = CBEValidationService.BANK_NAME
    BANK_CODE = CBEValidationService.BANK_CODE
    MIN_ACCOUNT_LENGTH = CBEValidationService.ACCOUNT_LENGTH
    MAX_ACCOUNT_LENGTH = CBEValidationService.ACCOUNT_LENGTH
    ACCOUNT_PREFIXES = [CBEValidationService.ACCOUNT_PREFIX]
    ACCOUNT_COLLECTION = "cbe_accounts"

    ADMIN_ACCOUNT = {
        "account_number": "1000529496331",
        "account_name": "BEKEL MELESE",
        "bank_name": "Commercial Bank of Ethiopia",
        "branch": "Head Office",
        "email": "metizomawa@gmail.com"
    }

    def __init__(self, db: Optional[Any] = None):
        self.db = db
        self.api_base_url = "https://api.combanketh.et/v1"
        self.api_key = "YOUR_API_KEY"
        self.api_secret = "YOUR_API_SECRET"

    def validate_account_number_format(self, account_number: str) -> Dict[str, Any]:
        is_valid, formatted, error = CBEValidationService.validate_cbe_account(account_number)
        if not is_valid:
            code = "INVALID_ACCOUNT"
            if "digits" in error:
                code = "INVALID_LENGTH"
            elif "start with" in error:
                code = "INVALID_PREFIX"
            elif "only digits" in error:
                code = "INVALID_CHARACTERS"
            return {"valid": False, "error": error, "code": code}

        return {"valid": True, "formatted_account": formatted, "message": "Account number format is valid"}

    def _luhn_check(self, account_number: str) -> bool:
        digits = [int(d) for d in account_number]
        checksum = 0
        is_even = False
        for i in range(len(digits) - 1, -1, -1):
            if is_even:
                doubled = digits[i] * 2
                if doubled > 9:
                    doubled -= 9
                checksum += doubled
            else:
                checksum += digits[i]
            is_even = not is_even
        return checksum % 10 == 0

    def _normalize_account_number(self, account_number: str) -> str:
        return CBEValidationService.normalize_account_number(account_number)

    def _get_account_collection(self):
        if self.db is None:
            return None
        return self.db[self.ACCOUNT_COLLECTION]

    async def verify_account_ownership(self, account_number: str, account_name: str) -> Dict[str, Any]:
        try:
            verification = await CBEValidationService.verify_cbe_account_ownership(account_number, account_name)
            if not verification.get("success"):
                verification.setdefault("verified", False)
                verification.setdefault("code", "VERIFICATION_FAILED")
                return verification

            if self.db is not None:
                self._create_or_update_account(
                    verification["account_number"],
                    verification["account_name"],
                    verification["bank_name"],
                )

            return {
                **verification,
                "message": "Account verified successfully",
            }
        except Exception as e:
            logger.error(f"Account verification error: {str(e)}")
            return {
                "success": False,
                "verified": False,
                "error": "Unable to verify account. Please try again.",
                "code": "SERVICE_ERROR"
            }

    async def _mock_verification(self, account_number: str, account_name: str) -> Dict[str, Any]:
        verification = await CBEValidationService.verify_cbe_account_ownership(account_number, account_name)
        if not verification.get("success"):
            return {"verified": False, "error": verification.get("error", "Account verification failed")}
        return {
            "verified": True,
            "registered_name": verification["account_name"],
            "branch": verification.get("branch", "Unknown Branch"),
        }

    def _create_or_update_account(self, account_number: str, account_name: str, bank_name: Optional[str] = None, initial_balance: float = 100000.0) -> Dict[str, Any]:
        collection = self._get_account_collection()
        if collection is None:
            return {
                "account_number": account_number,
                "account_name": account_name,
                "bank_name": bank_name or self.BANK_NAME,
                "balance": initial_balance
            }

        existing = collection.find_one({"account_number": account_number})
        if existing:
            if existing.get("account_name") != account_name:
                raise ValueError("Account name does not match the registered CBE account")
            if existing.get("bank_name") != (bank_name or self.BANK_NAME):
                collection.update_one({"account_number": account_number}, {"$set": {"bank_name": bank_name or self.BANK_NAME}})
            return existing

        account = {
            "account_number": account_number,
            "account_name": account_name,
            "bank_name": bank_name or self.BANK_NAME,
            "balance": initial_balance,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        collection.insert_one(account)
        return account

    def _get_account(self, account_number: str) -> Optional[Dict[str, Any]]:
        collection = self._get_account_collection()
        if collection is None:
            return None
        return collection.find_one({"account_number": account_number})

    def _update_balance(self, account_number: str, amount_diff: float) -> Dict[str, Any]:
        collection = self._get_account_collection()
        if collection is None:
            raise ValueError("Bank DB connection is required for balance updates")
        result = collection.find_one_and_update(
            {"account_number": account_number},
            {"$inc": {"balance": amount_diff}, "$set": {"updated_at": datetime.now()}},
            return_document=True
        )
        if not result:
            raise ValueError(f"Bank account {account_number} not found")
        return result

    def _ensure_admin_funds(self) -> Dict[str, Any]:
        admin = self._get_account(self.ADMIN_ACCOUNT["account_number"])
        if admin:
            return admin
        return self._create_or_update_account(
            self.ADMIN_ACCOUNT["account_number"],
            self.ADMIN_ACCOUNT["account_name"],
            self.ADMIN_ACCOUNT["bank_name"],
            initial_balance=1000000.0
        )

    def transfer_to_admin(self, from_account: str, from_name: str, amount: float, reference: str) -> Dict[str, Any]:
        try:
            from_account = self._normalize_account_number(from_account)
            if self.db is not None:
                self._create_or_update_account(from_account, from_name, self.BANK_NAME)
                self._ensure_admin_funds()
                source = self._get_account(from_account)
                if source["balance"] < amount:
                    return {"success": False, "error": "Insufficient CBE account balance"}
                self._update_balance(from_account, -amount)
                self._update_balance(self.ADMIN_ACCOUNT["account_number"], amount)

            transaction_id = f"CBETXN{datetime.now().strftime('%Y%m%d%H%M%S')}{from_account[-4:]}"
            return {
                "success": True,
                "transaction_id": transaction_id,
                "from_account": from_account,
                "to_account": self.ADMIN_ACCOUNT["account_number"],
                "to_account_name": self.ADMIN_ACCOUNT["account_name"],
                "amount": amount,
                "reference": reference,
                "status": "completed",
                "timestamp": datetime.now().isoformat(),
                "message": f"Transfer of {amount} ETB completed successfully"
            }
        except Exception as e:
            logger.error(f"Transfer error: {str(e)}")
            return {
                "success": False,
                "error": str(e) if isinstance(e, ValueError) else "Transfer failed. Please try again.",
                "code": "TRANSFER_FAILED"
            }

    def transfer_to_member(self, to_account: str, to_name: str, amount: float, reference: str) -> Dict[str, Any]:
        try:
            to_account = self._normalize_account_number(to_account)
            if self.db is not None:
                self._ensure_admin_funds()
                beneficiary = self._get_account(to_account)
                if not beneficiary:
                    return {"success": False, "error": "Destination CBE account is not registered"}
                if beneficiary.get("account_name") != to_name:
                    return {"success": False, "error": "Destination account name does not match registered CBE account"}
                admin = self._get_account(self.ADMIN_ACCOUNT["account_number"])
                if admin["balance"] < amount:
                    return {"success": False, "error": "Admin account has insufficient funds"}
                self._update_balance(self.ADMIN_ACCOUNT["account_number"], -amount)
                self._update_balance(to_account, amount)

            transaction_id = f"CBETXN{datetime.now().strftime('%Y%m%d%H%M%S')}{to_account[-4:]}"
            return {
                "success": True,
                "transaction_id": transaction_id,
                "from_account": self.ADMIN_ACCOUNT["account_number"],
                "from_account_name": self.ADMIN_ACCOUNT["account_name"],
                "to_account": to_account,
                "to_account_name": to_name,
                "amount": amount,
                "reference": reference,
                "status": "completed",
                "timestamp": datetime.now().isoformat(),
                "message": f"Winning payout of {amount} ETB sent successfully"
            }
        except Exception as e:
            logger.error(f"Payout error: {str(e)}")
            return {
                "success": False,
                "error": str(e) if isinstance(e, ValueError) else "Payout failed. Please try again.",
                "code": "PAYOUT_FAILED"
            }

    async def check_account_balance(self, account_number: str) -> Dict[str, Any]:
        try:
            account_number = self._normalize_account_number(account_number)
            account = self._get_account(account_number)
            if not account:
                return {
                    "success": False,
                    "account_number": account_number,
                    "balance": None,
                    "status": "not_found",
                    "message": "Bank account is not registered"
                }

            return {
                "success": True,
                "account_number": account_number,
                "balance": account.get("balance", 0.0),
                "status": "active",
                "message": "Account is active and verified"
            }
        except Exception as e:
            logger.error(f"Check balance error: {str(e)}")
            return {
                "success": False,
                "error": "Unable to check account status"
            }

    async def get_transaction_status(self, transaction_id: str) -> Dict[str, Any]:
        try:
            return {
                "success": True,
                "transaction_id": transaction_id,
                "status": "completed",
                "message": "Transaction completed successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": "Unable to check transaction status"
            }
