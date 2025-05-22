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
    subfolder: Optional[str] = None,
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
            detail=f"Không tìm thấy file: {file_path}"
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
    
    # Return the response with normalized path separators
    relative_path = relative_path.replace('\\', '/')  # Normalize path separators
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
            detail=f"File not found: {file_path}"
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

@router.get("/uploads-status")
async def check_uploads_directory(
    current_user = Depends(get_current_user)
):
    """
    Kiểm tra trạng thái của thư mục uploads
    """
    upload_dir = settings.UPLOAD_DIR
    
    # Check if uploads directory exists
    if not os.path.exists(upload_dir):
        # Try to create it
        try:
            os.makedirs(upload_dir, exist_ok=True)
            return {
                "status": "created",
                "message": f"Thư mục uploads đã được tạo: {upload_dir}",
                "path": upload_dir,
                "writable": os.access(upload_dir, os.W_OK)
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Không thể tạo thư mục uploads: {str(e)}",
                "path": upload_dir
            }
    
    # Directory exists, check if it's a directory and writable
    if not os.path.isdir(upload_dir):
        return {
            "status": "error",
            "message": f"Đường dẫn uploads không phải là thư mục: {upload_dir}",
            "path": upload_dir
        }
        
    # Check if directory is writable
    writable = os.access(upload_dir, os.W_OK)
    
    # List files in directory
    try:
        files = os.listdir(upload_dir)
        return {
            "status": "ok",
            "message": f"Thư mục uploads tồn tại",
            "path": upload_dir,
            "absolute_path": os.path.abspath(upload_dir),
            "writable": writable,
            "file_count": len(files),
            "files": files[:10]  # Show only first 10 files
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Lỗi khi đọc thư mục uploads: {str(e)}",
            "path": upload_dir
        }

@router.get("/images", response_model=List[ImageUploadResponse])
async def list_images(
    subfolder: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """
    Liệt kê tất cả các hình ảnh trong một thư mục
    """
    # Determine directory to list
    if subfolder:
        directory = os.path.join(settings.UPLOAD_DIR, subfolder)
    else:
        directory = settings.UPLOAD_DIR
    
    # Check if directory exists and create if not
    if not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)
        return []  # Return empty list for new directory
    
    # List files
    try:
        files = []
        for filename in os.listdir(directory):
            # Skip directories
            file_path = os.path.join(directory, filename)
            if os.path.isdir(file_path):
                continue
                
            # Skip non-image files
            if not any(filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']):
                continue
                
            # Get file details
            file_size = os.path.getsize(file_path)
            content_type = "image/jpeg"  # Default
            
            # Determine content type based on file extension
            if filename.lower().endswith(".png"):
                content_type = "image/png"
            elif filename.lower().endswith(".gif"):
                content_type = "image/gif"
            elif filename.lower().endswith(".bmp"):
                content_type = "image/bmp"
            elif filename.lower().endswith(".webp"):
                content_type = "image/webp"
            
            # Build relative path for URL
            if subfolder:
                relative_path = os.path.join(subfolder, filename)
            else:
                relative_path = filename
                
            image_url = f"/uploads/{relative_path}"
            
            # Add to list
            files.append(
                ImageUploadResponse(
                    filename=filename,
                    filepath=relative_path,
                    content_type=content_type,
                    size=file_size,
                    url=image_url
                )
            )
        
        return files
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi đọc thư mục: {str(e)}"
        )

@router.get("/view/{filename}")
async def view_image(
    filename: str,
    subfolder: Optional[str] = None,
):
    """
    Xem hình ảnh (trả về nội dung nhị phân của hình ảnh)
    """
    from fastapi.responses import FileResponse
    
    # Build file path
    if subfolder:
        file_path = os.path.join(settings.UPLOAD_DIR, subfolder, filename)
    else:
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy file: {file_path}"
        )
    
    # Determine content type based on file extension
    content_type = "image/jpeg"  # Default
    if filename.lower().endswith(".png"):
        content_type = "image/png"
    elif filename.lower().endswith(".gif"):
        content_type = "image/gif"
    elif filename.lower().endswith(".bmp"):
        content_type = "image/bmp"
    elif filename.lower().endswith(".webp"):
        content_type = "image/webp"
    
    # Return file response with disable_cache=True to prevent browser caching
    return FileResponse(path=file_path, media_type=content_type, filename=filename)
