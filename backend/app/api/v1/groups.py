from __future__ import annotations

import random
import string
from datetime import timedelta
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from pydantic import BaseModel, Field
from pymongo.database import Database

from ...core.database import get_db
from ...core.mongo_utils import current_round_number, group_member_doc, group_total_rounds, new_id, utcnow
from ...dependencies import get_current_active_user
from ...schemas.group import (
    ComprehensiveGroupCreate,
    ComprehensiveGroupCreateResponse,
    ComprehensiveGroupPayload,
    GroupDetailResponse,
    GroupMemberResponse,
    GroupNameValidationResponse,
    GroupResponse,
    GroupWinnersResponse,
    JoinCodeResponse,
    JoinGroup,
    WinnerBidCreate,
    WinnerBidResponse,
    WinnerSelectionRequest,
)
from ...services.cbe_service import CommercialBankOfEthiopiaService
from ...services.bank_payment_service import BankPaymentService
from ...services.winner_service import WinnerService

router = APIRouter()


def _generate_join_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def _group_response(group: dict) -> dict:
    return {
        "id": group["_id"],
        "name": group["name"],
        "description": group.get("description"),
        "contribution_amount": group.get("contribution_amount", 0),
        "frequency": group.get("frequency", "weekly"),
        "duration_weeks": group.get("duration_weeks", 1),
        "max_members": group.get("max_members", 1),
        "is_private": bool(group.get("is_private", False)),
        "rules": group.get("rules", {}),
        "status": group.get("status", "pending"),
        "current_members": group.get("current_members", len(group.get("members", []))),
        "contract_address": group.get("contract_address"),
        "created_by": group.get("created_by"),
        "start_date": group.get("start_date"),
        "end_date": group.get("end_date"),
        "join_code": group.get("join_code"),
        "created_at": group.get("created_at"),
    }


def _group_detail_response(group: dict) -> dict:
    members = [
        {
            "user_id": member["user_id"],
            "full_name": member.get("full_name", "Unknown"),
            "email": member.get("email", ""),
            "joined_at": member.get("joined_at") or utcnow(),
            "position": member.get("position"),
            "contribution_count": int(member.get("contribution_count") or 0),
            "total_contributed": float(member.get("total_contributed") or 0),
            "next_payment_due": member.get("next_payment_due"),
        }
        for member in group.get("members", [])
    ]
    total_contributions = sum(float(member.get("total_contributed", 0)) for member in group.get("members", []))
    total_rounds = group_total_rounds(group)
    return {
        **_group_response(group),
        "creator": {
            "id": group.get("created_by"),
            "full_name": group.get("creator_name", "Unknown"),
            "email": group.get("creator_email", ""),
        },
        "members": members,
        "total_contributions": total_contributions,
        "next_payout_amount": float(group.get("contribution_amount", 0) * max(group.get("current_members", 1), 1)),
        "next_payout_date": group.get("start_date"),
    }


def _is_admin(current_user: dict, group: dict) -> bool:
    return current_user.get("role") in {"admin", "super_admin", "ADMIN", "SUPER_ADMIN"} or str(group.get("created_by")) == str(current_user["_id"])


def _get_system_admin(db: Database) -> dict:
    admin = db["users"].find_one({"email": CommercialBankOfEthiopiaService.ADMIN_ACCOUNT["email"]})
    if not admin:
        raise HTTPException(status_code=500, detail="System admin account is not configured")
    return admin


@router.get("/validate-name", response_model=GroupNameValidationResponse)
async def validate_group_name(name: str = Query(..., min_length=3, max_length=50), db: Database = Depends(get_db)):
    normalized_name = " ".join(name.split())
    existing = db["groups"].find_one({"name_lower": normalized_name.lower()})
    return {"available": existing is None, "normalized_name": normalized_name}


@router.post("/generate-join-code", response_model=JoinCodeResponse)
async def generate_join_code(db: Database = Depends(get_db)):
    join_code = _generate_join_code()
    while db["groups"].find_one({"join_code": join_code}):
        join_code = _generate_join_code()
    return {"success": True, "join_code": join_code}


@router.post("/create", response_model=ComprehensiveGroupCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_comprehensive_group(payload: ComprehensiveGroupCreate, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    normalized_name = " ".join(payload.name.split())
    if db["groups"].find_one({"name_lower": normalized_name.lower()}):
        raise HTTPException(status_code=409, detail="Group name already exists")
    if current_user.get("is_participant") is False:
        raise HTTPException(status_code=403, detail="Admin accounts cannot participate in groups")
    if not current_user.get("bank_account"):
        raise HTTPException(status_code=403, detail="You must have a Commercial Bank of Ethiopia account to create a group")

    bank_service = CommercialBankOfEthiopiaService()
    verification = await bank_service.verify_account_ownership(
        current_user["bank_account"]["account_number"],
        current_user["bank_account"]["account_name"]
    )
    if not verification.get("success"):
        raise HTTPException(status_code=400, detail="Your Commercial Bank of Ethiopia account could not be verified")

    join_code = _generate_join_code()
    while db["groups"].find_one({"join_code": join_code}):
        join_code = _generate_join_code()
    now = utcnow()
    system_admin = _get_system_admin(db)
    creator_member = group_member_doc(current_user, 0)
    group = {
        "_id": new_id(),
        "name": normalized_name,
        "name_lower": normalized_name.lower(),
        "description": payload.description,
        "contribution_amount": payload.contribution_amount,
        "frequency": payload.frequency,
        "duration_weeks": payload.duration_weeks,
        "total_rounds": payload.duration_weeks if payload.frequency != "daily" else payload.duration_weeks * 7,
        "current_round": 1,
        "max_members": payload.max_members,
        "current_members": 1,
        "status": "active",  # Changed from "pending" to "active" for permanent groups
        "contract_address": None,
        "blockchain_tx_hash": None,
        "created_by": current_user["_id"],
        "creator_name": current_user.get("full_name", "Unknown"),
        "creator_email": current_user.get("email", ""),
        "admin_id": system_admin["_id"],
        "admin_email": system_admin.get("email"),
        "admin_name": system_admin.get("full_name"),
        "admin_bank_account": {
            "bank_name": CommercialBankOfEthiopiaService.BANK_NAME,
            "bank_code": CommercialBankOfEthiopiaService.BANK_CODE,
            "account_number": CommercialBankOfEthiopiaService.ADMIN_ACCOUNT["account_number"],
            "account_name": CommercialBankOfEthiopiaService.ADMIN_ACCOUNT["account_name"],
        },
        "start_date": now,  # Set start date immediately for active groups
        "end_date": now + timedelta(weeks=int(payload.duration_weeks)),  # Set end date immediately for active groups
        "rules": {
            "group_type": payload.group_type,
            "currency": payload.currency,
            "privacy": payload.privacy,
            "approval_required": payload.approval_required,
            "late_penalty": payload.late_penalty,
            "grace_period_days": payload.grace_period_days,
            "early_withdrawal": payload.early_withdrawal,
            "rules": payload.rules or "",
            "invite_emails": payload.invite_emails,
            "invite_phones": payload.invite_phones,
            "total_fund": payload.contribution_amount * payload.max_members,
            "remaining_fund": payload.contribution_amount * payload.max_members,
            "winner_payout_percent": 75,
            "system_wallet_percent": 25,
            "system_wallet_balance": 0,
            "system_wallet_label": "DigiEqub Earnings Wallet",
            "winner_selection_method": payload.group_type if payload.group_type == "bid" else "random",
            "winner_history": [],
            "winner_bids": [],
            "notification_history": [],
        },
        "round_status": {},
        "is_private": payload.privacy == "private",
        "join_code": join_code,
        "members": [creator_member],
        "created_at": now,
        "updated_at": now,
    }
    db["groups"].insert_one(group)
    return {
        "success": True,
        "group_id": group["_id"],
        "group": {
            "_id": group["_id"],
            "name": group["name"],
            "join_code": join_code,
            "contract_address": "",
            "total_fund": group["rules"]["total_fund"],
            "created_at": now,
            "invite_links": {"email": [], "sms": []},
        },
    }


@router.get("/", response_model=List[GroupResponse])
async def get_groups(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), status: Optional[str] = None, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    query = {}
    if status:
        query["status"] = status
    groups = list(db["groups"].find(query).sort("created_at", -1).skip(skip).limit(limit))
    return [_group_response(group) for group in groups]


@router.get("/my-groups", response_model=List[GroupResponse])
async def get_my_groups(current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    groups = list(db["groups"].find({"$or": [{"created_by": current_user["_id"]}, {"members.user_id": current_user["_id"]}]}).sort("created_at", -1))
    return [_group_response(group) for group in groups]


@router.get("/active")
async def get_active_groups(current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    groups = list(db["groups"].find({"status": "active", "members.user_id": current_user["_id"]}))
    items = []
    for group in groups:
        member = next((item for item in group.get("members", []) if str(item.get("user_id")) == str(current_user["_id"])), None)
        items.append(
            {
                "id": group["_id"],
                "name": group["name"],
                "description": group.get("description"),
                "status": group.get("status"),
                "contribution_amount": float(group.get("contribution_amount", 0)),
                "frequency": group.get("frequency"),
                "current_members": group.get("current_members", len(group.get("members", []))),
                "max_members": group.get("max_members"),
                "current_round": current_round_number(group),
                "total_rounds": group_total_rounds(group),
                "progress_pct": round(min((int((member or {}).get("contribution_count") or 0) / max(group_total_rounds(group), 1)) * 100, 100), 1),
                "your_position": int((member or {}).get("position") or 0) + 1,
                "total_contributed": float((member or {}).get("total_contributed") or 0),
                "next_payment_due": (member or {}).get("next_payment_due"),
                "next_payout_date": group.get("start_date"),
                "member_previews": [{"id": item.get("user_id"), "initials": "".join((item.get("full_name", "U").split()[:2])).upper()[:2]} for item in group.get("members", [])[:5]],
            }
        )
    return items


@router.get("/{group_id}", response_model=GroupDetailResponse)
async def get_group_detail(group_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return _group_detail_response(group)


@router.get("/{group_id}/winners", response_model=GroupWinnersResponse)
async def get_group_winners(group_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"success": True, "winners": WinnerService(db).get_group_winners(group_id), "round_number": current_round_number(group)}


@router.get("/{group_id}/winners/mongo")
async def get_group_winners_from_mongo(group_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"success": True, "winners": WinnerService(db).get_group_winners(group_id), "round_number": current_round_number(group), "source": "mongodb"}


@router.post("/{group_id}/winner-bids", response_model=WinnerBidResponse)
async def place_winner_bid(group_id: str, payload: WinnerBidCreate, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if not any(str(member.get("user_id")) == str(current_user["_id"]) for member in group.get("members", [])):
        raise HTTPException(status_code=403, detail="Only group members can bid")
    if str(current_user["_id"]) != str(payload.member_id) and not _is_admin(current_user, group):
        raise HTTPException(status_code=403, detail="You can only place a bid for yourself")
    round_number = current_round_number(group)
    bids = list((group.get("rules") or {}).get("winner_bids", []))
    member = next((item for item in group.get("members", []) if str(item.get("user_id")) == str(payload.member_id)), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in this group")
    bid_entry = {"id": f"bid-{payload.member_id}-{round_number}", "round": round_number, "member_id": str(payload.member_id), "member_name": member.get("full_name", "Unknown"), "amount": float(payload.amount), "created_at": utcnow(), "status": "active"}
    bids = [bid for bid in bids if not (int(bid.get("round", 0)) == round_number and str(bid.get("member_id")) == str(payload.member_id))]
    bids.insert(0, bid_entry)
    rules = dict(group.get("rules") or {})
    rules["winner_bids"] = bids
    rules["winner_selection_method"] = "bid"
    db["groups"].update_one({"_id": group["_id"]}, {"$set": {"rules": rules, "updated_at": utcnow()}})
    current_round_bids = sorted([bid for bid in bids if int(bid.get("round", 0)) == round_number], key=lambda item: float(item.get("amount", 0)), reverse=True)
    return {"success": True, "bid": bid_entry, "bids": current_round_bids, "round_number": round_number}


@router.post("/{group_id}/select-winner")
async def select_group_winner(group_id: str, payload: WinnerSelectionRequest, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if not _is_admin(current_user, group):
        raise HTTPException(status_code=403, detail="Only the group admin can select a winner")
    try:
        return WinnerService(db).select_weekly_winner(group_id, payload.method)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{group_id}/join")
async def join_group(group_id: str, join_data: Optional[JoinGroup] = None, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if current_user.get("is_participant") is False:
        raise HTTPException(status_code=403, detail="Admin accounts cannot join groups")
    if any(str(member.get("user_id")) == str(current_user["_id"]) for member in group.get("members", [])):
        raise HTTPException(status_code=400, detail="Already a member of this group")
    if group.get("is_private") and (not join_data or join_data.join_code != group.get("join_code")):
        raise HTTPException(status_code=403, detail="Invalid join code")
    if int(group.get("current_members", len(group.get("members", [])))) >= int(group.get("max_members", 0)):
        raise HTTPException(status_code=400, detail="Group is full")
    if not current_user.get("bank_account"):
        raise HTTPException(status_code=403, detail="You must have a Commercial Bank of Ethiopia account to join this group")

    bank_service = CommercialBankOfEthiopiaService()
    verification = await bank_service.verify_account_ownership(
        current_user["bank_account"]["account_number"],
        current_user["bank_account"]["account_name"]
    )
    if not verification.get("success"):
        raise HTTPException(status_code=400, detail="Your Commercial Bank of Ethiopia account could not be verified")
    members = list(group.get("members", []))
    members.append(group_member_doc(current_user, len(members)))
    db["groups"].update_one({"_id": group["_id"]}, {"$set": {"members": members, "current_members": len(members), "updated_at": utcnow()}})
    return {"message": "Successfully joined group"}


@router.post("/{group_id}/leave")
async def leave_group(group_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    members = [member for member in group.get("members", []) if str(member.get("user_id")) != str(current_user["_id"])]
    if len(members) == len(group.get("members", [])):
        raise HTTPException(status_code=400, detail="Not a member of this group")
    if str(group.get("created_by")) == str(current_user["_id"]) and len(members) > 0:
        raise HTTPException(status_code=400, detail="Creator cannot leave group with members. Transfer ownership or disband group")
    db["groups"].update_one({"_id": group["_id"]}, {"$set": {"members": members, "current_members": len(members), "updated_at": utcnow()}})
    return {"message": "Successfully left group"}


@router.get("/{group_id}/members", response_model=List[GroupMemberResponse])
async def get_group_members(group_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return [
        {
            "user_id": member["user_id"],
            "full_name": member.get("full_name", "Unknown"),
            "email": member.get("email", ""),
            "joined_at": member.get("joined_at") or utcnow(),
            "position": member.get("position"),
            "contribution_count": int(member.get("contribution_count") or 0),
            "total_contributed": float(member.get("total_contributed") or 0),
            "next_payment_due": member.get("next_payment_due"),
        }
        for member in group.get("members", [])
    ]


@router.post("/{group_id}/members/{user_id}/mark-paid")
async def mark_member_paid(group_id: str, user_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if not _is_admin(current_user, group):
        raise HTTPException(status_code=403, detail="Only admins can mark payments")

    round_number = int(group.get("current_round") or current_round_number(group))
    updated_members = []
    changed = False
    for member in group.get("members", []):
        if str(member.get("user_id")) == str(user_id):
            rounds_completed = list(member.get("rounds_completed") or [])
            if round_number not in rounds_completed:
                rounds_completed.append(round_number)
            member = {
                **member,
                "has_paid_current_round": True,
                "rounds_completed": sorted(set(int(item) for item in rounds_completed)),
                "contribution_count": max(int(member.get("contribution_count") or 0), round_number),
                "total_contributed": float(member.get("total_contributed") or 0) + float(group.get("contribution_amount") or 0),
                "next_payment_due": member.get("next_payment_due") or utcnow(),
            }
            changed = True
        updated_members.append(member)

    if not changed:
        raise HTTPException(status_code=404, detail="Member not found in group")

    all_paid = all(bool(item.get("has_paid_current_round")) for item in updated_members)
    rules = dict(group.get("rules") or {})
    rules["ready_for_winner_selection"] = all_paid
    rules["current_round_fund"] = round(float(group.get("contribution_amount") or 0) * len(updated_members), 2) if all_paid else 0.0
    rules["last_contribution_received_at"] = utcnow()

    payment_doc = db["round_payments"].find_one({"group_id": str(group_id), "round_number": round_number}) or {
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
        "created_at": utcnow(),
        "completed_at": None,
    }
    paid_members = sorted({str(item.get("user_id")) for item in updated_members if item.get("has_paid_current_round")})
    pending_members = [str(item.get("user_id")) for item in updated_members if not item.get("has_paid_current_round")]
    payment_doc["payment_status"] = {
        "all_members_paid": all_paid,
        "paid_members": paid_members,
        "pending_members": pending_members,
    }
    payment_doc["updated_at"] = utcnow()
    db["round_payments"].replace_one({"_id": payment_doc["_id"]}, payment_doc, upsert=True)

    db["groups"].update_one(
        {"_id": group["_id"]},
        {"$set": {"members": updated_members, "rules": rules, "updated_at": utcnow()}},
    )
    return {"success": True, "message": "Member marked as paid", "ready_for_winner_selection": all_paid}


@router.post("/{group_id}/start")
async def start_group(group_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if not _is_admin(current_user, group):
        raise HTTPException(status_code=403, detail="Only group creator can start the group")
    now = utcnow()
    db["groups"].update_one({"_id": group["_id"]}, {"$set": {"status": "active", "start_date": now, "end_date": now + timedelta(weeks=int(group.get("duration_weeks", 1))), "updated_at": now}})
    return {"message": "Group started successfully"}


# ============= REQUEST MODELS =============
class GroupContributionRequest(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = Field("wallet", pattern=r'^(bank|wallet|mobile|telebirr)$')
    transaction_reference: Optional[str] = None
    proof_image: Optional[str] = None

# ... existing code ...

@router.post("/{group_id}/contribute")
async def contribute_to_group(
    group_id: str,
    payload: Optional[Any] = Body(None),
    amount: Optional[float] = Query(None, gt=0),
    payment_method: Optional[str] = Query(None, pattern=r'^(bank|wallet|mobile|telebirr)$'),
    transaction_reference: Optional[str] = Query(None, min_length=1),
    proof_image: Optional[str] = Query(None, min_length=1),
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db)
):
    """Submit payment for group contribution via bank transfer or wallet"""
    group = db["groups"].find_one({"_id": str(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if not any(str(member.get("user_id")) == str(current_user["_id"]) for member in group.get("members", [])):
        raise HTTPException(status_code=403, detail="Only group members can contribute")

    request_data = payload if isinstance(payload, dict) else {}
    resolved_payment_method = request_data.get("payment_method") or payment_method or "wallet"
    if isinstance(resolved_payment_method, str):
        resolved_payment_method = resolved_payment_method.strip().lower()
    if resolved_payment_method == "mobile":
        resolved_payment_method = "telebirr"
    resolved_amount = request_data.get("amount", amount)
    expected_amount = float(group.get("contribution_amount") or 0)

    if resolved_amount in (None, "") and resolved_payment_method == "wallet":
        resolved_amount = expected_amount

    try:
        request = GroupContributionRequest(
            amount=float(resolved_amount),
            payment_method=resolved_payment_method,
            transaction_reference=request_data.get("transaction_reference") or transaction_reference,
            proof_image=request_data.get("proof_image") or proof_image,
        )
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Contribution amount is required")

    try:
        if request.payment_method == "wallet":
            # Handle wallet payment
            from ...services.wallet_service import WalletService
            wallet_service = WalletService(db)
            result = wallet_service.pay_equb_contribution(str(current_user["_id"]), group_id, request.amount)
            return {
                "message": "Contribution made successfully from wallet",
                "payment_id": result.get("transaction_id"),
                "round_number": result.get("round_number"),
                "status": "completed",
                "blockchain_tx": None,
            }
        else:
            # Handle manual payment submissions such as bank transfer and Telebirr.
            if not request.transaction_reference or not request.proof_image:
                raise HTTPException(status_code=400, detail="Transaction reference and proof image are required for bank or Telebirr payments")

            bank_payment_service = BankPaymentService(db)
            result = bank_payment_service.submit_payment_proof(
                user_id=str(current_user["_id"]),
                group_id=group_id,
                amount=request.amount,
                transaction_reference=request.transaction_reference,
                proof_image=request.proof_image
            )
            return {
                "message": result["message"],
                "payment_id": result["payment_id"],
                "round_number": result["round_number"],
                "status": result["status"],
                "blockchain_tx": None,
            }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
