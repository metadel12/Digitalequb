from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentUploadResponse(BaseModel):
    id: str
    user_id: str
    document_type: str
    file_name: str
    url: str
    uploaded_at: datetime


class DocumentsCollection(BaseModel):
    user_id: str
    property_document_url: Optional[str] = None
    wealth_document_url: Optional[str] = None
    uploaded_at: datetime = None

    class Config:
        arbitrary_types_allowed = True


class DocumentUploadRequest(BaseModel):
    document_type: str  # "property_document" or "wealth_document"
