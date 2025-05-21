from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Student
from app.schemas.schemas import StudentCreate, StudentUpdate, StudentResponse
from app.crud.student import get_student, get_students, create_student, update_student, delete_student
from app.services.auth import get_current_active_user, check_admin_role, check_teacher_role

router = APIRouter()

@router.get("/", response_model=List[StudentResponse])
async def read_students(
    skip: int = 0, 
    limit: int = 100, 
    academic_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách sinh viên
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
