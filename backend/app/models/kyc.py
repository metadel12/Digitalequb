from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.user import PyObjectId
from enum import Enum

class KYCStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class KYCBase(BaseModel):
    user_id: str
    document_type: str  # e.g., "passport", "id_card"
    document_number: str
    status: KYCStatus = KYCStatus.PENDING
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewer_id: Optional[str] = None
    notes: Optional[str] = None

class KYCInDB(KYCBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class KYC(KYCBase):
    id: str