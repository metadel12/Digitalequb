from fastapi import APIRouter, HTTPException, Depends, Body, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional
import re
import httpx
import asyncio
import threading
from datetime import datetime, timedelta
import logging
from pymongo.database import Database

from ...dependencies import get_current_active_user
from ...core.database import get_db
from ...core.mongo_utils import current_round_number, current_round_total_collected, utcnow
from ...services.cbe_service import CommercialBankOfEthiopiaService
from ...services.receipt_service import ReceiptService

logger = logging.getLogger(__name__)
router = APIRouter()


def _push_notification(db: Database, user_id: str, title: str, message: str, ntype: str = "payment", priority: str = "medium", link: str | None = None, metadata: dict | None = None) -> None:
    from ...core.mongo_utils import new_id, utcnow as _utcnow
    db["notifications"].insert_one({
        "_id": new_id(),
        "user_id": str(user_id),
        "title": title,
        "message": message,
        "type": ntype,
        "read": False,
        "priority": priority,
        "link": link,
        "metadata": metadata or {},
        "created_at": _utcnow(),
    })

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

        # Validate amount matches group contribution (allow partial payments)
        expected_amount = group.get("contribution_amount")
        if request.amount <= 0 or request.amount > expected_amount:
            raise HTTPException(status_code=400, detail=f"Amount must be between 0 and {expected_amount} ETB")

        # Create payment verification record
        payment_verification = {
            "_id": f"pv_{request.group_id}_{str(current_user['_id'])}_{group.get('current_round')}",
            "group_id": request.group_id,
            "member_id": str(current_user["_id"]),
            "member_name": current_user.get("full_name") or current_user.get("email") or "Unknown",
            "member_email": current_user.get("email"),
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

@router.get("/status/{payment_id}")
async def get_payment_status(
    payment_id: str,
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    payment = db["payment_verifications"].find_one({"_id": payment_id})
    payment_source = "bank"
    if not payment:
        payment = db["wallet_payments"].find_one({"_id": payment_id})
        payment_source = "wallet"
    if not payment:
        payment = db["payments"].find_one({"_id": payment_id})
        payment_source = "legacy"

    if not payment:
        raise HTTPException(status_code=404, detail="Payment verification not found")

    is_admin = str(current_user.get("role", "")).lower() in {"admin", "super_admin"}
    if not is_admin:
        if payment_source == "bank" and str(payment.get("member_id")) != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Access denied")
        if payment_source in {"wallet", "legacy"} and str(payment.get("user_id")) != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Access denied")

    group = db["groups"].find_one({"_id": payment.get("group_id")})

    response = {
        "success": True,
        "payment_id": payment_id,
        "status": payment.get("status"),
        "amount": payment.get("amount"),
        "group_id": payment.get("group_id"),
        "group_name": group.get("name") if group else None,
        "payment_source": payment_source,
        "submitted_at": payment.get("submitted_at") or payment.get("created_at"),
    }

    if payment_source == "bank":
        response.update({
            "transaction_reference": payment.get("transaction_reference"),
            "proof_image": payment.get("proof_image"),
            "verified_at": payment.get("verified_at"),
            "admin_notes": payment.get("admin_notes"),
        })
    else:
        response.update({
            "transaction_reference": payment.get("receipt_number") or payment.get("transaction_reference"),
            "receipt_id": payment.get("receipt_id"),
            "wallet_pending": bool(payment.get("wallet_pending")),
        })

    return response

@router.get("/receipt/{receipt_id}")
async def get_receipt(
    receipt_id: str,
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """Get receipt HTML"""
    try:
        receipt_service = ReceiptService(db)
        receipt = receipt_service.get_receipt(receipt_id)
        if not receipt:
            receipt = receipt_service.get_receipt_by_number(receipt_id)

        if not receipt:
            raise HTTPException(status_code=404, detail="Receipt not found")

        is_admin = str(current_user.get("role", "")).lower() in {"admin", "super_admin"}
        if receipt.get("user_id") != str(current_user.get("_id")) and not is_admin:
            raise HTTPException(status_code=403, detail="Access denied")

        return {
            "success": True,
            "receipt": {
                "id": receipt["_id"],
                "receipt_number": receipt["receipt_number"],
                "html": receipt["html_content"],
                "status": receipt.get("status"),
                "created_at": receipt.get("created_at").isoformat() if receipt.get("created_at") else None,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get receipt error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve receipt")

@router.post("/verify/{payment_id}")
async def verify_payment(
    payment_id: str,
    request: PaymentVerificationRequest,
    background_tasks: BackgroundTasks,
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

        group = db["groups"].find_one({"_id": payment["group_id"]})
        member_user = db["users"].find_one({"_id": payment["member_id"]})
        group_name = group.get("name", "your group") if group else "your group"

        if request.status == "verified":
            # Get the group to access round number
            round_number = payment.get("round_number", group.get("current_round", 1))
            
            # Update member payment status with round-specific contribution tracking
            db["groups"].update_one(
                {"_id": payment["group_id"], "members.user_id": payment["member_id"]},
                {
                    "$set": {
                        "members.$.has_paid_current_round": True,
                        "members.$.payment_verified": True,
                        "members.$.last_payment_at": datetime.now(),
                        f"members.$.round_contributions.{round_number}": float(payment["amount"]),
                        "updated_at": datetime.now()
                    },
                    "$inc": {
                        "members.$.total_contributed": payment["amount"]
                    }
                }
            )

            # Recalculate group round summary using actual contributions
            group = db["groups"].find_one({"_id": payment["group_id"]})
            updated_members = list(group.get("members") or [])
            all_paid = all(bool(item.get("has_paid_current_round")) for item in updated_members)
            total_collected = current_round_total_collected(group, round_number)
            rules = dict(group.get("rules") or {})
            rules["ready_for_winner_selection"] = all_paid
            rules["current_round_fund"] = total_collected if all_paid else 0.0
            rules["last_contribution_received_at"] = utcnow()
            db["groups"].update_one(
                {"_id": payment["group_id"]},
                {"$set": {"rules": rules, "updated_at": utcnow()}}
            )

            round_payment = db["round_payments"].find_one({"group_id": payment["group_id"], "round_number": round_number}) or {
                "_id": f"rp_{payment['group_id']}_{round_number}",
                "group_id": payment["group_id"],
                "group_name": group.get("name"),
                "round_number": round_number,
                "total_collected": total_collected,
                "winner_id": None,
                "winner_amount": 0.0,
                "system_fee": 0.0,
                "status": "pending",
                "payment_status": {"all_members_paid": False, "paid_members": [], "pending_members": []},
                "created_at": utcnow(),
                "completed_at": None,
            }
            round_payment["total_collected"] = total_collected
            round_payment["payment_status"] = {
                "all_members_paid": all_paid,
                "paid_members": sorted({str(item.get("user_id")) for item in updated_members if item.get("has_paid_current_round")}),
                "pending_members": [str(item.get("user_id")) for item in updated_members if not item.get("has_paid_current_round")],
            }
            round_payment["updated_at"] = utcnow()
            db["round_payments"].replace_one({"_id": round_payment["_id"]}, round_payment, upsert=True)

        status_label = "verified" if request.status == "verified" else "rejected"
        notification_title = "Payment Approved" if request.status == "verified" else "Payment Rejected"
        notification_message = (
            f"Your ETB {payment.get('amount'):,.2f} payment proof for {group_name} has been {'approved' if request.status == 'verified' else 'rejected'}."
        )

        _push_notification(
            db,
            payment["member_id"],
            notification_title,
            notification_message,
            ntype="payment",
            priority="high",
            link=f"/groups/{payment['group_id']}",
            metadata={"payment_id": payment_id, "group_id": payment["group_id"], "amount": payment.get("amount")},
        )

        if member_user and member_user.get("email"):
            try:
                email_subject = f"DigiEqub Payment {status_label.title()}"
                email_body = (
                    f"<html><body><p>Hello {member_user.get('full_name', 'Member')},</p>"
                    f"<p>Your payment proof for {group_name} of ETB {payment.get('amount'):,.2f} has been {status_label}.</p>"
                    f"{f'<p>Admin note: {request.admin_notes}</p>' if request.admin_notes else ''}"
                    f"<p>Visit DigiEqub to review the details and continue.</p>"
                    f"</body></html>"
                )

                def queue_email(recipient: str, subject: str, body: str):
                    async def _send():
                        try:
                            from ...services.otp_service import OTPService
                            svc = OTPService()
                            if await svc._send_via_sendgrid(recipient, subject, body):
                                return
                            await svc._send_via_smtp(recipient, subject, body)
                        except Exception as exc:
                            logger.warning(f"Failed to send payment verification email: {str(exc)}")

                    try:
                        loop = asyncio.get_running_loop()
                        loop.create_task(_send())
                    except RuntimeError:
                        threading.Thread(target=lambda: asyncio.run(_send()), daemon=True).start()

                background_tasks.add_task(queue_email, member_user.get("email"), email_subject, email_body)
            except Exception as exc:
                logger.warning(f"Failed to queue approval email: {str(exc)}")

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


# ============= WALLET PAYMENT ENDPOINTS (AUTO-RECEIPT) =============

class WalletPaymentRequest(BaseModel):
    """Request for wallet-based payment with auto receipt"""
    group_id: str
    amount: float = Field(..., gt=0)
    round_number: int = 1
    payment_type: str = "contribution"


@router.post("/submit-via-wallet")
async def submit_wallet_payment(
    request: WalletPaymentRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """
    Submit payment via DigiEqub wallet with automatic receipt generation
    
    Flow:
    1. Validates group membership
    2. Validates wallet balance
    3. Auto-generates receipt (HTML)
    4. Creates pending payment record
    5. Sends async notification (non-blocking)
    6. Returns pending status to user
    7. Admin reviews and approves
    8. Upon approval, wallet is debited
    """
    try:
        from ...services.receipt_service import ReceiptService
        import uuid
        
        # Validate group exists and user is member
        group = db["groups"].find_one({"_id": request.group_id})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        is_member = any(str(m.get("user_id")) == str(current_user["_id"]) for m in group.get("members", []))
        if not is_member:
            raise HTTPException(status_code=403, detail="You are not a member of this group")
        
        # Validate wallet balance
        wallet = db["wallets"].find_one({"user_id": str(current_user["_id"])})
        if not wallet or float(wallet.get("balance", 0)) < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
        # Generate payment ID and receipt
        payment_id = f"pw_{str(uuid.uuid4())[:12]}"
        receipt_service = ReceiptService(db)
        
        receipt = receipt_service.create_auto_receipt(
            user_id=str(current_user["_id"]),
            group_id=request.group_id,
            group_name=group.get("name", "Unknown Group"),
            user_name=current_user.get("full_name", current_user.get("username", "Unknown User")),
            amount=request.amount,
            round_number=request.round_number,
            payment_method="DigiEqub Wallet",
            transaction_reference=payment_id
        )
        
        # Create pending payment record
        payment_record = {
            "_id": payment_id,
            "user_id": str(current_user["_id"]),
            "group_id": request.group_id,
            "group_name": group.get("name"),
            "user_name": current_user.get("full_name"),
            "amount": request.amount,
            "currency": "ETB",
            "payment_type": request.payment_type,
            "round_number": request.round_number,
            "payment_method": "wallet",
            "status": "pending",  # pending -> approved -> completed
            "receipt_id": receipt["_id"],
            "receipt_number": receipt["receipt_number"],
            "wallet_pending": True,  # Flag: wallet deduction pending approval
            "created_at": utcnow(),
            "updated_at": utcnow(),
            "approved_at": None,
            "approved_by": None,
            "admin_notes": None
        }
        
        db["wallet_payments"].insert_one(payment_record)
        
        # Send notification asynchronously (doesn't block response)
        try:
            _push_notification(
                db,
                str(current_user["_id"]),
                "Payment Submitted",
                f"Your payment of ETB {request.amount:,.2f} for {group.get('name')} has been submitted and is pending admin approval.",
                ntype="payment",
                priority="medium",
                link=f"/groups/{request.group_id}",
                metadata={"payment_id": payment_id, "receipt_number": receipt["receipt_number"]}
            )

            if current_user.get("email"):
                async def send_payment_email(recipient: str, subject: str, body: str):
                    try:
                        from ...services.otp_service import OTPService
                        svc = OTPService()
                        if await svc._send_via_sendgrid(recipient, subject, body):
                            return
                        await svc._send_via_smtp(recipient, subject, body)
                    except Exception as e:
                        logger.warning(f"Failed to send wallet payment notification email: {str(e)}")

                email_subject = "Payment Submitted - Pending Admin Approval"
                email_body = (
                    f"<html><body><p>Hello {current_user.get('full_name', 'Member')},</p>"
                    f"<p>Your payment of ETB {request.amount:,.2f} for {group.get('name')} has been submitted.</p>"
                    f"<p>Receipt Number: {receipt['receipt_number']}</p>"
                    f"<p>Status: Pending Admin Approval</p>"
                    f"<p>You will receive an email notification once the admin reviews your payment.</p>"
                    f"</body></html>"
                )
                background_tasks.add_task(send_payment_email, current_user.get("email"), email_subject, email_body)
        except Exception as e:
            logger.warning(f"Failed to send notifications: {str(e)}")
        
        return {
            "success": True,
            "message": "Payment submitted successfully. Awaiting admin approval.",
            "payment_id": payment_id,
            "receipt_id": receipt["_id"],
            "receipt_number": receipt["receipt_number"],
            "status": "pending",
            "amount": request.amount,
            "created_at": payment_record["created_at"].isoformat() if hasattr(payment_record["created_at"], "isoformat") else str(payment_record["created_at"])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Wallet payment submission error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Payment submission failed: {str(e)}")


@router.post("/approve-wallet/{payment_id}")
async def approve_wallet_payment(
    payment_id: str,
    background_tasks: BackgroundTasks,
    request: dict = Body(...),
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """
    Approve wallet payment and process deduction
    
    Admin flow:
    1. Reviews payment details
    2. Approves payment
    3. System debits wallet
    4. Updates group member payment status
    5. Sends confirmation to user
    """
    try:
        # Check if admin
        if str(current_user.get("role", "")).lower() not in {"admin", "super_admin"}:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        payment = db["wallet_payments"].find_one({"_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if payment["status"] != "pending":
            raise HTTPException(status_code=400, detail=f"Payment already {payment['status']}")
        
        from ...services.receipt_service import ReceiptService
        
        receipt_service = ReceiptService(db)
        notes = request.get("notes", "")
        
        # Approve receipt
        receipt_service.approve_receipt(payment["receipt_id"], str(current_user["_id"]))
        
        # Debit wallet
        try:
            db["wallets"].update_one(
                {"user_id": payment["user_id"]},
                {
                    "$inc": {"balance": -payment["amount"]},
                    "$set": {"updated_at": utcnow()}
                }
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Wallet deduction failed: {str(e)}")
        
        # Update member payment status
        db["groups"].update_one(
            {"_id": payment["group_id"], "members.user_id": payment["user_id"]},
            {
                "$set": {
                    "members.$.has_paid_current_round": True,
                    "members.$.payment_verified": True,
                    "members.$.last_payment_at": utcnow(),
                    f"members.$.round_contributions.{payment['round_number']}": float(payment["amount"]),
                    "updated_at": utcnow()
                },
                "$inc": {"members.$.total_contributed": payment["amount"]}
            }
        )
        
        # Update payment status
        db["wallet_payments"].update_one(
            {"_id": payment_id},
            {
                "$set": {
                    "status": "completed",
                    "approved_by": str(current_user["_id"]),
                    "approved_at": utcnow(),
                    "updated_at": utcnow(),
                    "admin_notes": notes,
                    "wallet_pending": False
                }
            }
        )
        
        # Send confirmation asynchronously
        try:
            member_user = db["users"].find_one({"_id": payment["user_id"]})
            if member_user and member_user.get("email"):
                async def send_approval_email(recipient: str, subject: str, body: str):
                    try:
                        from ...services.otp_service import OTPService
                        svc = OTPService()
                        if await svc._send_via_sendgrid(recipient, subject, body):
                            return
                        await svc._send_via_smtp(recipient, subject, body)
                    except Exception as e:
                        logger.warning(f"Failed to send wallet approval email: {str(e)}")

                email_subject = f"Payment Approved - {payment['group_name']}"
                email_body = (
                    f"<html><body><p>Hello {payment.get('user_name', 'Member')},</p>"
                    f"<p>Your payment of ETB {payment['amount']:,.2f} has been approved and processed.</p>"
                    f"<p>Receipt Number: {payment['receipt_number']}</p>"
                    f"<p>Your wallet balance has been updated.</p>"
                    f"</body></html>"
                )
                background_tasks.add_task(send_approval_email, member_user.get("email"), email_subject, email_body)

            _push_notification(
                db,
                payment["user_id"],
                "Payment Approved",
                f"Your payment of ETB {payment['amount']:,.2f} has been approved.",
                ntype="payment",
                priority="high",
                link=f"/groups/{payment['group_id']}"
            )
        except Exception as e:
            logger.warning(f"Failed to send confirmation: {str(e)}")
        
        return {
            "success": True,
            "message": "Payment approved and processed successfully",
            "payment_id": payment_id,
            "status": "completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment approval error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Payment approval failed: {str(e)}")


@router.get("/wallet-payments/pending")
async def get_pending_wallet_payments(
    group_id: Optional[str] = None,
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """Get pending wallet payments (admin only)"""
    try:
        if str(current_user.get("role", "")).lower() not in {"admin", "super_admin"}:
            raise HTTPException(status_code=403, detail="Admin access required")

        query = {
            "status": "pending",
            "$or": [
                {"wallet_pending": True},
                {"payment_method": "wallet"},
                {"payment_type": "wallet"}
            ]
        }
        if group_id:
            query["group_id"] = group_id

        payments = list(db["wallet_payments"].find(query).sort("created_at", -1))

        return {
            "success": True,
            "payments": payments,
            "count": len(payments)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get pending wallet payments error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wallet-payments/status/{payment_id}")
async def get_wallet_payment_status(
    payment_id: str,
    current_user=Depends(get_current_active_user),
    db=Depends(get_db)
):
    """Get wallet payment status"""
    try:
        payment = db["wallet_payments"].find_one({"_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Check access: user who created it or admin
        if payment["user_id"] != str(current_user["_id"]) and str(current_user.get("role", "")).lower() not in {"admin", "super_admin"}:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "payment_id": payment_id,
            "status": payment["status"],
            "amount": payment["amount"],
            "receipt_number": payment.get("receipt_number"),
            "created_at": payment["created_at"].isoformat() if hasattr(payment["created_at"], "isoformat") else str(payment["created_at"]),
            "approved_at": payment["approved_at"].isoformat() if (payment.get("approved_at") and hasattr(payment["approved_at"], "isoformat")) else (payment.get("approved_at") if payment.get("approved_at") else None)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get wallet payment status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
