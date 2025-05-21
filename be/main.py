import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.v1.api import api_router
from app.core.config import settings

# Tạo FastAPI application
app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Cấu hình CORS
origins = [str(origin) for origin in settings.CORS_ORIGINS]
if settings.DEBUG:
    origins.extend(["http://localhost:5173", "http://localhost:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Tạo thư mục uploads nếu chưa tồn tại
uploads_dir = os.path.join(os.getcwd(), settings.UPLOAD_DIR)
os.makedirs(uploads_dir, exist_ok=True)

# Mount static file server for uploads
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Chào mừng đến với API của Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

# Main function để chạy app trực tiếp
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
