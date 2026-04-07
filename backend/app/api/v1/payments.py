from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel, Field
from typing import Optional
import re
import httpx
from datetime import datetime, timedelta
import logging

from ...dependencies import get_current_active_user
from ...core.database import get_db
from ...services.cbe_service import CommercialBankOfEthiopiaService

logger = logging.getLogger(__name__)
router = APIRouter()

# ============= REQUEST MODELS =============
class BankAccountVerificationRequest(BaseModel):
    account_number: str = Field(..., min_length=8, max_length=13)
    account_name: str

class PaymentProofSubmissionRequest(BaseModel):
    group_id: str
    amount: float = Field(..., gt=0)
    transaction_reference: str
    proof_image: Optional[str] = None  # URL or base64

class PaymentVerificationRequest(BaseModel):
    payment_id: str
    status: str = Field(..., pattern=r'^(verified|rejected)$')
    admin_notes: Optional[str] = None

# ============= ENDPOINTS =============

@router.post("/bank/verify-account")
async def verify_bank_account(
    request: BankAccountVerificationRequest,
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """Verify Commercial Bank of Ethiopia account ownership"""
    try:
        bank_service = CommercialBankOfEthiopiaService()
        verification = await bank_service.verify_account_ownership(
            request.account_number, request.account_name
        )

        if not verification.get("success"):
            raise HTTPException(status_code=400, detail=verification.get("error", "Account verification failed"))

        # Check for duplicate account registration
        existing_user = db["users"].find_one({
            "bank_account.account_number": request.account_number
        })
        if existing_user and str(existing_user["_id"]) != str(current_user["_id"]):
            raise HTTPException(status_code=400, detail="Account number already registered to another user")

        return {
            "success": True,
            "verified": verification["verified"],
            "account_number": verification["account_number"],
            "account_name": verification["account_name"],
            "bank_name": verification["bank_name"],
            "branch": verification.get("branch"),
            "account_status": verification.get("account_status")
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Account verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Account verification failed")

@router.post("/submit-proof")
async def submit_payment_proof(
    request: PaymentProofSubmissionRequest,
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """Submit payment proof after bank transfer to admin account"""
    try:
        # Validate group membership
        group = db["groups"].find_one({"_id": request.group_id})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        member = next((m for m in group.get("members", []) if str(m.get("user_id")) == str(current_user["_id"])), None)
        if not member:
            raise HTTPException(status_code=403, detail="You are not a member of this group")

        # Check if already paid for current round
        if member.get("has_paid_current_round"):
            raise HTTPException(status_code=400, detail="You have already paid for the current round")

        # Validate amount matches group contribution
        if request.amount != group.get("contribution_amount"):
            raise HTTPException(status_code=400, detail=f"Amount must be exactly {group.get('contribution_amount')} ETB")

        # Create payment verification record
        payment_verification = {
            "_id": f"pv_{request.group_id}_{str(current_user['_id'])}_{group.get('current_round')}",
            "group_id": request.group_id,
            "member_id": str(current_user["_id"]),
            "member_name": current_user.get("full_name", "Unknown"),
            "amount": request.amount,
            "round_number": group.get("current_round"),
            "transaction_reference": request.transaction_reference,
            "proof_image": request.proof_image or "",
            "submitted_at": datetime.now(),
            "status": "pending",  # pending, verified, rejected
            "verified_by_admin": None,
            "verified_at": None,
            "admin_notes": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        db["payment_verifications"].replace_one(
            {"_id": payment_verification["_id"]},
            payment_verification,
            upsert=True
        )

        return {
            "success": True,
            "message": "Payment proof submitted successfully. Waiting for admin verification.",
            "payment_id": payment_verification["_id"],
            "admin_account": CommercialBankOfEthiopiaService.ADMIN_ACCOUNT
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment proof submission error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit payment proof")

@router.get("/pending")
async def get_pending_payments(
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """Get pending payment verifications (admin only)"""
    # Check if admin
    if str(current_user.get("role", "")).lower() not in {"admin", "super_admin"}:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        pending_payments = list(db["payment_verifications"].find({"status": "pending"}).sort("submitted_at", -1))

        # Enrich with group and user info
        for payment in pending_payments:
            group = db["groups"].find_one({"_id": payment["group_id"]})
            payment["group_name"] = group.get("name", "Unknown") if group else "Unknown"

        return {
            "success": True,
            "pending_payments": pending_payments,
            "count": len(pending_payments)
        }

    except Exception as e:
        logger.error(f"Get pending payments error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve pending payments")

@router.post("/verify/{payment_id}")
async def verify_payment(
    payment_id: str,
    request: PaymentVerificationRequest,
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """Verify or reject member payment (admin only)"""
    # Check if admin
    if str(current_user.get("role", "")).lower() not in {"admin", "super_admin"}:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        # Find payment verification
        payment = db["payment_verifications"].find_one({"_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment verification not found")

        if payment["status"] != "pending":
            raise HTTPException(status_code=400, detail="Payment already processed")

        # Update payment verification
        update_data = {
            "status": request.status,
            "verified_by_admin": str(current_user["_id"]),
            "verified_at": datetime.now(),
            "admin_notes": request.admin_notes,
            "updated_at": datetime.now()
        }

        db["payment_verifications"].update_one(
            {"_id": payment_id},
            {"$set": update_data}
        )

        if request.status == "verified":
            # Update member payment status
            db["groups"].update_one(
                {"_id": payment["group_id"], "members.user_id": payment["member_id"]},
                {
                    "$set": {
                        "members.$.has_paid_current_round": True,
                        "members.$.payment_verified": True,
                        "members.$.last_payment_at": datetime.now(),
                        "updated_at": datetime.now()
                    },
                    "$inc": {
                        "members.$.total_contributed": payment["amount"]
                    }
                }
            )

        return {
            "success": True,
            "message": f"Payment {request.status} successfully",
            "payment_id": payment_id,
            "status": request.status
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")

@router.get("/banks/ethiopian")
async def get_ethiopian_banks():
    """Get list of Ethiopian banks (CBE only for now)"""
    return {
        "success": True,
        "banks": [
            {
                "code": "CBE",
                "name": "Commercial Bank of Ethiopia",
                "full_name": "Commercial Bank of Ethiopia",
                "logo": None,
                "supported": True
            }
        ]
    }

@router.get("/bank/account/{account_number}/status")
async def get_account_status(
    account_number: str,
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """Get account status (admin only)"""
    # Check if admin
    if str(current_user.get("role", "")).lower() not in {"admin", "super_admin"}:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        bank_service = CommercialBankOfEthiopiaService()
        status = await bank_service.check_account_balance(account_number)

        return {
            "success": True,
            "account_number": account_number,
            "status": status
        }

    except Exception as e:
        logger.error(f"Account status check error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check account status")
