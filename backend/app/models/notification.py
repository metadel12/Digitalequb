from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId
from enum import Enum


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

class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class NotificationBase(BaseModel):
    type: NotificationType
    recipient: str  # email or phone number
    subject: Optional[str] = None
    message: str
    status: NotificationStatus = NotificationStatus.PENDING

class NotificationCreate(NotificationBase):
    user_id: str

class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None

class NotificationInDB(NotificationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    sent_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Notification(NotificationBase):
    id: str
    user_id: str
    sent_at: Optional[datetime] = None
    created_at: datetime
