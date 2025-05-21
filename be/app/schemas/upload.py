from pydantic import BaseModel, HttpUrl
from typing import Optional, List

class FileUploadResponse(BaseModel):
    filename: str
    filepath: str
    content_type: str
    size: int

class ImageUploadResponse(FileUploadResponse):
    url: str

class BulkUploadResponse(BaseModel):
    uploaded_files: List[FileUploadResponse]
    failed_files: List[str] = []
