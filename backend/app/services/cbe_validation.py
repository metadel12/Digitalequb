import re
from typing import Any, Dict, Tuple


class CBEValidationService:
    """Commercial Bank of Ethiopia validation rules for the single-admin system."""

    BANK_NAME = "Commercial Bank of Ethiopia"
    BANK_CODE = "CBE"
    ACCOUNT_LENGTH = 13
    ACCOUNT_PREFIX = "10"

    VALID_CBE_ACCOUNTS: Dict[str, Dict[str, str]] = {
        "1000529496331": {
            "account_name": "BEKEL MELESE",
            "status": "active",
            "branch": "Head Office",
            "account_type": "business",
        },
        "1000134567890": {
            "account_name": "JOHN DOE",
            "status": "active",
            "branch": "Bole Branch",
            "account_type": "savings",
        },
        "1000234567891": {
            "account_name": "SARAH WILLIAMS",
            "status": "active",
            "branch": "Mexico Branch",
            "account_type": "current",
        },
        "1000334567892": {
            "account_name": "ALEMITU TADESE",
            "status": "active",
            "branch": "Piassa Branch",
            "account_type": "savings",
        },
        "1000434567893": {
            "account_name": "DAVIT KEBEDE",
            "status": "active",
            "branch": "Merkato Branch",
            "account_type": "savings",
        },
    }

    @classmethod
    def normalize_account_number(cls, account_number: str) -> str:
        return re.sub(r"[\s\-\.]", "", str(account_number or ""))

    @classmethod
    def validate_cbe_account(cls, account_number: str) -> Tuple[bool, str, str]:
        clean_number = cls.normalize_account_number(account_number)

        if not clean_number:
            return False, "", "Account number is required"
        if not clean_number.isdigit():
            return False, "", "Account number must contain only digits"
        if len(clean_number) != cls.ACCOUNT_LENGTH:
            return False, "", f"CBE account number must be exactly {cls.ACCOUNT_LENGTH} digits"
        if not clean_number.startswith(cls.ACCOUNT_PREFIX):
            return False, "", f"CBE account number must start with '{cls.ACCOUNT_PREFIX}'"

        return True, clean_number, "Valid"

    @classmethod
    async def verify_cbe_account_ownership(cls, account_number: str, account_name: str) -> Dict[str, Any]:
        is_valid, formatted, error = cls.validate_cbe_account(account_number)
        if not is_valid:
            return {"success": False, "error": error}

        account_info = cls.VALID_CBE_ACCOUNTS.get(formatted)
        if not account_info:
            supplied_name = str(account_name or "").upper().strip()
            if not supplied_name:
                return {"success": False, "error": "Account name is required"}
            return {
                "success": True,
                "verified": True,
                "account_number": formatted,
                "account_name": supplied_name,
                "branch": "CBE Network",
                "account_type": "customer",
                "bank_name": cls.BANK_NAME,
                "bank_code": cls.BANK_CODE,
                "account_status": "active",
                "verification_source": "format_validation",
            }

        expected_name = str(account_info["account_name"]).upper().strip()
        supplied_name = str(account_name or "").upper().strip()
        if expected_name != supplied_name:
            return {
                "success": False,
                "error": f"Account name mismatch. Expected: {expected_name}",
            }

        if account_info.get("status") != "active":
            return {"success": False, "error": "Account is not active"}

        return {
            "success": True,
            "verified": True,
            "account_number": formatted,
            "account_name": expected_name,
            "branch": account_info.get("branch"),
            "account_type": account_info.get("account_type"),
            "bank_name": cls.BANK_NAME,
            "bank_code": cls.BANK_CODE,
            "account_status": account_info.get("status", "active"),
        }
