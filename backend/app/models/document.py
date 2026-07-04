from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.user import PyObjectId
from enum import Enum


class DocumentType(str, Enum):
    PROPERTY_DOCUMENT = "property_document"
    WEALTH_DOCUMENT = "wealth_document"


class DocumentBase(BaseModel):
    user_id: str
    document_type: str  # "property_document" or "wealth_document"
    file_name: str
    file_size: int  # in bytes
    url: str  # Supabase URL
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class DocumentInDB(DocumentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Document(DocumentBase):
    id: str
