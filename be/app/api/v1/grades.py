from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Grade, Student, Teacher
from app.schemas.schemas import GradeCreate, GradeUpdate, GradeResponse
from app.crud import grade as grade_crud
from app.services.auth import get_current_active_user, check_admin_role, check_teacher_role

router = APIRouter()

@router.get("/", response_model=List[GradeResponse])
async def read_grades(
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=1000),
    student_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách điểm với bộ lọc tùy chọn:
    - ID sinh viên
    - ID môn học
    - ID lớp học
    
    Sinh viên chỉ được xem điểm của bản thân.
    """
    # Kiểm tra quyền
    if current_user.role == "student":
        # Sinh viên chỉ được xem điểm của bản thân
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy thông tin sinh viên"
            )
        
        # Nếu người dùng không chỉ định student_id thì sử dụng ID của họ
        # Nếu chỉ định student_id khác với ID của họ thì từ chối
        if student_id is None:
            student_id = student.student_id
        elif student_id != student.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem điểm của sinh viên khác"
            )
    
    grades = grade_crud.get_grades(
        db, 
        skip=skip, 
        limit=limit, 
        student_id=student_id,
        subject_id=subject_id,
        class_id=class_id
    )
    return grades

@router.post("/", response_model=GradeResponse, status_code=status.HTTP_201_CREATED)
async def create_new_grade(
    grade: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Tạo điểm mới cho sinh viên. Chỉ admin và giáo viên mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền tạo điểm"
        )
    
    # Nếu là giáo viên, kiểm tra xem có phụ trách lớp này không
    if current_user.role == "teacher":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.user_id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy thông tin giáo viên"
            )
        
        # Kiểm tra xem giáo viên có phụ trách lớp này không
        from app.models.models import Class
        class_obj = db.query(Class).filter(Class.class_id == grade.class_id).first()
        if not class_obj or class_obj.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền tạo điểm cho lớp này"
            )
    
    return grade_crud.create_grade(db=db, grade=grade)

@router.get("/{grade_id}", response_model=GradeResponse)
async def read_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin chi tiết về điểm của một sinh viên.
    """
    db_grade = grade_crud.get_grade(db, grade_id=grade_id)
    if db_grade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin điểm"
        )
    
    # Kiểm tra quyền
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student or db_grade.student_id != student.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem điểm này"
            )
    
    return db_grade

@router.put("/{grade_id}", response_model=GradeResponse)
async def update_grade_info(
    grade_id: int,
    grade: GradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin điểm. Chỉ admin và giáo viên phụ trách lớp mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền cập nhật điểm"
        )
    
    db_grade = grade_crud.get_grade(db, grade_id=grade_id)
    if not db_grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin điểm"
        )
    
    # Nếu là giáo viên, kiểm tra xem có phụ trách lớp này không
    if current_user.role == "teacher":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.user_id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy thông tin giáo viên"
            )
        
        # Kiểm tra xem giáo viên có phụ trách lớp này không
        from app.models.models import Class
        class_obj = db.query(Class).filter(Class.class_id == db_grade.class_id).first()
        if not class_obj or class_obj.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền cập nhật điểm cho lớp này"
            )
    
    return grade_crud.update_grade(db=db, grade_id=grade_id, grade=grade)

@router.delete("/{grade_id}", response_model=GradeResponse)
async def delete_grade_info(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Xóa thông tin điểm. Chỉ admin mới có quyền.
    """
    # Chỉ admin mới có quyền xóa điểm
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền xóa điểm"
        )
    
    return grade_crud.delete_grade(db=db, grade_id=grade_id)
