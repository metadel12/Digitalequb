from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.user import PyObjectId

class CreditScoreBase(BaseModel):
    user_id: str
    score: int
    calculated_at: datetime = Field(default_factory=datetime.utcnow)
    factors: Optional[dict] = None  # Additional scoring factors

class CreditScoreInDB(CreditScoreBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CreditScore(CreditScoreBase):
    id: str