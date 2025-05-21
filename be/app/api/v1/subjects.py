from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Subject
from app.schemas.schemas import SubjectCreate, SubjectUpdate, SubjectResponse
from app.crud import subject as subject_crud
from app.services.auth import get_current_active_user, check_admin_role, check_teacher_role

router = APIRouter()

@router.get("/", response_model=List[SubjectResponse])
async def read_subjects(
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=1000),
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách môn học với bộ lọc tùy chọn theo bộ môn/khoa.
    """
    subjects = subject_crud.get_subjects(
        db, 
        skip=skip, 
        limit=limit, 
        department=department
    )
    return subjects

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_new_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Tạo môn học mới. Chỉ admin mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền tạo môn học"
        )
    
    return subject_crud.create_subject(db=db, subject=subject)

@router.get("/{subject_id}", response_model=SubjectResponse)
async def read_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin chi tiết về một môn học.
    """
    db_subject = subject_crud.get_subject(db, subject_id=subject_id)
    if db_subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy môn học"
        )
    return db_subject

@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject_info(
    subject_id: int,
    subject: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin môn học. Chỉ admin mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền cập nhật môn học"
        )
    
    return subject_crud.update_subject(db=db, subject_id=subject_id, subject=subject)

@router.delete("/{subject_id}", response_model=SubjectResponse)
async def delete_subject_info(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Xóa môn học. Chỉ admin mới có quyền.
    """
    return subject_crud.delete_subject(db=db, subject_id=subject_id)
