from datetime import UTC, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.database import Database

from ...core.database import get_db
from ...core.mongo_utils import normalize_datetime, utcnow
from ...dependencies import get_current_active_user
from ...services.wallet_service import WalletService

router = APIRouter()


def _coerce_datetime(value) -> Optional[datetime]:
    parsed = normalize_datetime(value)
    if parsed is None:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def _member_for_user(group: dict, user_id: str) -> Optional[dict]:
    return next((item for item in group.get("members", []) if str(item.get("user_id")) == str(user_id)), None)


@router.get("/recent")
async def get_recent_transactions(
    limit: int = Query(5, ge=1, le=20),
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    wallet = WalletService(db).ensure_wallet_for_user(str(current_user["_id"]))
    transactions = list(
        db["wallet_transactions"]
        .find({"wallet_id": wallet["_id"]})
        .sort("created_at", -1)
        .limit(limit)
    )

    return [
        {
            "id": str(item.get("_id")),
            "description": item.get("description") or str(item.get("type", "transaction")).replace("_", " ").title(),
            "amount": float(item.get("amount") or 0),
            "created_at": _coerce_datetime(item.get("created_at")) or utcnow(),
            "type": item.get("type"),
            "status": item.get("status"),
            "paymentMethod": item.get("payment_method"),
            "reference": item.get("reference"),
            "category": "other",
        }
        for item in transactions
    ]


@router.get("/upcoming")
async def get_upcoming_transactions(
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    user_id = str(current_user["_id"])
    groups = list(db["groups"].find({"members.user_id": user_id}))

    upcoming = []
    now = utcnow()
    for group in groups:
        member = _member_for_user(group, user_id)
        if not member:
            continue

        due_date = _coerce_datetime(member.get("next_payment_due"))
        if due_date is None:
            frequency = group.get("frequency")
            if frequency == "daily":
                due_date = now + timedelta(days=1)
            elif frequency == "weekly":
                due_date = now + timedelta(weeks=1)
            else:
                due_date = now + timedelta(days=30)

        days_remaining = (due_date - now).days
        if days_remaining < 0:
            payment_status = "overdue"
        elif days_remaining == 0:
            payment_status = "due_today"
        elif days_remaining == 1:
            payment_status = "pending"
        else:
            payment_status = "upcoming"

        upcoming.append(
            {
                "id": str(member.get("user_id")) + "-" + str(group.get("_id")),
                "groupId": str(group.get("_id")),
                "groupName": group.get("name"),
                "title": f"{group.get('name')} contribution",
                "amount": float(group.get("contribution_amount") or 0),
                "dueDate": due_date,
                "status": payment_status,
                "daysRemaining": days_remaining,
                "frequency": group.get("frequency"),
            }
        )

    upcoming.sort(key=lambda item: item["dueDate"])
    return upcoming[:5]


@router.get("/")
async def get_user_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    transaction_type: Optional[str] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    return WalletService(db).get_transaction_history(str(current_user["_id"]), page, page_size, transaction_type)


@router.get("/{transaction_id}")
async def get_transaction_by_id(
    transaction_id: str,
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    wallet = WalletService(db).ensure_wallet_for_user(str(current_user["_id"]))
    transaction = db["wallet_transactions"].find_one({"wallet_id": wallet["_id"], "_id": transaction_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return WalletService(db)._transaction_response(transaction)
