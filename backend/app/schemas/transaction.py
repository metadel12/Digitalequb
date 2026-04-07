from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.user import PyObjectId
from enum import Enum

class TransactionType(str, Enum):
    CONTRIBUTION = "contribution"
    PAYOUT = "payout"
    WITHDRAWAL = "withdrawal"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class TransactionBase(BaseModel):
    amount: float
    type: TransactionType
    description: Optional[str] = None
    status: TransactionStatus = TransactionStatus.PENDING

class TransactionCreate(TransactionBase):
    user_id: str
    equb_id: str

class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    description: Optional[str] = None

class TransactionInDB(TransactionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    equb_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Transaction(TransactionBase):
    id: str
    user_id: str
    equb_id: str
    created_at: datetime
    updated_at: datetime