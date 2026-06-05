from typing import Any, Dict, Optional
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pymongo.database import Database

from ...core.database import get_db
from ...dependencies import get_current_active_user
from ...services.admin_service import AdminService

router = APIRouter()
APP_ROOT = Path(__file__).resolve().parents[3]
REGISTRATION_UPLOAD_ROOT = APP_ROOT / "uploads" / "registration"


class PaymentVerifyPayload(BaseModel):
    payment_id: str


class WinnerSelectPayload(BaseModel):
    group_id: str


class AddMemberShortfallPayload(BaseModel):
    group_id: str
    member_email: str
    shortfall_amount: float


class UserActionPayload(BaseModel):
    user_id: str
    reason: Optional[str] = None
    force: Optional[bool] = False


def _get_admin_service(db: Database) -> AdminService:
    return AdminService(db)


def _require_single_admin(current_user: Dict[str, Any], service: AdminService) -> None:
    if str(current_user.get("role", "")).lower() != "super_admin" or not service.is_admin(current_user.get("email", "")):
        raise HTTPException(status_code=403, detail="Single admin access required")


@router.get("/profile")
async def get_admin_profile(current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_admin_profile()


@router.get("/groups")
async def get_all_groups(current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_all_groups()


@router.get("/groups/ready-for-winner")
async def get_ready_for_winner_groups(current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_groups_ready_for_winner()


@router.get("/groups/{group_id}/members")
async def get_group_members_status(group_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    try:
        return service.get_group_members_status(group_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/groups/{group_id}/winner-announcements")
async def get_winner_announcements(group_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_winner_announcements(group_id)


@router.get("/payments/pending")
async def get_pending_payments(
    group_id: Optional[str] = None,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    payments = service.get_pending_payments(group_id)
    return {
        "success": True,
        "payments": payments,
        "count": len(payments),
    }


@router.post("/payments/verify")
async def verify_payment(
    payload: PaymentVerifyPayload,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    result = service.verify_payment(payload.payment_id, str(current_user["_id"]))
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to verify payment"))
    return result


@router.get("/transactions/stats")
async def get_transaction_stats(current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_transaction_stats()


@router.get("/transactions")
async def get_transaction_history(
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 200,
    skip: int = 0,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_transaction_history(transaction_type=transaction_type, status=status, limit=limit, skip=skip)


@router.get("/users/pending")
async def get_pending_users(
    limit: int = 50,
    skip: int = 0,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_pending_users(limit=limit, skip=skip)


@router.get("/users/{user_id}/profile-completion")
async def get_user_profile_completion(
    user_id: str,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    
    user = db["users"].find_one({"_id": str(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile_completion = service._check_profile_completion(user)
    return {
        "success": True,
        "user_id": user_id,
        "profile_completion": profile_completion,
    }


@router.get("/users/all")
async def get_all_users(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_all_users(limit=limit, skip=skip, status=status)


@router.get("/users/logs")
async def get_user_logs(current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_user_action_logs()


@router.get("/users/{user_id}/registration-files/{category}/{stored_name}")
async def download_registration_file(
    user_id: str,
    category: str,
    stored_name: str,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)

    user = db["users"].find_one({"_id": str(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    registration_files = user.get("registration_files") or {}
    candidates = []
    if registration_files.get("property_file"):
        candidates.append(registration_files["property_file"])
    candidates.extend(registration_files.get("wealth_files") or [])
    match = next(
        (
            item for item in candidates
            if item.get("category") == category and item.get("stored_name") == stored_name
        ),
        None,
    )
    if not match:
        raise HTTPException(status_code=404, detail="Registration file not found")

    target = (APP_ROOT / match.get("path", "")).resolve()
    if not str(target).startswith(str(REGISTRATION_UPLOAD_ROOT.resolve())) or not target.exists():
        raise HTTPException(status_code=404, detail="Registration file is missing from storage")

    return FileResponse(
        path=target,
        filename=match.get("original_name") or stored_name,
        media_type=match.get("content_type") or "application/octet-stream",
    )


@router.post("/users/approve")
async def approve_user(
    payload: UserActionPayload,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    result = service.approve_user(str(current_user["_id"]), payload.user_id, payload.reason, payload.force or False)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to approve user"))
    return result


@router.post("/users/reject")
async def reject_user(
    payload: UserActionPayload,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    if not payload.reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    result = service.reject_user(str(current_user["_id"]), payload.user_id, payload.reason)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to reject user"))
    return result


@router.post("/users/block")
async def block_user(
    payload: UserActionPayload,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    if not payload.reason:
        raise HTTPException(status_code=400, detail="Block reason is required")
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    result = service.block_user(str(current_user["_id"]), payload.user_id, payload.reason)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to block user"))
    return result


@router.post("/users/unblock")
async def unblock_user(
    payload: UserActionPayload,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    result = service.unblock_user(str(current_user["_id"]), payload.user_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to unblock user"))
    return result


@router.api_route("/users/delete", methods=["DELETE"])
async def delete_user(
    payload: UserActionPayload,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    result = service.delete_user(str(current_user["_id"]), payload.user_id, payload.reason)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to delete user"))
    return result


@router.post("/auto-pay/run")
async def run_auto_pay(
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    """Manually trigger auto-pay for all overdue members across all active groups."""
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    from ...services.auto_pay_service import AutoPayService
    summary = AutoPayService(db).run()
    return summary


@router.post("/groups/select-winner")
async def select_winner(
    payload: WinnerSelectPayload,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    try:
        result = service.select_random_winner(payload.group_id, str(current_user["_id"]))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"success": True, **result}


@router.post("/groups/{group_id}/select-winner")
async def select_winner_by_path(
    group_id: str,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    try:
        result = service.select_random_winner(group_id, str(current_user["_id"]))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"success": True, **result}


@router.post("/groups/add-member-shortfall")
async def add_member_for_shortfall(
    payload: AddMemberShortfallPayload,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    """Add a new member to a group to cover shortfall when partial payments exist."""
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    try:
        result = service.add_member_for_shortfall(
            payload.group_id,
            payload.member_email,
            payload.shortfall_amount,
            str(current_user["_id"])
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return result
