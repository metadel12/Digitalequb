from collections import defaultdict
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query
from pymongo.database import Database

from ...core.database import get_db
from ...core.mongo_utils import group_total_rounds, normalize_datetime, utcnow
from ...dependencies import get_current_active_user
from ...services.wallet_service import WalletService

router = APIRouter()


def _to_float(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _month_key(value: datetime) -> str:
    return value.strftime("%Y-%m")


def _month_label(value: datetime) -> str:
    return value.strftime("%b")


def _months_back(count: int) -> List[datetime]:
    today = utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    months: List[datetime] = []
    year = today.year
    month = today.month

    for offset in range(count - 1, -1, -1):
        calc_month = month - offset
        calc_year = year
        while calc_month <= 0:
            calc_month += 12
            calc_year -= 1
        months.append(datetime(calc_year, calc_month, 1, tzinfo=today.tzinfo))

    return months


def _credit_rating(score: int) -> str:
    if score >= 750:
        return "Excellent"
    if score >= 650:
        return "Good"
    if score >= 550:
        return "Fair"
    return "Poor"


def _coerce_datetime(value: Any) -> Optional[datetime]:
    parsed = normalize_datetime(value)
    if parsed is None:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def _member_for_user(group: Dict[str, Any], user_id: str) -> Optional[Dict[str, Any]]:
    return next((item for item in group.get("members", []) if str(item.get("user_id")) == str(user_id)), None)


@router.get("/stats")
async def get_dashboard_stats(
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    user_id = str(current_user["_id"])
    wallet = WalletService(db).ensure_wallet_for_user(user_id)
    groups = list(db["groups"].find({"members.user_id": user_id}))

    now = utcnow()
    month_ago = now - timedelta(days=30)
    two_months_ago = now - timedelta(days=60)
    active_groups = [group for group in groups if group.get("status") == "active"]
    active_memberships = [member for group in active_groups if (member := _member_for_user(group, user_id))]
    upcoming_memberships = [member for member in active_memberships if _coerce_datetime(member.get("next_payment_due")) is not None]

    pending_amount = sum(
        float((_member_for_user(group, user_id) or {}).get("group_contribution_amount", group.get("contribution_amount", 0)))
        for group in active_groups
        if (member := _member_for_user(group, user_id))
        and (due_date := _coerce_datetime(member.get("next_payment_due")))
        and due_date >= now
    )
    next_payment_days = min(
        (
            max((_coerce_datetime(member.get("next_payment_due")) - now).days, 0)
            for member in upcoming_memberships
            if _coerce_datetime(member.get("next_payment_due"))
        ),
        default=None,
    )
    groups_completing_this_week = sum(
        1
        for group in active_groups
        if (end_date := _coerce_datetime(group.get("end_date"))) and end_date <= now + timedelta(days=7)
    )
    success_rate = (
        round(
            (
                sum(1 for member in active_memberships if int(member.get("missed_payments") or 0) == 0)
                / max(len(active_memberships), 1)
            ) * 100,
            1,
        )
        if active_memberships
        else 0.0
    )

    all_transactions = list(db["wallet_transactions"].find({"wallet_id": wallet["_id"]}))
    balance = _to_float(wallet.get("balance"))
    total_saved = max(
        _to_float(wallet.get("total_deposits")) + _to_float(wallet.get("total_equb_paid")),
        _to_float(current_user.get("total_savings")),
    )
    total_winnings = _to_float(wallet.get("total_winnings"))
    last_month_balance = sum(
        _to_float(item.get("amount"))
        for item in all_transactions
        if (created_at := _coerce_datetime(item.get("created_at")))
        and created_at >= month_ago
        and item.get("status") == "completed"
    )
    previous_month_balance = sum(
        _to_float(item.get("amount"))
        for item in all_transactions
        if (created_at := _coerce_datetime(item.get("created_at")))
        and two_months_ago <= created_at < month_ago
        and item.get("status") == "completed"
    )

    if previous_month_balance:
        balance_change_pct = round(((last_month_balance - previous_month_balance) / abs(previous_month_balance)) * 100, 1)
    elif last_month_balance:
        balance_change_pct = 100.0
    else:
        balance_change_pct = 0.0

    avg_saved_per_month = round(total_saved / max(len(active_memberships) or 1, 1), 2)
    savings_goal = float((current_user.get("profile_metadata") or {}).get("savings_goal", 100000) or 100000)
    savings_goal_progress_pct = round(min((total_saved / max(savings_goal, 1)) * 100, 100), 1)

    winning_months: Dict[str, float] = defaultdict(float)
    winning_transactions = db["wallet_transactions"].find(
        {"wallet_id": wallet["_id"], "type": "equb_winning", "status": "completed"}
    )
    for item in winning_transactions:
        created_at = _coerce_datetime(item.get("created_at"))
        if created_at:
            winning_months[_month_key(created_at)] += _to_float(item.get("amount"))

    best_winning_month = None
    if winning_months:
        best_winning_month = max(winning_months.items(), key=lambda entry: entry[1])[0]

    ordered_recent_months = _months_back(6)
    winning_streak_count = 0
    for month in reversed(ordered_recent_months):
        if winning_months.get(_month_key(month), 0) > 0:
            winning_streak_count += 1
        else:
            break

    return {
        "balance": balance,
        "currency": wallet.get("currency", "ETB"),
        "balance_change_pct": balance_change_pct,
        "active_groups": len(active_groups),
        "groups_completing_this_week": groups_completing_this_week,
        "success_rate_pct": success_rate,
        "total_saved": total_saved,
        "avg_saved_per_month": avg_saved_per_month,
        "savings_goal_progress_pct": savings_goal_progress_pct,
        "total_winnings": total_winnings,
        "best_winning_month": best_winning_month,
        "winning_streak_count": winning_streak_count,
        "pending_payments_amount": pending_amount,
        "pending_payments_count": len(upcoming_memberships),
        "next_payment_days": next_payment_days,
        "credit_score": int(current_user.get("credit_score") or 0),
        "credit_score_change": max(0, 10 - int(current_user.get("default_count") or 0) * 5),
        "credit_rating": _credit_rating(int(current_user.get("credit_score") or 0)),
    }


@router.get("/charts")
async def get_dashboard_charts(
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    user_id = str(current_user["_id"])
    wallet = WalletService(db).ensure_wallet_for_user(user_id)
    groups = list(db["groups"].find({"members.user_id": user_id}))
    now = utcnow()
    months = _months_back(6)

    monthly_net = {_month_key(month): 0.0 for month in months}
    spending_totals = {
        "Equb Payments": 0.0,
        "Withdrawals": 0.0,
        "Fees": 0.0,
        "Other": 0.0,
    }
    daily_volume = {
        (now - timedelta(days=offset)).strftime("%Y-%m-%d"): {"count": 0, "amount": 0.0}
        for offset in range(29, -1, -1)
    }

    transactions = list(db["wallet_transactions"].find({"wallet_id": wallet["_id"]}).sort("created_at", 1))
    month_running = {_month_key(month): 0.0 for month in months}

    for item in transactions:
        amount = _to_float(item.get("amount"))
        created_at = _coerce_datetime(item.get("created_at"))
        if created_at:
            item_month = _month_key(created_at)
            if item_month in month_running and item.get("status") == "completed":
                month_running[item_month] += amount

            day_key = created_at.strftime("%Y-%m-%d")
            if day_key in daily_volume:
                daily_volume[day_key]["count"] += 1
                daily_volume[day_key]["amount"] += abs(amount)

        if item.get("type") == "equb_payment":
            spending_totals["Equb Payments"] += abs(amount)
        elif item.get("type") == "withdrawal":
            spending_totals["Withdrawals"] += abs(amount)
        elif _to_float(item.get("fee")) > 0:
            spending_totals["Fees"] += abs(_to_float(item.get("fee")))
        else:
            spending_totals["Other"] += abs(amount) if amount < 0 else 0.0

    for month in months:
        key = _month_key(month)
        monthly_net[key] = month_running[key]

    cumulative_balance = 0.0
    balance_points = []
    for month in months:
        cumulative_balance += monthly_net[_month_key(month)]
        balance_points.append(
            {
                "month": _month_label(month),
                "balance": round(cumulative_balance, 2),
            }
        )

    group_performance = []
    for group in groups:
        member = _member_for_user(group, user_id)
        if not member:
            continue
        group_performance.append(
            {
                "group_name": group.get("name", "Unnamed Group"),
                "total_contributed": round(float(member.get("total_contributed") or 0), 2),
                "contribution_amount": round(float(group.get("contribution_amount") or 0), 2),
                "progress_pct": round(
                    min(
                        (int(member.get("contribution_count") or 0) / max(group_total_rounds(group), 1)) * 100,
                        100,
                    ),
                    1,
                ),
            }
        )

    volume_points = []
    rolling_amounts: List[int] = []
    ordered_days = sorted(daily_volume.keys())
    for day_key in ordered_days:
        rolling_amounts.append(daily_volume[day_key]["count"])
        if len(rolling_amounts) > 7:
            rolling_amounts.pop(0)
        rolling_average = sum(rolling_amounts) / max(len(rolling_amounts), 1)
        volume_points.append(
            {
                "date": datetime.strptime(day_key, "%Y-%m-%d").strftime("%b %d"),
                "count": daily_volume[day_key]["count"],
                "amount": round(daily_volume[day_key]["amount"], 2),
                "rolling_average": round(rolling_average, 2),
            }
        )

    current_credit = int(current_user.get("credit_score") or 0)
    credit_history = []
    for index, month in enumerate(months):
        historical_score = max(current_credit - (len(months) - index - 1) * 8, 0)
        credit_history.append(
            {
                "month": _month_label(month),
                "score": historical_score,
                "target": 750,
            }
        )

    return {
        "balance_growth": balance_points,
        "spending_categories": [
            {"name": name, "value": round(value, 2)}
            for name, value in spending_totals.items()
            if value > 0
        ] or [{"name": "Other", "value": 0.0}],
        "group_performance": group_performance,
        "transaction_volume": volume_points,
        "credit_score_history": credit_history,
    }


@router.get("/activities/recent")
async def get_recent_activities(
    limit: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_active_user),
    db: Database = Depends(get_db),
):
    user_id = str(current_user["_id"])
    notifications = list(
        db["notifications"]
        .find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )

    if notifications:
        return [
            {
                "id": str(item.get("_id")),
                "title": item.get("title") or item.get("subject") or "Notification",
                "message": item.get("message", ""),
                "type": item.get("type", "info"),
                "read": bool(item.get("read", item.get("status") == "read")),
                "created_at": _coerce_datetime(item.get("created_at")) or utcnow(),
                "action_url": item.get("action_url"),
            }
            for item in notifications
        ]

    wallet = WalletService(db).ensure_wallet_for_user(user_id)
    transactions = list(
        db["wallet_transactions"]
        .find({"wallet_id": wallet["_id"]})
        .sort("created_at", -1)
        .limit(limit)
    )

    return [
        {
            "id": str(item.get("_id")),
            "title": str(item.get("type", "activity")).replace("_", " ").title(),
            "message": item.get("description") or item.get("reference") or "Recent wallet activity",
            "type": item.get("type", "activity"),
            "read": True,
            "created_at": _coerce_datetime(item.get("created_at")) or utcnow(),
            "action_url": "/wallet",
        }
        for item in transactions
    ]
