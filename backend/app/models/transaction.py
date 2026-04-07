from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from app.schemas.transaction import (
    Transaction,
    TransactionCreate,
    TransactionInDB,
    TransactionUpdate,
)

class PaymentInitiate(BaseModel):
    group_id: UUID
    amount: float = Field(..., gt=0)
    payment_method: str  # bank, mobile_money, crypto, card
    metadata: Optional[Dict[str, Any]] = None

class PaymentConfirm(BaseModel):
    transaction_id: UUID
    reference: str
    payment_details: Dict[str, Any]

class TransactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    group_id: UUID
    amount: float
    type: str
    status: str
    payment_method: str
    blockchain_tx_hash: Optional[str]
    created_at: datetime
    processed_at: Optional[datetime]
    completed_at: Optional[datetime]
    metadata: Optional[Dict[str, Any]]
    
    class Config:
        from_attributes = True

class PaymentMethod(BaseModel):
    type: str
    name: str
    logo: str
    enabled: bool
    fields: Dict[str, Any]

class PaymentHistoryResponse(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    page: int
    size: int
