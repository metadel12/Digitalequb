from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel, GUID
import enum

JSON_FIELD = JSON().with_variant(JSON, "sqlite")

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class UserStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BLOCKED = "blocked"

class KYCStatus(str, enum.Enum):
    NOT_SUBMITTED = "not_submitted"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    role = Column(Enum(UserRole), default=UserRole.USER)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING)
    
    # KYC Information
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.NOT_SUBMITTED)
    kyc_data = Column(JSON_FIELD, default={})
    kyc_submitted_at = Column(DateTime(timezone=True))
    kyc_verified_at = Column(DateTime(timezone=True))
    kyc_verified_by = Column(GUID(), ForeignKey("users.id"))
    
    # Financial Information
    credit_score = Column(Integer, default=0)
    total_savings = Column(Float, default=0.0)
    total_borrowed = Column(Float, default=0.0)
    total_repaid = Column(Float, default=0.0)
    default_count = Column(Integer, default=0)
    
    # Wallet Information
    wallet_address = Column(String(42), unique=True, index=True)
    private_key_encrypted = Column(String(500))
    
    # Two Factor Authentication
    is_2fa_enabled = Column(Boolean, default=False)
    totp_secret = Column(String(32))
    
    # Profile
    profile_picture = Column(String(500))
    date_of_birth = Column(DateTime(timezone=True))
    address = Column(JSON_FIELD, default={})
    saved_beneficiaries = Column(JSON_FIELD, default={
        "bank_accounts": [],
        "mobile_accounts": [],
        "crypto_wallets": []
    })
    withdrawal_settings = Column(JSON_FIELD, default={
        "daily_limit": 50000,
        "weekly_limit": 200000,
        "monthly_limit": 500000,
        "auto_approve_limit": 1000,
        "require_2fa": True
    })
    notification_preferences = Column(JSON_FIELD, default={
        "email": True,
        "sms": True,
        "push": True
    })
    profile_metadata = Column(JSON_FIELD, default={})
    app_settings = Column(JSON_FIELD, default={})
    privacy_settings = Column(JSON_FIELD, default={})
    security_settings = Column(JSON_FIELD, default={})
    active_sessions = Column(JSON_FIELD, default=[])
    login_history = Column(JSON_FIELD, default=[])
    
    # Security
    last_login = Column(DateTime(timezone=True))
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True))
    
    # Relationships
    groups_created = relationship("Group", back_populates="creator", foreign_keys="Group.created_by")
    group_memberships = relationship("GroupMember", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    wallet = relationship("Wallet", back_populates="user", uselist=False)

class Group(BaseModel):
    __tablename__ = "groups"
    
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    
    # Group Details
    contribution_amount = Column(Float, nullable=False)
    frequency = Column(String(50), nullable=False)  # daily, weekly, monthly
    duration_weeks = Column(Integer, nullable=False)
    max_members = Column(Integer, nullable=False)
    current_members = Column(Integer, default=1)
    
    # Status
    status = Column(String(50), default="pending")  # pending, active, completed, cancelled
    
    # Blockchain
    contract_address = Column(String(42), unique=True, index=True)
    blockchain_tx_hash = Column(String(66))
    
    # Creator
    created_by = Column(GUID(), ForeignKey("users.id"), nullable=False)
    
    # Dates
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    
    # Rules
    rules = Column(JSON_FIELD, default={})
    is_private = Column(Boolean, default=False)
    join_code = Column(String(10), unique=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="group")
    wallet_transactions = relationship("WalletTransaction", back_populates="group")
    
class GroupMember(BaseModel):
    __tablename__ = "group_members"
    
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    group_id = Column(GUID(), ForeignKey("groups.id"), nullable=False)
    
    # Member Details
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    position = Column(Integer)  # Position in rotation
    contribution_count = Column(Integer, default=0)
    received_payout = Column(Boolean, default=False)
    payout_amount = Column(Float, default=0.0)
    payout_received_at = Column(DateTime(timezone=True))
    
    # Payment Status
    next_payment_due = Column(DateTime(timezone=True))
    missed_payments = Column(Integer, default=0)
    total_contributed = Column(Float, default=0.0)
    
    # Relationships
    user = relationship("User", back_populates="group_memberships")
    group = relationship("Group", back_populates="members")

class Transaction(BaseModel):
    __tablename__ = "transactions"
    
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    group_id = Column(GUID(), ForeignKey("groups.id"), nullable=False)
    
    # Transaction Details
    amount = Column(Float, nullable=False)
    type = Column(String(50), nullable=False)  # contribution, payout, fee, refund
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    
    # Payment Method
    payment_method = Column(String(50), nullable=False)  # bank, mobile_money, crypto, card
    
    # Blockchain
    blockchain_tx_hash = Column(String(66), unique=True)
    block_number = Column(Integer)
    
    # Metadata
    transaction_metadata = Column("metadata", JSON_FIELD, default={})
    notes = Column(String(500))
    
    # Timestamps
    processed_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    group = relationship("Group", back_populates="transactions")
    
class Notification(BaseModel):
    __tablename__ = "notifications"
    
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    
    # Notification Details
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    type = Column(String(50), nullable=False)  # payment, group, system, security
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    
    # Status
    read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    delivered = Column(Boolean, default=False)
    delivered_at = Column(DateTime(timezone=True))
    
    # Actions
    action_url = Column(String(500))
    action_text = Column(String(100))
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    
    user_id = Column(GUID(), ForeignKey("users.id"))
    
    # Log Details
    action = Column(String(100), nullable=False)
    resource = Column(String(100))
    resource_id = Column(GUID())
    
    # Context
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    details = Column(JSON_FIELD, default={})
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
