from fastapi import UploadFile, HTTPException, status
from supabase import create_client, Client
from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import os
import uuid
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class DocumentService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.supabase = None
        self.bucket_name = settings.SUPABASE_DOCUMENTS_BUCKET
        self.max_file_size_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        self.documents_collection = db["documents"]
        
        # Initialize Supabase client
        try:
            if not settings.SUPABASE_URL or settings.SUPABASE_URL.startswith("https://your"):
                logger.warning("SUPABASE_URL is not properly configured")
            elif not settings.SUPABASE_KEY or settings.SUPABASE_KEY == "your-supabase-key":
                logger.warning("SUPABASE_KEY is not properly configured")
            else:
                self.supabase = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY
                )
                logger.info(f"Supabase client initialized with URL: {settings.SUPABASE_URL}")
                logger.info(f"Document service initialized with bucket: {self.bucket_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            self.supabase = None

    async def upload_document(
        self,
        user_id: str,
        document_type: str,
        file: UploadFile
    ) -> dict:
        """
        Upload a document to Supabase and store metadata in MongoDB.

        Args:
            user_id: The user ID
            document_type: Type of document ("property_document" or "wealth_document")
            file: The uploaded file

        Returns:
            Dictionary with document metadata including URL
        """
        try:
            # Check if Supabase is initialized
            if not self.supabase:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Supabase is not configured. Please check your environment variables (SUPABASE_URL and SUPABASE_KEY)."
                )
            
            logger.info(f"Starting upload for user {user_id}, type: {document_type}")
            
            # Validate file size
            file_content = await file.read()
            file_size = len(file_content)
            
            logger.info(f"File size: {file_size} bytes, Max: {self.max_file_size_bytes} bytes")
            
            if file_size > self.max_file_size_bytes:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
                )

            # Validate file type
            if not self._is_valid_file_type(file.content_type):
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="File type not supported. Only PDF, JPEG, PNG, and WebP are allowed."
                )

            # Generate unique file name
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{user_id}/{document_type}/{uuid.uuid4()}{file_extension}"
            
            logger.info(f"Uploading to Supabase: {unique_filename}")

            # Upload to Supabase
            try:
                response = self.supabase.storage.from_(self.bucket_name).upload(
                    path=unique_filename,
                    file=file_content,
                    file_options={"content-type": file.content_type}
                )
                logger.info(f"Supabase upload response: {response}")
            except Exception as upload_error:
                logger.error(f"Supabase upload error: {upload_error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload to Supabase: {str(upload_error)}"
                )

            # Get public URL
            try:
                public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(
                    unique_filename
                )
                logger.info(f"Generated public URL: {public_url}")
            except Exception as url_error:
                logger.error(f"Failed to get public URL: {url_error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to generate public URL: {str(url_error)}"
                )

            # Save metadata to MongoDB
            document_data = {
                "user_id": user_id,
                "document_type": document_type,
                "file_name": file.filename,
                "file_size": file_size,
                "url": public_url,
                "supabase_path": unique_filename,
                "uploaded_at": datetime.utcnow()
            }

            result = await self.documents_collection.insert_one(document_data)
            document_data["_id"] = str(result.inserted_id)
            
            logger.info(f"Document metadata saved to MongoDB: {result.inserted_id}")

            return {
                "id": str(result.inserted_id),
                "user_id": user_id,
                "document_type": document_type,
                "file_name": file.filename,
                "url": public_url,
                "uploaded_at": document_data["uploaded_at"]
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during document upload: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload document: {str(e)}"
            )

    async def get_user_documents(self, user_id: str) -> dict:
        """
        Get all documents for a user.

        Returns:
            Dictionary with property_document_url and wealth_document_url
        """
        try:
            logger.info(f"Retrieving documents for user: {user_id}")
            documents = await self.documents_collection.find(
                {"user_id": user_id}
            ).to_list(None)

            result = {
                "user_id": user_id,
                "property_document_url": None,
                "wealth_document_url": None
            }

            for doc in documents:
                if doc["document_type"] == "property_document":
                    result["property_document_url"] = doc["url"]
                elif doc["document_type"] == "wealth_document":
                    result["wealth_document_url"] = doc["url"]

            logger.info(f"Retrieved {len(documents)} documents for user: {user_id}")
            return result

        except Exception as e:
            logger.error(f"Failed to retrieve documents for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve documents: {str(e)}"
            )

    async def delete_user_documents(self, user_id: str) -> bool:
        """
        Delete all documents for a user from both Supabase and MongoDB.
        """
        try:
            logger.info(f"Deleting all documents for user: {user_id}")
            documents = await self.documents_collection.find(
                {"user_id": user_id}
            ).to_list(None)

            logger.info(f"Found {len(documents)} documents to delete for user: {user_id}")

            # Delete from Supabase
            for doc in documents:
                try:
                    self.supabase.storage.from_(self.bucket_name).remove(
                        [doc["supabase_path"]]
                    )
                    logger.info(f"Deleted file from Supabase: {doc['supabase_path']}")
                except Exception as e:
                    logger.error(f"Failed to delete file from Supabase: {e}")

            # Delete from MongoDB
            await self.documents_collection.delete_many({"user_id": user_id})
            logger.info(f"Deleted all MongoDB documents for user: {user_id}")

            return True

        except Exception as e:
            logger.error(f"Failed to delete documents for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete documents: {str(e)}"
            )

    def _is_valid_file_type(self, content_type: Optional[str]) -> bool:
        """Validate file type."""
        if not content_type:
            logger.warning("No content type provided")
            return False

        allowed_types = {
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
        }

        is_valid = content_type in allowed_types
        if not is_valid:
            logger.warning(f"Invalid content type: {content_type}")
        return is_valid
