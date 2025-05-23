from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Class, ClassStudent, Teacher, Student
from app.schemas.schemas import (
    ClassCreate, ClassUpdate, ClassResponse, 
    ClassStudentCreate, ClassStudentUpdate, ClassStudentResponse,
    StudentResponse
)
from app.crud import class_crud
from app.services.auth import get_current_active_user, check_admin_role, check_teacher_role

router = APIRouter()

@router.get("/", response_model=List[ClassResponse])
async def read_classes(
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=1000),
    department: Optional[str] = None,
    academic_year: Optional[str] = None,
    semester: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách lớp học với các bộ lọc tùy chọn:
    - Bộ môn/khoa
    - Năm học
    - Học kỳ
    
    Admin có thể xem tất cả các lớp.
    Giáo viên chỉ có thể xem các lớp mà họ phụ trách.
    Sinh viên chỉ có thể xem các lớp mà họ đang tham gia.
    """
    teacher_id = None
    class_filter = None
    
    # Nếu là giáo viên, chỉ xem được lớp của mình
    if current_user.role == "teacher":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.user_id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy thông tin giáo viên"
            )
        teacher_id = teacher.teacher_id
    
    # Nếu là sinh viên, chỉ xem được lớp mình tham gia
    elif current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy thông tin sinh viên"
            )
        
        # Lấy danh sách ID của các lớp mà sinh viên đang tham gia
        enrolled_class_ids = (
            db.query(ClassStudent.class_id)
            .filter(
                ClassStudent.student_id == student.student_id,
                ClassStudent.status == "enrolled"
            )
            .all()
        )
        class_filter = [class_id[0] for class_id in enrolled_class_ids]
        if not class_filter:  # Nếu sinh viên không tham gia lớp nào
            return []
    
    classes = class_crud.get_classes(
        db, 
        skip=skip, 
        limit=limit, 
        teacher_id=teacher_id,
        department=department,
        academic_year=academic_year,
        semester=semester,
        class_filter=class_filter
    )
    return classes

@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_new_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Tạo lớp học mới. Chỉ admin và giáo viên mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền tạo lớp học"
        )
    
    return class_crud.create_class(db=db, class_data=class_data)

@router.get("/{class_id}", response_model=ClassResponse)
async def read_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin chi tiết về một lớp học.
    """
    db_class = class_crud.get_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học"
        )
    return db_class

@router.put("/{class_id}", response_model=ClassResponse)
async def update_class_info(
    class_id: int,
    class_data: ClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin lớp học.
    """
    # Kiểm tra quyền
    db_class = class_crud.get_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học"
        )
    
    # Admin có tất cả quyền, giáo viên chỉ có thể chỉnh sửa lớp mình phụ trách
    if current_user.role == "teacher":
        # Trong trường hợp này, cần kiểm tra xem teacher_id trong db_class có phải
        # là ID của giáo viên đang đăng nhập không
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.user_id).first()
        if not teacher or db_class.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền chỉnh sửa lớp này"
            )
    elif current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền chỉnh sửa lớp học"
        )
    
    return class_crud.update_class(db=db, class_id=class_id, class_data=class_data)

@router.delete("/{class_id}", response_model=ClassResponse)
async def delete_class_info(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Xóa lớp học. Chỉ admin mới có quyền.
    """
    return class_crud.delete_class(db=db, class_id=class_id)

@router.get("/{class_id}/students", response_model=List[ClassStudentResponse])
async def read_class_students(
    class_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách sinh viên trong một lớp học.
    """
    db_class = class_crud.get_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học"
        )
    
    # Kiểm tra quyền (sinh viên chỉ có thể xem lớp của mình)
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy thông tin sinh viên"
            )
        
        # Kiểm tra xem sinh viên có trong lớp này không
        enrollment = db.query(ClassStudent).filter(
            ClassStudent.class_id == class_id,
            ClassStudent.student_id == student.student_id,
            ClassStudent.status == "enrolled"
        ).first()
        
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem thông tin lớp học này"
            )
    
    return class_crud.get_students_in_class(db, class_id=class_id, skip=skip, limit=limit)

from typing import List
from fastapi import Body

@router.post("/{class_id}/students", response_model=List[ClassStudentResponse])
async def add_students_to_class(
    class_id: int,
    student_ids: List[int] = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Thêm sinh viên vào lớp học. Admin và giáo viên phụ trách lớp có quyền.
    Có thể thêm một hoặc nhiều sinh viên cùng lúc.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền thêm sinh viên vào lớp"
        )
    
    # Nếu là giáo viên, kiểm tra xem có phải lớp do mình phụ trách không
    if current_user.role == "teacher":
        db_class = class_crud.get_class(db, class_id=class_id)
        if not db_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy lớp học"
            )
        
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.user_id).first()
        if not teacher or db_class.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền quản lý lớp này"
            )
    
    return class_crud.add_students_bulk(db=db, class_id=class_id, student_ids=student_ids)

@router.delete("/{class_id}/students/{student_id}", response_model=ClassStudentResponse)
async def remove_student_from_class(
    class_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Xóa sinh viên khỏi lớp học. Admin và giáo viên phụ trách lớp có quyền.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền xóa sinh viên khỏi lớp"
        )
    
    # Nếu là giáo viên, kiểm tra xem có phải lớp do mình phụ trách không
    if current_user.role == "teacher":
        db_class = class_crud.get_class(db, class_id=class_id)
        if not db_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy lớp học"
            )
        
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.user_id).first()
        if not teacher or db_class.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền quản lý lớp này"
            )
    
    return class_crud.remove_student_from_class(db=db, class_id=class_id, student_id=student_id)

@router.get("/{class_id}/available-students", response_model=List[StudentResponse])
async def get_available_students(
    class_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get list of students not currently enrolled in the class.
    Only admin and teachers in charge of the class have access.
    """
    # Check permissions
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view available students"
        )
    
    # If teacher, check if they are in charge of this class
    if current_user.role == "teacher":
        db_class = class_crud.get_class(db, class_id=class_id)
        if not db_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found"
            )
        
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.user_id).first()
        if not teacher or db_class.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to manage this class"
            )
    
    return class_crud.get_available_students(db=db, class_id=class_id, skip=skip, limit=limit)
