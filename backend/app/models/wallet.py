from sqlalchemy import Column, String, Numeric, ForeignKey, Text, Integer, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel

class Wallet(BaseModel):
    __tablename__ = "wallets"

    user_id = Column(String, ForeignKey('users.id'), nullable=False, unique=True)
    balance = Column(Numeric(precision=15, scale=2), default=0.00)
    currency = Column(String(3), default='ETB')
    wallet_address = Column(String, unique=True, nullable=True)
    total_deposits = Column(Numeric(precision=15, scale=2), default=0.00)
    total_withdrawals = Column(Numeric(precision=15, scale=2), default=0.00)
    total_winnings = Column(Numeric(precision=15, scale=2), default=0.00)
    total_equb_paid = Column(Numeric(precision=15, scale=2), default=0.00)
    pending_deposits = Column(Numeric(precision=15, scale=2), default=0.00)
    pending_withdrawals = Column(Numeric(precision=15, scale=2), default=0.00)
    total_transactions = Column(Integer, default=0)
    last_transaction_at = Column(DateTime(timezone=True), nullable=True)
    is_locked = Column(Boolean, default=False)
    auto_withdraw_enabled = Column(Boolean, default=False)
    auto_deposit_enabled = Column(Boolean, default=False)
    daily_withdrawal_limit = Column(Numeric(precision=15, scale=2), default=50000.00)
    weekly_withdrawal_limit = Column(Numeric(precision=15, scale=2), default=200000.00)
    monthly_withdrawal_limit = Column(Numeric(precision=15, scale=2), default=500000.00)
    spending_limit = Column(Numeric(precision=15, scale=2), default=0.00)
    linked_accounts = Column(Text, nullable=True)
    private_key_encrypted = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")
    withdrawal_requests = relationship("WithdrawalRequest", back_populates="wallet", cascade="all, delete-orphan")
    deposit_requests = relationship("DepositRequest", back_populates="wallet", cascade="all, delete-orphan")


class SystemWallet(BaseModel):
    __tablename__ = "system_wallets"

    label = Column(String, nullable=False, default="DigiEqub Earnings Wallet")
    currency = Column(String(3), default="ETB")
    balance = Column(Numeric(precision=15, scale=2), default=0.00)
    total_fees_collected = Column(Numeric(precision=15, scale=2), default=0.00)
    total_payouts_processed = Column(Numeric(precision=15, scale=2), default=0.00)
    last_transaction_at = Column(DateTime(timezone=True), nullable=True)

    transactions = relationship("SystemWalletTransaction", back_populates="system_wallet", cascade="all, delete-orphan")


class SystemWalletTransaction(BaseModel):
    __tablename__ = "system_wallet_transactions"

    system_wallet_id = Column(String, ForeignKey("system_wallets.id"), nullable=False)
    group_id = Column(String, ForeignKey("groups.id"), nullable=True)
    winner_record_id = Column(String, ForeignKey("winner_records.id"), nullable=True)
    type = Column(String, nullable=False)  # fee_collected, adjustment
    amount = Column(Numeric(precision=15, scale=2), nullable=False)
    balance_before = Column(Numeric(precision=15, scale=2), default=0.00)
    balance_after = Column(Numeric(precision=15, scale=2), default=0.00)
    round_number = Column(Integer, nullable=True)
    status = Column(String, default="completed")
    reference = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    transaction_metadata = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    system_wallet = relationship("SystemWallet", back_populates="transactions")
    group = relationship("Group")
    winner_record = relationship("WinnerRecord", back_populates="system_wallet_transactions")

class WalletTransaction(BaseModel):
    __tablename__ = "wallet_transactions"

    wallet_id = Column(String, ForeignKey('wallets.id'), nullable=False)
    group_id = Column(String, ForeignKey('groups.id'), nullable=True)
    type = Column(String, nullable=False)  # deposit, withdrawal, winning, fee, refund
    amount = Column(Numeric(precision=15, scale=2), nullable=False)
    fee = Column(Numeric(precision=15, scale=2), default=0.00)
    net_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    balance_before = Column(Numeric(precision=15, scale=2), default=0.00)
    balance_after = Column(Numeric(precision=15, scale=2), default=0.00)
    status = Column(String, default='pending')  # pending, processing, completed, failed, cancelled
    payment_method = Column(String, nullable=True)
    reference = Column(String, unique=True, nullable=False)
    group_name = Column(String, nullable=True)
    round_number = Column(Integer, nullable=True)
    transaction_hash = Column(String, nullable=True)
    blockchain_tx_hash = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    transaction_metadata = Column(Text, nullable=True)  # JSON string for additional data
    approved_by = Column(String, ForeignKey('users.id'), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    failed_reason = Column(Text, nullable=True)

    # Relationships
    wallet = relationship("Wallet", back_populates="transactions")
    group = relationship("Group", back_populates="wallet_transactions")
    approver = relationship("User", foreign_keys=[approved_by])


class WinnerRecord(BaseModel):
    __tablename__ = "winner_records"

    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    winner_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    winner_name = Column(String, nullable=False)
    winner_email = Column(String, nullable=True)
    selection_method = Column(String, nullable=False, default="random")
    total_collected = Column(Numeric(precision=15, scale=2), nullable=False)
    winner_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    system_fee = Column(Numeric(precision=15, scale=2), nullable=False)
    payout_reference = Column(String, unique=True, nullable=False)
    winner_transaction_reference = Column(String, nullable=True)
    bid_amount = Column(Numeric(precision=15, scale=2), nullable=True)
    status = Column(String, default="paid")
    paid_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(Text, nullable=True)

    group = relationship("Group")
    winner = relationship("User")
    system_wallet_transactions = relationship("SystemWalletTransaction", back_populates="winner_record")

class WithdrawalRequest(BaseModel):
    __tablename__ = "withdrawal_requests"

    wallet_id = Column(String, ForeignKey('wallets.id'), nullable=False)
    amount = Column(Numeric(precision=15, scale=2), nullable=False)
    fee = Column(Numeric(precision=15, scale=2), default=0.00)
    net_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    method = Column(String, nullable=False)  # bank, mobile, crypto, cash
    status = Column(String, default='pending')  # pending, approved, processing, completed, rejected, cancelled
    priority = Column(String, default='normal')  # low, normal, high, urgent

    # Destination details
    bank_name = Column(String, nullable=True)
    account_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    mobile_provider = Column(String, nullable=True)
    mobile_number = Column(String, nullable=True)
    crypto_address = Column(String, nullable=True)
    cash_pickup_location = Column(String, nullable=True)

    # Processing details
    reference = Column(String, unique=True, nullable=False)
    estimated_completion = Column(DateTime(timezone=True), nullable=True)
    admin_notes = Column(Text, nullable=True)
    processed_by = Column(String, ForeignKey('users.id'), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    rejected_reason = Column(Text, nullable=True)

    # Relationships
    wallet = relationship("Wallet", back_populates="withdrawal_requests")
    processor = relationship("User", foreign_keys=[processed_by])

class DepositRequest(BaseModel):
    __tablename__ = "deposit_requests"

    wallet_id = Column(String, ForeignKey('wallets.id'), nullable=False)
    amount = Column(Numeric(precision=15, scale=2), nullable=False)
    method = Column(String, nullable=False)  # bank, mobile, card, crypto, cash
    status = Column(String, default='pending')  # pending, processing, completed, failed
    reference = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Source details
    bank_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    mobile_provider = Column(String, nullable=True)
    mobile_number = Column(String, nullable=True)
    card_last4 = Column(String(4), nullable=True)
    crypto_address = Column(String, nullable=True)

    # Processing
    transaction_id = Column(String, nullable=True)
    payment_link = Column(String, nullable=True)
    qr_code = Column(String, nullable=True)
    instructions = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    wallet = relationship("Wallet", back_populates="deposit_requests")
