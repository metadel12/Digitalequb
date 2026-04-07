from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, Dict, Any, List
import re
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if ObjectId.is_valid(v):
            return str(v)
        raise ValueError("Invalid ObjectId")

class BankAccountInfo(BaseModel):
    account_number: str
    account_name: str
    bank_name: Optional[str] = None

    @validator('bank_name', always=True)
    def validate_bank_name(cls, v):
        normalized = (v or "Commercial Bank of Ethiopia").strip()
        if normalized not in {"Commercial Bank of Ethiopia", "CBE"}:
            raise ValueError("Only Commercial Bank of Ethiopia (CBE) accounts are accepted")
        return "Commercial Bank of Ethiopia"

    @validator('account_number')
    def validate_account_number(cls, v):
        clean = re.sub(r'[\s\-\.]', '', v or '')
        if len(clean) != 13:
            raise ValueError('CBE account number must be exactly 13 digits')
        if not clean.startswith('10'):
            raise ValueError("CBE account number must start with '10'")
        if not clean.isdigit():
            raise ValueError('Account number must contain only digits')
        return clean

    @validator('account_name')
    def validate_account_name(cls, v):
        if not str(v or '').strip():
            raise ValueError('Account name is required')
        return str(v).strip().upper()

class UserBase(BaseModel):
    email: EmailStr
    phone_number: str
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    confirm_password: str
    bank_account: Optional[BankAccountInfo] = None
    
    @validator('password')
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('phone_number')
    def validate_phone(cls, v):
        if not re.match(r'^\+?[1-9]\d{1,14}$', v):
            raise ValueError('Invalid phone number format')
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[Dict[str, Any]] = None
    notification_preferences: Optional[Dict[str, bool]] = None

class UserResponse(UserBase):
    id: str
    role: str
    status: str
    kyc_status: str
    credit_score: int
    wallet_address: Optional[str]
    bank_account: Optional[Dict[str, Any]] = None
    profile_picture: Optional[str]
    is_2fa_enabled: bool
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True

class KYCDocument(BaseModel):
    document_type: str  # passport, national_id, driver_license
    document_number: str
    front_image: str
    back_image: Optional[str] = None
    selfie_image: str

class KYCSubmit(BaseModel):
    documents: List[KYCDocument]
    date_of_birth: datetime
    address: Dict[str, Any]

class KYCVerify(BaseModel):
    status: str  # verified, rejected
    rejection_reason: Optional[str] = None

class ChangePassword(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('confirm_new_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v
