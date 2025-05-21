import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from typing import List, Optional

from app.core.config import settings
from app.utils.file_upload import FileUploader
from app.schemas.upload import FileUploadResponse, ImageUploadResponse, BulkUploadResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/image", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    subfolder: str = Form(""),
    current_user = Depends(get_current_user)
):
    """
    Upload một hình ảnh
    """
    # Validate image
    FileUploader.validate_image(file)
    
    # Save the image
    saved_path = FileUploader.save_image(file, subfolder)
    
    # Get file size after saving
    file_path = os.path.join(settings.UPLOAD_DIR, saved_path)
    file_size = os.path.getsize(file_path)
    
    # Return the response
    image_url = f"/uploads/{saved_path}"
    
    return ImageUploadResponse(
        filename=file.filename,
        filepath=saved_path,
        content_type=file.content_type,
        size=file_size,
        url=image_url
    )

@router.get("/image/{filename}", response_model=ImageUploadResponse)
async def get_image_details(
    filename: str,
    subfolder: str = "",
    current_user = Depends(get_current_user)
):
    """
    Lấy thông tin chi tiết về một hình ảnh
    """
    # Build file path
    if subfolder:
        relative_path = os.path.join(subfolder, filename)
        file_path = os.path.join(settings.UPLOAD_DIR, subfolder, filename)
    else:
        relative_path = filename
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy file"
        )
    
    # Get file details
    file_size = os.path.getsize(file_path)
    content_type = "image/jpeg"  # Default for simplicity
    
    # Determine content type based on file extension
    if filename.lower().endswith(".png"):
        content_type = "image/png"
    elif filename.lower().endswith(".gif"):
        content_type = "image/gif"
    elif filename.lower().endswith(".bmp"):
        content_type = "image/bmp"
    elif filename.lower().endswith(".webp"):
        content_type = "image/webp"
    
    # Return the response
    image_url = f"/uploads/{relative_path}"
    
    return ImageUploadResponse(
        filename=filename,
        filepath=relative_path,
        content_type=content_type,
        size=file_size,
        url=image_url
    )

@router.post("/images", response_model=BulkUploadResponse)
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    subfolder: str = Form(""),
    current_user = Depends(get_current_user)
):
    """
    Upload nhiều hình ảnh cùng lúc
    """
    response = BulkUploadResponse(uploaded_files=[], failed_files=[])
    
    for file in files:
        try:
            # Validate image
            FileUploader.validate_image(file)
            
            # Save the image
            saved_path = FileUploader.save_image(file, subfolder)
            
            # Get file size after saving
            file_path = os.path.join(settings.UPLOAD_DIR, saved_path)
            file_size = os.path.getsize(file_path)
            
            # Add to uploaded files
            image_url = f"/uploads/{saved_path}"
            response.uploaded_files.append(
                ImageUploadResponse(
                    filename=file.filename,
                    filepath=saved_path,
                    content_type=file.content_type,
                    size=file_size,
                    url=image_url
                )
            )
        except Exception as e:
            # Add to failed files
            response.failed_files.append(f"{file.filename}: {str(e)}")
    
    return response

@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    subfolder: str = "",
    current_user = Depends(get_current_user)
):
    """
    Xóa một hình ảnh
    """
    # Build file path
    if subfolder:
        file_path = os.path.join(settings.UPLOAD_DIR, subfolder, filename)
    else:
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Delete the file
    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while deleting the file: {str(e)}"
        )
