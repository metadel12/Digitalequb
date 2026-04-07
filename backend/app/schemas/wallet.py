from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, validator


class WalletBase(BaseModel):
    balance: Decimal = Field(default=Decimal("0.00"))
    currency: str = Field(default="ETB", max_length=3)
    total_deposits: Decimal = Field(default=Decimal("0.00"))
    total_withdrawals: Decimal = Field(default=Decimal("0.00"))
    total_winnings: Decimal = Field(default=Decimal("0.00"))
    total_equb_paid: Decimal = Field(default=Decimal("0.00"))
    pending_deposits: Decimal = Field(default=Decimal("0.00"))
    pending_withdrawals: Decimal = Field(default=Decimal("0.00"))
    total_transactions: int = 0
    last_transaction_at: Optional[datetime] = None
    is_locked: bool = False
    auto_withdraw_enabled: bool = False
    auto_deposit_enabled: bool = False
    daily_withdrawal_limit: Decimal = Field(default=Decimal("50000.00"))
    weekly_withdrawal_limit: Decimal = Field(default=Decimal("200000.00"))
    monthly_withdrawal_limit: Decimal = Field(default=Decimal("500000.00"))
    spending_limit: Decimal = Field(default=Decimal("0.00"))
    linked_accounts: List[Dict[str, Any]] = Field(default_factory=list)


class WalletCreate(WalletBase):
    user_id: str


class WalletResponse(WalletBase):
    id: str
    user_id: str
    wallet_address: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class WalletBalanceResponse(BaseModel):
    balance: Decimal
    currency: str
    available_balance: Decimal
    pending_deposits: Decimal
    pending_withdrawals: Decimal
    total_deposits: Decimal
    total_withdrawals: Decimal
    total_winnings: Decimal
    total_equb_paid: Decimal
    total_transactions: int
    last_transaction_at: Optional[datetime]
    pending_transactions_count: int


class WalletTransactionBase(BaseModel):
    type: str
    amount: Decimal
    fee: Decimal = Field(default=Decimal("0.00"))
    payment_method: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class WalletTransactionResponse(WalletTransactionBase):
    id: str
    wallet_id: str
    group_id: Optional[str]
    group_name: Optional[str]
    round_number: Optional[int]
    net_amount: Decimal
    balance_before: Decimal
    balance_after: Decimal
    status: str
    reference: str
    transaction_hash: Optional[str]
    blockchain_tx_hash: Optional[str]
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]


class DepositRequestResponse(BaseModel):
    id: str
    wallet_id: str
    amount: Decimal
    method: str
    status: str
    reference: str
    expires_at: Optional[datetime]
    transaction_id: Optional[str]
    payment_link: Optional[str]
    qr_code: Optional[str]
    instructions: Optional[str]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class WithdrawalRequestResponse(BaseModel):
    id: str
    wallet_id: str
    amount: Decimal
    fee: Decimal
    net_amount: Decimal
    method: str
    status: str
    priority: str
    bank_name: Optional[str] = None
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    mobile_provider: Optional[str] = None
    mobile_number: Optional[str] = None
    crypto_address: Optional[str] = None
    cash_pickup_location: Optional[str] = None
    reference: str
    estimated_completion: Optional[datetime]
    admin_notes: Optional[str] = None
    processed_by: Optional[str] = None
    processed_at: Optional[datetime] = None
    rejected_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class DepositInitiateRequest(BaseModel):
    amount: Decimal = Field(..., ge=Decimal("100"))
    payment_method: str
    source_details: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

    @validator("payment_method")
    def validate_payment_method(cls, value):
        if value not in {"bank", "mobile", "card", "crypto", "cash", "p2p"}:
            raise ValueError("Unsupported payment method")
        return value


class DepositInitiateResponse(BaseModel):
    transaction_id: str
    reference: str
    amount: Decimal
    payment_link: Optional[str] = None
    instructions: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None
    status: str


class WithdrawalInitiateRequest(BaseModel):
    amount: Decimal = Field(..., ge=Decimal("100"), le=Decimal("50000"))
    withdrawal_method: str
    destination_details: Dict[str, Any]
    notes: Optional[str] = None
    two_factor_code: Optional[str] = None

    @validator("withdrawal_method")
    def validate_withdrawal_method(cls, value):
        if value not in {"bank", "mobile", "crypto", "cash", "p2p"}:
            raise ValueError("Unsupported withdrawal method")
        return value


class WithdrawalInitiateResponse(BaseModel):
    withdrawal_id: str
    amount: Decimal
    status: str
    estimated_arrival: Optional[datetime] = None
    fee: Decimal
    reference: str


class WalletTransactionHistoryResponse(BaseModel):
    transactions: List[WalletTransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class WalletStatsResponse(BaseModel):
    total_balance: Decimal
    total_deposits: Decimal
    total_withdrawals: Decimal
    total_winnings: Decimal
    total_equb_paid: Decimal
    pending_deposits: Decimal
    pending_withdrawals: Decimal
    monthly_deposits: Decimal
    monthly_withdrawals: Decimal
    monthly_winnings: Decimal
    monthly_equb_paid: Decimal


class WalletStatementResponse(BaseModel):
    generated_at: datetime
    from_date: Optional[datetime]
    to_date: Optional[datetime]
    totals: Dict[str, Decimal]
    transactions: List[WalletTransactionResponse]


class AutoWithdrawSetupRequest(BaseModel):
    enabled: bool = True
    method: str
    threshold: Decimal = Field(..., ge=Decimal("100"))
    destination_details: Dict[str, Any]


class WinningDetailsResponse(BaseModel):
    group_id: str
    winning_transactions: List[WalletTransactionResponse]
    total_amount: Decimal


class AdminWithdrawalActionRequest(BaseModel):
    action: str
    notes: Optional[str] = None

    @validator("action")
    def validate_action(cls, value):
        if value not in {"approve", "reject", "complete", "hold"}:
            raise ValueError("Unsupported action")
        return value
