from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token, OTPRequest, OTPVerify
from app.models.user import User
from app.services.auth_service import AuthService
from app.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.register_user(user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.authenticate_user(form_data.username, form_data.password)

@router.post("/request-otp")
async def request_otp(request: OTPRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.request_otp(request.email)

@router.post("/verify-otp", response_model=Token)
async def verify_otp(verify: OTPVerify, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.verify_otp_and_login(verify.email, verify.otp)

@router.post("/refresh-token", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.refresh_access_token(str(current_user.id))