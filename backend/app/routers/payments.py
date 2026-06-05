"""
Payment Router - Handles wallet-based payments with automatic receipt generation
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pymongo.database import Database
from datetime import datetime
import uuid

from app.core.database import get_db
from app.dependencies import get_current_user
from app.services.receipt_service import ReceiptService
from app.services.wallet_service import WalletService
from app.services.notification_service import NotificationService
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


class WalletPaymentRequest(BaseModel):
    """Request for wallet-based payment"""
    group_id: str
    amount: float = Field(..., gt=0)
    round_number: int = 1
    payment_type: str = "contribution"  # contribution, partial_payment, etc.


class WalletPaymentResponse(BaseModel):
    """Response for wallet payment"""
    success: bool
    message: str
    payment_id: str
    receipt_id: str
    receipt_number: str
    status: str  # pending, approved, rejected
    amount: float
    created_at: str


class ApprovePaymentRequest(BaseModel):
    """Request to approve payment"""
    receipt_id: str
    notes: Optional[str] = None


class AdminPaymentResponse(BaseModel):
    """Response for admin payment action"""
    success: bool
    message: str
    receipt_id: str
    status: str


@router.post("/submit-via-wallet", response_model=WalletPaymentResponse)
async def submit_wallet_payment(
    payment_req: WalletPaymentRequest,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """
    Submit payment via DigiEqub wallet with automatic receipt generation
    
    - Automatically generates receipt
    - Uploads receipt to storage
    - Sets payment to pending admin approval
    - Sends notification (doesn't block payment)
    - Returns pending status to user
    """
    try:
        receipt_service = ReceiptService(db)
        wallet_service = WalletService(db)
        notification_service = NotificationService(db)
        
        # Validate group exists
        group = db.groups.find_one({"_id": payment_req.group_id})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Validate user wallet balance
        wallet = wallet_service.get_wallet_by_user_id(current_user["_id"])
        if not wallet or float(wallet.get("balance", 0)) < payment_req.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
        # Get group name and user name
        group_name = group.get("name", "Unknown Group")
        user_name = current_user.get("full_name", current_user.get("username", "Unknown User"))
        
        # Generate unique payment ID
        payment_id = f"pv_{uuid.uuid4().hex[:16]}"
        
        # Auto-generate receipt
        receipt = receipt_service.create_auto_receipt(
            user_id=current_user["_id"],
            group_id=payment_req.group_id,
            group_name=group_name,
            user_name=user_name,
            amount=payment_req.amount,
            round_number=payment_req.round_number,
            payment_method="DigiEqub Wallet",
            transaction_reference=payment_id
        )
        
        # Create payment record with PENDING status
        payment_record = {
            "_id": payment_id,
            "user_id": current_user["_id"],
            "group_id": payment_req.group_id,
            "group_name": group_name,
            "user_name": user_name,
            "amount": payment_req.amount,
            "currency": "ETB",
            "payment_type": payment_req.payment_type,
            "round_number": payment_req.round_number,
            "payment_method": "wallet",
            "status": "pending",  # pending, approved, rejected, completed
            "receipt_id": receipt["_id"],
            "receipt_number": receipt["receipt_number"],
            "wallet_pending": True,  # Flag for pending wallet deduction
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "approved_at": None,
            "approved_by": None,
            "meta": {
                "device": "web",
                "ip": None
            }
        }
        
        # Insert payment record
        db.payments.insert_one(payment_record)
        
        # Send notification asynchronously (doesn't block response)
        try:
            notification_service.send_email_async(
                recipient=current_user.get("email"),
                subject=f"Payment Submitted - {group_name}",
                template="payment_submitted",
                context={
                    "user_name": user_name,
                    "amount": payment_req.amount,
                    "group_name": group_name,
                    "payment_id": payment_id,
                    "receipt_number": receipt["receipt_number"],
                    "status": "pending"
                }
            )
        except Exception as e:
            # Log error but don't fail the payment process
            print(f"Email notification failed: {str(e)}")
        
        return WalletPaymentResponse(
            success=True,
            message="Payment submitted successfully. Awaiting admin approval.",
            payment_id=payment_id,
            receipt_id=receipt["_id"],
            receipt_number=receipt["receipt_number"],
            status="pending",
            amount=payment_req.amount,
            created_at=payment_record["created_at"].isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment submission failed: {str(e)}")


@router.get("/pending/{group_id}")
async def get_pending_payments(
    group_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get pending payments for a group (admin only)"""
    try:
        # Check if admin
        if not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        payments = list(
            db.payments.find({
                "group_id": group_id,
                "status": "pending"
            })
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        
        total = db.payments.count_documents({
            "group_id": group_id,
            "status": "pending"
        })
        
        return {
            "success": True,
            "payments": payments,
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/approve/{payment_id}")
async def approve_payment(
    payment_id: str,
    request: ApprovePaymentRequest,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """
    Approve a payment and process wallet deduction
    
    - Verifies receipt
    - Deducts from user wallet
    - Updates payment status to completed
    - Sends confirmation email
    """
    try:
        # Check if admin
        if not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        payment = db.payments.find_one({"_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if payment["status"] != "pending":
            raise HTTPException(status_code=400, detail=f"Payment already {payment['status']}")
        
        receipt_service = ReceiptService(db)
        wallet_service = WalletService(db)
        notification_service = NotificationService(db)
        
        # Approve receipt
        receipt_service.approve_receipt(
            payment["receipt_id"],
            current_user["_id"]
        )
        
        # Process wallet deduction
        try:
            wallet_service.deduct_balance(
                user_id=payment["user_id"],
                amount=payment["amount"],
                transaction_type="group_contribution",
                reference=payment_id,
                description=f"Payment for {payment['group_name']} - Round {payment['round_number']}"
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Wallet deduction failed: {str(e)}")
        
        # Update payment status
        db.payments.update_one(
            {"_id": payment_id},
            {
                "$set": {
                    "status": "completed",
                    "approved_by": current_user["_id"],
                    "approved_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "admin_notes": request.notes
                }
            }
        )
        
        # Send confirmation email asynchronously
        try:
            user = db.users.find_one({"_id": payment["user_id"]})
            notification_service.send_email_async(
                recipient=user.get("email"),
                subject=f"Payment Approved - {payment['group_name']}",
                template="payment_approved",
                context={
                    "user_name": payment["user_name"],
                    "amount": payment["amount"],
                    "group_name": payment["group_name"],
                    "payment_id": payment_id,
                    "receipt_number": payment["receipt_number"]
                }
            )
        except Exception as e:
            print(f"Confirmation email failed: {str(e)}")
        
        return AdminPaymentResponse(
            success=True,
            message="Payment approved and processed successfully",
            receipt_id=payment["receipt_id"],
            status="completed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment approval failed: {str(e)}")


@router.post("/reject/{payment_id}")
async def reject_payment(
    payment_id: str,
    request: dict,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """
    Reject a payment
    
    - Sets payment status to rejected
    - Sends rejection email with reason
    """
    try:
        # Check if admin
        if not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        payment = db.payments.find_one({"_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if payment["status"] != "pending":
            raise HTTPException(status_code=400, detail=f"Payment already {payment['status']}")
        
        receipt_service = ReceiptService(db)
        notification_service = NotificationService(db)
        
        rejection_reason = request.get("reason", "Admin decision")
        
        # Reject receipt
        receipt_service.reject_receipt(
            payment["receipt_id"],
            current_user["_id"],
            rejection_reason
        )
        
        # Update payment status
        db.payments.update_one(
            {"_id": payment_id},
            {
                "$set": {
                    "status": "rejected",
                    "rejected_by": current_user["_id"],
                    "rejected_at": datetime.utcnow(),
                    "rejection_reason": rejection_reason,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Send rejection email asynchronously
        try:
            user = db.users.find_one({"_id": payment["user_id"]})
            notification_service.send_email_async(
                recipient=user.get("email"),
                subject=f"Payment Rejected - {payment['group_name']}",
                template="payment_rejected",
                context={
                    "user_name": payment["user_name"],
                    "amount": payment["amount"],
                    "group_name": payment["group_name"],
                    "reason": rejection_reason
                }
            )
        except Exception as e:
            print(f"Rejection email failed: {str(e)}")
        
        return AdminPaymentResponse(
            success=True,
            message="Payment rejected",
            receipt_id=payment["receipt_id"],
            status="rejected"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment rejection failed: {str(e)}")


@router.get("/status/{payment_id}")
async def get_payment_status(
    payment_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get payment status"""
    try:
        payment = db.payments.find_one({"_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Check if user owns payment or is admin
        if payment["user_id"] != current_user["_id"] and not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "payment_id": payment_id,
            "status": payment["status"],
            "amount": payment["amount"],
            "receipt_number": payment.get("receipt_number"),
            "created_at": payment["created_at"].isoformat(),
            "approved_at": payment.get("approved_at").isoformat() if payment.get("approved_at") else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/receipt/{receipt_id}")
async def get_receipt(
    receipt_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get receipt HTML"""
    try:
        receipt_service = ReceiptService(db)
        receipt = receipt_service.get_receipt(receipt_id)
        if not receipt:
            receipt = receipt_service.get_receipt_by_number(receipt_id)
        
        if not receipt:
            raise HTTPException(status_code=404, detail="Receipt not found")
        
        # Check access: user who created it or admin
        is_admin_user = current_user.get("is_admin", False) or str(current_user.get("role", "")).lower() in {"admin", "super_admin"}
        if receipt["user_id"] != current_user["_id"] and not is_admin_user:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "receipt": {
                "id": receipt["_id"],
                "receipt_number": receipt["receipt_number"],
                "html": receipt["html_content"],
                "status": receipt["status"],
                "created_at": receipt["created_at"].isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
