from pydantic import BaseModel
from typing import List, Optional
from .user import UserResponse


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None


class TokenData(BaseModel):
    email: Optional[str] = None


class RefreshToken(BaseModel):
    refresh_token: str


class VerifyOTP(BaseModel):
    user_id: str
    otp: str
    session_token: Optional[str] = None


class EmailVerificationRequest(BaseModel):
    email: str
    code: str
    session_token: Optional[str] = None


class ResendVerificationRequest(BaseModel):
    email: str
    session_token: Optional[str] = None


class OAuthSessionRequest(BaseModel):
    session_token: str


class PhoneOTPRequest(BaseModel):
    phone_number: str


class EmailOTPRequest(BaseModel):
    email: Optional[str] = None


class PhoneVerificationRequest(BaseModel):
    phone_number: Optional[str] = None
    code: str


class SecurityQuestionItem(BaseModel):
    question: str
    answer: str


class SecurityQuestionsRequest(BaseModel):
    questions: List[SecurityQuestionItem]


class TwoFactorSetupRequest(BaseModel):
    method: str


class TwoFactorSetupVerifyRequest(BaseModel):
    method: str
    code: str


class LoginResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserResponse] = None
    requires_2fa: bool = False
    user_id: Optional[str] = None
    session_token: Optional[str] = None
    method: Optional[str] = None
    message: Optional[str] = None


class OTPRequest(BaseModel):
    email: str


class OTPVerify(BaseModel):
    email: str
    otp: str


class ForgotPasswordRequest(BaseModel):
    email: str


class VerifyResetCodeRequest(BaseModel):
    email: str
    code: str


class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    password: str
    confirm_password: str


class SecurityQuestionVerifyRequest(BaseModel):
    email: str
    question: str
    answer: str
