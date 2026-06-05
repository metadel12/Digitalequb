from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pymongo.database import Database

from app.core.database import get_db
from app.core.security import decode_access_token

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Database = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise credentials_exception
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception
    user = db["users"].find_one({"_id": str(user_id)})
    if not user:
        raise credentials_exception
    return user


async def get_current_active_user(current_user=Depends(get_current_user)):
    status = str(current_user.get("status", "")).lower()
    approval_status = str(current_user.get("approval_status", "")).lower()
    
    # Allow super_admin to bypass approval check
    role = str(current_user.get("role", "")).lower()
    if role == "super_admin":
        return current_user
    
    # Check if user status is valid
    if status not in {"active", "pending"}:
        raise HTTPException(status_code=403, detail=f"Account is {status}. Please contact support.")
    
    # Block users who are not yet approved by admin.
    # Only super_admin can bypass this check.
    if approval_status != "approved":
        raise HTTPException(
            status_code=403,
            detail="Account pending approval. Please wait for an administrator to approve your account.",
        )

    if status != "active":
        raise HTTPException(
            status_code=403,
            detail=f"Account is {status}. Please contact support.",
        )

    return current_user
