from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if ObjectId.is_valid(v):
            return str(v)
        raise ValueError("Invalid ObjectId")

class EqubBase(BaseModel):
    name: str
    description: Optional[str] = None
    contribution_amount: float
    cycle_duration_days: int
    max_members: int
    is_active: bool = True

class EqubCreate(EqubBase):
    pass

class EqubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    contribution_amount: Optional[float] = None
    cycle_duration_days: Optional[int] = None
    max_members: Optional[int] = None
    is_active: Optional[bool] = None

class EqubInDB(EqubBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    creator_id: PyObjectId
    member_ids: List[PyObjectId] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Equb(EqubBase):
    id: str
    creator_id: str
    member_ids: List[str]
    created_at: datetime
    updated_at: datetime

class EqubMember(BaseModel):
    user_id: str
    joined_at: datetime
