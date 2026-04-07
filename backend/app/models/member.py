from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.user import PyObjectId

class MemberBase(BaseModel):
    user_id: str
    equb_id: str
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class MemberInDB(MemberBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Member(MemberBase):
    id: str