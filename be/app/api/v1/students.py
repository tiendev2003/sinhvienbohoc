from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Student
from app.schemas.schemas import (
    StudentCreate, StudentUpdate, StudentResponse, 
    PaginationParams, SearchParams, PaginatedResponse
)
from app.crud.student import (
    get_student, get_students, create_student, 
    update_student, delete_student, get_students_paginated
)
from app.services.auth import get_current_active_user, check_admin_role, check_teacher_role

router = APIRouter()

@router.get("/", response_model=List[StudentResponse], deprecated=True)
async def read_students(
    skip: int = 0, 
    limit: int = 100, 
    academic_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách sinh viên (không dùng nữa, hãy sử dụng /paginated thay thế)
    """
    # Nếu là sinh viên, chỉ cho phép xem thông tin của bản thân
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student:
            return []
        return [student]
        
    # Nếu là giáo viên, cố vấn hoặc admin, cho phép xem danh sách
    students = get_students(db, skip=skip, limit=limit, academic_status=academic_status)
    return students

@router.get("/paginated", response_model=PaginatedResponse)
async def read_students_paginated(
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    query: Optional[str] = Query(None, description="Search query string"),
    field: Optional[str] = Query(None, description="Field to search in"),
    academic_status: Optional[str] = Query(None, description="Filter by academic status"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    class_id: Optional[int] = Query(None, description="Filter by class ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách sinh viên với phân trang, tìm kiếm và lọc
    """
    # Xử lý phân quyền
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student:
            return {"items": [], "total": 0, "page": page, "size": size, "pages": 0}
        return {
            "items": [student],
            "total": 1,
            "page": 1,
            "size": 1,
            "pages": 1
        }
    
    # Tạo các tham số phân trang và tìm kiếm
    pagination = PaginationParams(page=page, size=size)
    search = SearchParams(query=query, field=field) if query else None
    
    # Tạo các tham số lọc
    filters = {}
    if academic_status:
        filters["academic_status"] = academic_status
    if gender:
        filters["gender"] = gender
    if class_id:
        filters["class_id"] = class_id
    
    # Lấy dữ liệu sinh viên với phân trang
    students, total = get_students_paginated(
        db=db, 
        pagination=pagination,
        search=search,
        filters=filters
    )
    
    # Tính số trang
    pages = (total + pagination.size - 1) // pagination.size
    
    return {
        "items": students,
        "total": total,
        "page": pagination.page,
        "size": pagination.size,
        "pages": pages
    }

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_student(
    student: StudentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Tạo sinh viên mới, chỉ admin mới có quyền
    """
    return create_student(db=db, student=student)

@router.get("/{student_id}", response_model=StudentResponse)
async def read_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin sinh viên theo ID
    Sinh viên chỉ được xem thông tin của bản thân
    """
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student or student.student_id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không đủ quyền truy cập thông tin sinh viên khác"
            )
    
    db_student = get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")
    return db_student

@router.put("/{student_id}", response_model=StudentResponse)
async def update_student_info(
    student_id: int, 
    student: StudentUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin sinh viên
    Sinh viên chỉ được cập nhật một số thông tin của bản thân
    Giáo viên và admin có thể cập nhật thêm các thông tin khác
    """
    db_student = get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")
        
    # Nếu là sinh viên, chỉ được cập nhật thông tin cá nhân của bản thân
    if current_user.role == "student":
        student_self = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student_self or student_self.student_id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không đủ quyền cập nhật thông tin sinh viên khác"
            )
            
        # Giới hạn các trường sinh viên được phép cập nhật
        allowed_fields = ["current_address", "phone", "health_condition", "mental_health_status"]
        update_data = student.dict(exclude_unset=True)
        for field in list(update_data.keys()):
            if field not in allowed_fields:
                update_data.pop(field)
                
        # Cập nhật student từ dữ liệu đã lọc
        for key, value in update_data.items():
            setattr(db_student, key, value)
        
        db.commit()
        db.refresh(db_student)
        return db_student
        
    # Nếu là giáo viên, không được cập nhật một số trường nhất định
    elif current_user.role == "teacher":
        restricted_fields = ["scholarship_status", "scholarship_amount", "entry_year", "expected_graduation_year"]
        update_data = student.dict(exclude_unset=True)
        for field in list(update_data.keys()):
            if field in restricted_fields:
                update_data.pop(field)
                
        # Cập nhật student từ dữ liệu đã lọc
        for key, value in update_data.items():
            setattr(db_student, key, value)
        
        db.commit()
        db.refresh(db_student)
        return db_student
    
    # Nếu là admin hoặc cố vấn, được cập nhật tất cả thông tin
    else:
        return update_student(db=db, student_id=student_id, student=student)

@router.delete("/{student_id}", response_model=StudentResponse)
async def delete_student_info(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Xóa sinh viên, chỉ admin mới có quyền
    """
    return delete_student(db=db, student_id=student_id)
