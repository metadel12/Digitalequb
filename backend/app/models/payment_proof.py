from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from bson import ObjectId
from app.schemas.user import PyObjectId

class PaymentProof(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    group_id: str
    round_number: int
    amount: float = Field(..., gt=0)
    transaction_reference: str
    proof_image: str  # URL or base64
    status: str = Field(..., pattern=r'^(pending|verified|rejected)$')
    admin_notes: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
