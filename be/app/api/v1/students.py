from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Student, ClassStudent, Class
from app.schemas.schemas import (
    StudentCreate, StudentUpdate, StudentResponse, 
    PaginationParams, SearchParams, PaginatedResponse,
    ClassResponse
)
from app.crud.student import (
    get_student, get_students, create_student, 
    update_student, delete_student, get_students_paginated,
    get_student_by_user_id
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

@router.get("/profile", response_model=StudentResponse)
async def get_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin profile của học sinh hiện tại
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ học sinh mới có thể xem profile của mình"
        )
    
    # Get student info
    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.user_id)
        .first()
    )
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin học sinh"
        )
    
    # Create response data with both user and student info
    response_data = {
        "student_id": student.student_id,
        "user_id": student.user_id,
        "student_code": student.student_code,        "name": current_user.full_name,
        "email": current_user.email,
        "phone_number": current_user.phone,
        "date_of_birth": student.date_of_birth,
        "gender": student.gender,
        "hometown": student.hometown,
        "current_address": student.current_address,
        "family_income_level": student.family_income_level,
        "family_background": student.family_background,
        "scholarship_status": student.scholarship_status,
        "scholarship_amount": float(student.scholarship_amount) if student.scholarship_amount else None,
        "health_condition": student.health_condition,
        "mental_health_status": student.mental_health_status,
        "attendance_rate": student.attendance_rate,
        "academic_status": student.academic_status
    }
    
    # Convert to StudentResponse model
    return StudentResponse(**response_data)

@router.put("/profile", response_model=StudentResponse)
async def update_student_profile(
    student_update: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin profile của học sinh
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ học sinh mới có thể cập nhật profile của mình"
        )
    
    student = get_student_by_user_id(db, current_user.user_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin học sinh"
        )
    
    # Giới hạn các trường được phép cập nhật
    allowed_fields = ["email", "phone_number", "current_address"]
    update_data = {k: v for k, v in student_update.dict(exclude_unset=True).items() 
                  if k in allowed_fields}
    
    # Cập nhật thông tin
    for key, value in update_data.items():
        setattr(student, key, value)
    
    db.commit()
    db.refresh(student)
    return student

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

@router.get("/{student_id}/classes", response_model=List[ClassResponse])
async def read_student_classes(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách lớp học của một sinh viên
    """
    # Kiểm tra quyền truy cập
    if current_user.role == "student":
        # Sinh viên chỉ có thể xem lớp học của chính mình
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student or student.student_id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem thông tin lớp học của sinh viên khác"
            )
    
    # Kiểm tra sinh viên tồn tại
    student = get_student(db, student_id=student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sinh viên"
        )
    
    # Lấy danh sách lớp học của sinh viên
    student_classes = (
        db.query(Class)
        .join(ClassStudent, Class.class_id == ClassStudent.class_id)
        .filter(
            ClassStudent.student_id == student_id,
            ClassStudent.status == "enrolled"  # Chỉ lấy các lớp mà sinh viên đang tham gia
        )
        .all()
    )
    
    return student_classes

@router.get("/user/{user_id}", response_model=StudentResponse)
async def read_student_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin sinh viên theo user_id
    Sinh viên chỉ được xem thông tin của bản thân
    """
    if current_user.role == "student" and current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền truy cập thông tin sinh viên khác"
        )
    
    db_student = get_student_by_user_id(db, user_id=user_id)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Không tìm thấy thông tin sinh viên"
        )
    return db_student
