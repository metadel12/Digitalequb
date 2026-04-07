from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List, Dict, Any
from decimal import Decimal

class GroupBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    contribution_amount: float = Field(..., gt=0)
    frequency: str  # daily, weekly, monthly
    duration_weeks: int = Field(..., ge=1, le=52)
    max_members: int = Field(..., ge=2, le=50)
    is_private: bool = False
    rules: Optional[Dict[str, Any]] = None

class GroupCreate(GroupBase):
    @validator('frequency')
    def validate_frequency(cls, v):
        allowed = ['daily', 'weekly', 'monthly']
        if v not in allowed:
            raise ValueError(f'Frequency must be one of {allowed}')
        return v

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[Dict[str, Any]] = None
    is_private: Optional[bool] = None

class GroupResponse(GroupBase):
    id: str
    status: str
    current_members: int
    contract_address: Optional[str]
    created_by: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    join_code: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class GroupDetailResponse(GroupResponse):
    creator: Dict[str, Any]
    members: List[Dict[str, Any]]
    total_contributions: float
    next_payout_amount: float
    next_payout_date: Optional[datetime]
    
class JoinGroup(BaseModel):
    join_code: Optional[str] = None
    group_id: Optional[str] = None

class GroupMemberResponse(BaseModel):
    user_id: str
    full_name: str
    email: str
    joined_at: datetime
    position: Optional[int]
    contribution_count: int
    total_contributed: float
    next_payment_due: Optional[datetime]
    
    class Config:
        from_attributes = True


class ComprehensiveGroupCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    group_type: str = Field(..., pattern='^(fixed|random|bid)$')
    contribution_amount: float = Field(..., ge=100)
    currency: str = Field(..., pattern='^(ETB|USD)$')
    frequency: str = Field(..., pattern='^(daily|weekly|monthly)$')
    duration_weeks: int = Field(..., ge=1, le=52)
    max_members: int = Field(..., ge=2, le=50)
    privacy: str = Field(..., pattern='^(public|private)$')
    approval_required: bool = True
    late_penalty: float = Field(0, ge=0, le=100)
    grace_period_days: int = Field(0, ge=0, le=30)
    early_withdrawal: bool = False
    rules: Optional[str] = None
    invite_emails: List[str] = []
    invite_phones: List[str] = []


class ContractDeployRequest(BaseModel):
    group_name: str
    contribution_amount: float
    total_members: int
    frequency: str
    creator_address: Optional[str] = None


class JoinCodeResponse(BaseModel):
    success: bool = True
    join_code: str


class InviteDispatchRequest(BaseModel):
    group_name: str
    join_code: str
    group_link: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = 'ETB'
    frequency: Optional[str] = 'weekly'
    recipients: List[str] = []


class InviteDispatchResponse(BaseModel):
    success: bool = True
    sent: int
    failed: int
    channel: str


class ComprehensiveGroupPayload(BaseModel):
    _id: str
    name: str
    join_code: str
    contract_address: str
    total_fund: float
    created_at: datetime
    invite_links: Dict[str, List[str]]


class ComprehensiveGroupCreateResponse(BaseModel):
    success: bool = True
    group_id: str
    group: ComprehensiveGroupPayload


class GroupNameValidationResponse(BaseModel):
    available: bool
    normalized_name: str


class WinnerBidCreate(BaseModel):
    member_id: str
    amount: float = Field(..., gt=0)


class WinnerSelectionRequest(BaseModel):
    method: str = Field(..., pattern='^(fixed|random|bid)$')


class GroupWinnersResponse(BaseModel):
    success: bool = True
    winners: List[Dict[str, Any]]
    round_number: int


class WinnerBidResponse(BaseModel):
    success: bool = True
    bid: Dict[str, Any]
    bids: List[Dict[str, Any]]
    round_number: int
