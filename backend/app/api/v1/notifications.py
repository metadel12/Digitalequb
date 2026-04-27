from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database

from app.core.database import get_db
from app.core.mongo_utils import new_id, utcnow
from app.dependencies import get_current_user

router = APIRouter()


def _serialize(n: dict) -> dict:
    return {
        "id": str(n.get("_id", "")),
        "title": n.get("title", ""),
        "message": n.get("message", ""),
        "type": n.get("type", "info"),
        "read": bool(n.get("read", False)),
        "createdAt": n.get("created_at", utcnow()).isoformat() if hasattr(n.get("created_at", utcnow()), "isoformat") else str(n.get("created_at", "")),
        "priority": n.get("priority", "low"),
        "link": n.get("link"),
        "actions": n.get("actions", []),
        "metadata": n.get("metadata", {}),
    }


def _create_notification(db: Database, user_id: str, title: str, message: str,
                          ntype: str, priority: str = "medium",
                          link: str | None = None, metadata: dict | None = None,
                          actions: list | None = None) -> dict:
    doc = {
        "_id": new_id(),
        "user_id": str(user_id),
        "title": title,
        "message": message,
        "type": ntype,
        "read": False,
        "priority": priority,
        "link": link,
        "metadata": metadata or {},
        "actions": actions or [],
        "created_at": utcnow(),
    }
    db["notifications"].insert_one(doc)
    return doc


@router.get("")
async def get_notifications(
    current_user=Depends(get_current_user),
    db: Database = Depends(get_db),
) -> Any:
    uid = str(current_user["_id"])

    # Fetch stored notifications for this user
    raw = list(db["notifications"].find({"user_id": uid}).sort("created_at", -1).limit(100))

    # If none yet, seed from real participation data
    if not raw:
        raw = _seed_notifications(db, current_user)

    return [_serialize(n) for n in raw]


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: Database = Depends(get_db),
) -> Any:
    uid = str(current_user["_id"])
    result = db["notifications"].update_one(
        {"_id": notification_id, "user_id": uid},
        {"$set": {"read": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Notification not found")
    return {"success": True}


@router.patch("/read-all")
async def mark_all_read(
    current_user=Depends(get_current_user),
    db: Database = Depends(get_db),
) -> Any:
    uid = str(current_user["_id"])
    db["notifications"].update_many({"user_id": uid, "read": False}, {"$set": {"read": True}})
    return {"success": True}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: Database = Depends(get_db),
) -> Any:
    uid = str(current_user["_id"])
    result = db["notifications"].delete_one({"_id": notification_id, "user_id": uid})
    if result.deleted_count == 0:
        raise HTTPException(404, "Notification not found")
    return {"success": True}


@router.delete("")
async def delete_all_notifications(
    current_user=Depends(get_current_user),
    db: Database = Depends(get_db),
) -> Any:
    uid = str(current_user["_id"])
    db["notifications"].delete_many({"user_id": uid})
    return {"success": True}


def _seed_notifications(db: Database, user: dict) -> list[dict]:
    """Generate real notifications from the user's actual participation data."""
    uid = str(user["_id"])
    notifications = []

    # --- Groups the user is a member of ---
    user_groups = list(db["equbs"].find({
        "$or": [
            {"creator_id": uid},
            {"members.user_id": uid},
            {"member_ids": uid},
        ]
    }).limit(20))

    for group in user_groups:
        gid = str(group.get("_id", ""))
        gname = group.get("name", "Equb Group")

        # Joined group notification
        notifications.append(_create_notification(
            db, uid,
            title=f"You are in {gname}",
            message=f"You are an active member of {gname}.",
            ntype="group",
            priority="low",
            link=f"/groups/{gid}",
            metadata={"group_id": gid, "group_name": gname},
        ))

        # Payment due if group is active
        if group.get("status") in ("active", "ACTIVE"):
            amount = group.get("contribution_amount", 0)
            if amount:
                notifications.append(_create_notification(
                    db, uid,
                    title="Contribution Due",
                    message=f"Your contribution of ETB {amount:,.0f} for {gname} is due.",
                    ntype="payment",
                    priority="high",
                    link=f"/payments/{gid}",
                    metadata={"group_id": gid, "amount": amount},
                    actions=[{"label": "Pay Now", "action": "make_payment"}],
                ))

    # --- Payments / transactions ---
    payments = list(db["transactions"].find({
        "$or": [{"sender_id": uid}, {"receiver_id": uid}, {"user_id": uid}]
    }).sort("created_at", -1).limit(10))

    for tx in payments:
        amount = tx.get("amount", 0)
        is_received = str(tx.get("receiver_id", "")) == uid
        notifications.append(_create_notification(
            db, uid,
            title="Payment Received" if is_received else "Payment Sent",
            message=f"ETB {amount:,.0f} {'received' if is_received else 'sent'} successfully.",
            ntype="payment",
            priority="medium",
            link="/transactions",
            metadata={"transaction_id": str(tx.get("_id", "")), "amount": amount},
            actions=[{"label": "View Receipt", "action": "view_receipt"}],
        ))

    # --- Contest wins ---
    wins = list(db["winners"].find({"user_id": uid}).sort("created_at", -1).limit(5))
    for win in wins:
        gid = str(win.get("equb_id", win.get("group_id", "")))
        amount = win.get("amount", win.get("payout_amount", 0))
        notifications.append(_create_notification(
            db, uid,
            title="🎉 You Won!",
            message=f"Congratulations! You won ETB {amount:,.0f} from the draw.",
            ntype="contest",
            priority="high",
            link=f"/groups/{gid}" if gid else "/dashboard",
            metadata={"group_id": gid, "amount": amount},
            actions=[{"label": "View Details", "action": "view_details"}],
        ))

    # --- Success: email/phone verified ---
    if user.get("email_verified"):
        notifications.append(_create_notification(
            db, uid,
            title="Email Verified",
            message="Your email address has been verified successfully.",
            ntype="success",
            priority="low",
        ))

    if user.get("phone_verified"):
        notifications.append(_create_notification(
            db, uid,
            title="Phone Verified",
            message="Your phone number has been verified successfully.",
            ntype="success",
            priority="low",
        ))

    # Re-fetch in sorted order
    return list(db["notifications"].find({"user_id": uid}).sort("created_at", -1).limit(100))
