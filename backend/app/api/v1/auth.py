from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from pymongo.database import Database

from ...core.database import get_db
from ...core.security import create_access_token, create_refresh_token, oauth2_scheme, verify_token
from ...dependencies import get_current_user
from ...schemas.auth import LoginResponse, RefreshToken, Token, VerifyOTP
from ...schemas.user import UserCreate, UserResponse
from ...services.auth_service import (
    AuthService,
    SYSTEM_ADMIN_EMAIL,
    user_to_response,
)
from ...services.cbe_service import CommercialBankOfEthiopiaService
from ...services.sms_service import SMSService
from ...utils.email import send_verification_email

router = APIRouter()


async def _send_registration_notifications(email: str, phone_number: str, user_id: str) -> None:
    try:
        await send_verification_email(email, user_id)
    except Exception:
        pass
    try:
        await SMSService().send_otp_sms(phone_number, user_id)
    except Exception:
        pass


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, background_tasks: BackgroundTasks, db: Database = Depends(get_db)) -> Any:
    auth_service = AuthService(db)
    if user_data.email.strip().lower() == SYSTEM_ADMIN_EMAIL:
        raise HTTPException(status_code=400, detail="This email is reserved for the system admin")
    if auth_service.get_user_by_email(user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if auth_service.get_user_by_phone(user_data.phone_number):
        raise HTTPException(status_code=400, detail="Phone number already registered")

    if not user_data.bank_account or not user_data.bank_account.account_number or not user_data.bank_account.account_name:
        raise HTTPException(status_code=400, detail="Commercial Bank of Ethiopia account number and account name are required")

    bank_service = CommercialBankOfEthiopiaService(db)
    verification = await bank_service.verify_account_ownership(
        user_data.bank_account.account_number,
        user_data.bank_account.account_name
    )
    if not verification.get("success"):
        raise HTTPException(status_code=400, detail=verification.get("error", "Bank account verification failed"))

    if db["users"].find_one({"bank_account.account_number": user_data.bank_account.account_number}):
        raise HTTPException(status_code=400, detail="This bank account is already registered")

    user_data.bank_account.bank_name = CommercialBankOfEthiopiaService.BANK_NAME
    bank_service._create_or_update_account(
        user_data.bank_account.account_number,
        user_data.bank_account.account_name,
        CommercialBankOfEthiopiaService.BANK_NAME,
        initial_balance=100000.0
    )
    user = auth_service.create_user(user_data)
    background_tasks.add_task(_send_registration_notifications, user["email"], user["phone_number"], user["_id"])
    return user_to_response(user)


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, db: Database = Depends(get_db)) -> Any:
    auth_service = AuthService(db)
    username = ""
    password = ""

    content_type = (request.headers.get("content-type") or "").lower()
    if "application/json" in content_type:
        payload = await request.json()
        username = str(payload.get("username") or payload.get("email") or "").strip()
        password = str(payload.get("password") or "")
    else:
        form = await request.form()
        username = str(form.get("username") or form.get("email") or "").strip()
        password = str(form.get("password") or "")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username/email and password are required")

    user = auth_service.authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    if user.get("status") not in {"ACTIVE", "active"}:
        raise HTTPException(status_code=403, detail=f"Account is {user.get('status')}. Please contact support.")
    if user.get("is_2fa_enabled"):
        otp = auth_service.generate_otp(user["_id"])
        await SMSService().send_otp_sms(user.get("phone_number"), otp)
        return {"requires_2fa": True, "user_id": user["_id"], "message": "OTP sent to your phone"}
    access_token = create_access_token(data={"sub": str(user["_id"]), "role": user.get("role", "user").lower()})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
    auth_service.update_last_login(user["_id"])
    refreshed = auth_service.get_user_by_id(user["_id"])
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer", "user": user_to_response(refreshed)}


@router.post("/verify-2fa", response_model=Token)
async def verify_2fa(verify_data: VerifyOTP, db: Database = Depends(get_db)) -> Any:
    auth_service = AuthService(db)
    user = auth_service.verify_otp(str(verify_data.user_id), verify_data.otp)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    access_token = create_access_token(data={"sub": str(user["_id"]), "role": user.get("role", "user").lower()})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
    auth_service.update_last_login(user["_id"])
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token_data: RefreshToken, db: Database = Depends(get_db)) -> Any:
    payload = verify_token(refresh_token_data.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = AuthService(db).get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token(data={"sub": str(user["_id"]), "role": user.get("role", "user").lower()})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_authenticated_user(current_user=Depends(get_current_user)) -> Any:
    return user_to_response(current_user)


@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme), db: Database = Depends(get_db)) -> Any:
    await AuthService(db).blacklist_token(token)
    return {"message": "Successfully logged out"}
