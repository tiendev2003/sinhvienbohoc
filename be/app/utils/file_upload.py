import os
import uuid
from fastapi import UploadFile, HTTPException, status
from pathlib import Path
from typing import List, Optional

from app.core.config import settings

class FileUploader:
    @staticmethod
    def validate_image(file: UploadFile) -> None:
        """Validate that uploaded file is an allowed image type and size"""
        # Check file type
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )
        
        # Check file size - we need to consume the file to check its size
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)  # Reset file pointer to beginning
        
        if file_size > settings.MAX_IMAGE_SIZE:
            max_size_mb = settings.MAX_IMAGE_SIZE / (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum allowed size: {max_size_mb} MB"
            )    @staticmethod
    def save_image(file: UploadFile, subfolder: str = "") -> str:
        """Save image to disk and return its path"""
        # Create uploads directory if it doesn't exist
        upload_dir = Path(settings.UPLOAD_DIR)
        if subfolder:
            upload_dir = upload_dir / subfolder
        
        # Create directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        if not file_ext:  # If no extension, default to jpg
            file_ext = ".jpg"
            
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save the file
        try:
            # Reset file pointer to the beginning
            file.file.seek(0)
            
            with open(file_path, "wb") as f:
                f.write(file.file.read())
            
            # Return relative path for database storage
            if subfolder:
                return f"{subfolder}/{unique_filename}".replace('\\', '/')
            return unique_filename
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while saving the file: {str(e)}"
            )
    
    @staticmethod
    def get_image_url(image_path: str) -> str:
        """Convert relative image path to URL"""
        if not image_path:
            return None
        
        # Check if image_path already has the uploads prefix
        if not image_path.startswith(settings.UPLOAD_DIR):
            return f"{settings.UPLOAD_DIR}/{image_path}"
        return image_path

    @staticmethod
    def delete_image(image_path: Optional[str]) -> bool:
        """Delete image from disk"""
        if not image_path:
            return False
        
        # Convert to absolute path if needed
        if not os.path.isabs(image_path):
            file_path = os.path.join(settings.UPLOAD_DIR, image_path)
        else:
            file_path = image_path
        
        # Delete the file if it exists
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception:
            pass
        
        return False
