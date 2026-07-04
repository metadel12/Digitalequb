from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.dependencies import get_current_user
from app.models.user import User
from app.services.document_service import DocumentService
from app.database import get_database
from app.core.config import settings
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


async def get_document_service(db: AsyncIOMotorDatabase = Depends(get_database)):
    return DocumentService(db)


@router.get("/debug")
async def debug_supabase():
    """
    Debug endpoint to check Supabase configuration.
    """
    return {
        "supabase_url": settings.SUPABASE_URL if settings.SUPABASE_URL else "NOT SET",
        "supabase_key_set": bool(settings.SUPABASE_KEY),
        "supabase_key_length": len(settings.SUPABASE_KEY) if settings.SUPABASE_KEY else 0,
        "bucket_name": settings.SUPABASE_DOCUMENTS_BUCKET,
        "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
        "supabase_url_valid": not (settings.SUPABASE_URL and settings.SUPABASE_URL.startswith("https://your")),
        "supabase_key_valid": not (not settings.SUPABASE_KEY or settings.SUPABASE_KEY == "your-supabase-key")
    }


@router.post("/upload")
async def upload_document(
    document_type: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    document_service: DocumentService = Depends(get_document_service)
):
    """
    Upload a document (property document or wealth document).
    File size must be <= 2MB.
    """
    if document_type not in ["property_document", "wealth_document"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document type must be 'property_document' or 'wealth_document'"
        )

    return await document_service.upload_document(
        user_id=str(current_user.id),
        document_type=document_type,
        file=file
    )


@router.get("/my-documents")
async def get_my_documents(
    current_user: User = Depends(get_current_user),
    document_service: DocumentService = Depends(get_document_service)
):
    """
    Get all documents for the current user.
    Returns URLs for id_document and proof_of_residence.
    """
    return await document_service.get_user_documents(str(current_user.id))


@router.delete("/delete-all")
async def delete_all_documents(
    current_user: User = Depends(get_current_user),
    document_service: DocumentService = Depends(get_document_service)
):
    """
    Delete all documents for the current user.
    """
    success = await document_service.delete_user_documents(str(current_user.id))
    if success:
        return {"message": "All documents deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to delete documents"
    )
