from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database

from app.core.database import get_db
from app.core.mongo_utils import utcnow
from app.dependencies import get_current_active_user
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth_service import AuthService, user_to_response

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user=Depends(get_current_active_user)):
    return user_to_response(current_user)


@router.get("/stats")
async def get_current_user_stats(current_user=Depends(get_current_active_user)):
    return {
        "credit_score": current_user.get("credit_score", 0),
        "total_savings": current_user.get("total_savings", 0.0),
        "total_borrowed": current_user.get("total_borrowed", 0.0),
        "total_repaid": current_user.get("total_repaid", 0.0),
        "default_count": current_user.get("default_count", 0),
        "kyc_status": current_user.get("kyc_status", "not_submitted"),
        "status": current_user.get("status", "pending"),
    }


@router.put("/me", response_model=UserResponse)
async def update_current_user(user_update: UserUpdate, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    update_data = user_update.dict(exclude_unset=True)
    if update_data:
        db["users"].update_one({"_id": current_user["_id"]}, {"$set": {**update_data, "updated_at": utcnow()}})
    user = AuthService(db).get_user_by_id(current_user["_id"])
    return user_to_response(user)


@router.patch("/me", response_model=UserResponse)
async def patch_current_user(user_update: UserUpdate, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    update_data = user_update.dict(exclude_unset=True)
    if update_data:
        db["users"].update_one({"_id": current_user["_id"]}, {"$set": {**update_data, "updated_at": utcnow()}})
    user = AuthService(db).get_user_by_id(current_user["_id"])
    return user_to_response(user)


@router.delete("/me", status_code=200)
async def delete_current_user(current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    from app.services.auth_service import SYSTEM_ADMIN_EMAIL
    if current_user.get("email") == SYSTEM_ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="System admin account cannot be deleted")
    user_id = current_user["_id"]
    db["users"].delete_one({"_id": user_id})
    db["wallets"].delete_many({"user_id": user_id})
    db["wallet_transactions"].delete_many({"user_id": user_id})
    db["session_codes"].delete_many({"user_id": user_id})
    return {"success": True, "message": "Account deleted successfully"}


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str, current_user=Depends(get_current_active_user), db: Database = Depends(get_db)):
    user = AuthService(db).get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_to_response(user)
