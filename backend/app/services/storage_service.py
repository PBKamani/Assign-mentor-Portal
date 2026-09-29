import os
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from app.firebase import get_storage_bucket, is_mock_mode

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

class StorageService:
    @staticmethod
    def validate_image(file: UploadFile):
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Filename cannot be empty"
            )

        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{ext}'. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        if file.content_type and file.content_type.lower() not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid MIME type '{file.content_type}'. Must be JPEG, PNG, or WEBP."
            )

    @classmethod
    async def upload_diagram(
        cls,
        file: UploadFile,
        diagram_type: str,  # "question-diagrams" or "answer-diagrams"
        subject_id: str,
        assignment_id: str,
        question_id: str
    ) -> str:
        cls.validate_image(file)

        ext = os.path.splitext(file.filename)[1].lower()
        unique_name = f"{uuid.uuid4().hex[:8]}{ext}"
        blob_path = f"assignmentor/{diagram_type}/{subject_id}/{assignment_id}/{question_id}/{unique_name}"

        bucket = get_storage_bucket()
        blob = bucket.blob(blob_path)

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024 * 1024)}MB."
            )

        if is_mock_mode():
            blob.upload_from_string(contents, content_type=file.content_type)
            return f"/api/upload/static/{blob_path}"
        else:
            blob.upload_from_string(contents, content_type=file.content_type)
            try:
                blob.make_public()
                return blob.public_url
            except Exception:
                import urllib.parse
                encoded = urllib.parse.quote(blob_path, safe='')
                return f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{encoded}?alt=media"

    @classmethod
    def delete_by_url(cls, image_url: Optional[str]):
        if not image_url:
            return

        try:
            bucket = get_storage_bucket()
            import urllib.parse
            if "/api/upload/static/" in image_url:
                blob_path = image_url.split("/api/upload/static/")[1]
            elif "/o/" in image_url:
                encoded = image_url.split("/o/")[1].split("?")[0]
                blob_path = urllib.parse.unquote(encoded)
            elif "googleapis.com" in image_url:
                parts = image_url.split("/")
                blob_path = "/".join(parts[parts.index(bucket.name) + 1:]) if bucket.name in parts else parts[-1]
            else:
                return

            blob = bucket.blob(blob_path)
            blob.delete()
        except Exception as e:
            print(f"[Storage] Warning: Failed to delete image {image_url}: {e}")

storage_service = StorageService()
