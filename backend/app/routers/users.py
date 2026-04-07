from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.models.user import User
from app.dependencies import get_current_active_user
from app.services.auth_service import AuthService
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    return auth_service.update_user(str(current_user.id), user_update)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user