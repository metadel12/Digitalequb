from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pymongo.database import Database

from ...core.database import get_db
from ...dependencies import get_current_active_user
from ...services.admin_service import AdminService

router = APIRouter()


class PaymentVerifyPayload(BaseModel):
    payment_id: str


class WinnerSelectPayload(BaseModel):
    group_id: str


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


@router.get("/payments/pending")
async def get_pending_payments(
    group_id: Optional[str] = None,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    service = _get_admin_service(db)
    _require_single_admin(current_user, service)
    return service.get_pending_payments(group_id)


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
