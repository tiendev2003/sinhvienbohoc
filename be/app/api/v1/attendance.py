from typing import List, Optional, Dict, Any
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Student, Teacher
from app.models.attendance import Attendance
from app.schemas.attendance import (
    AttendanceCreate, AttendanceUpdate, AttendanceResponse,
    AttendanceSummary, BulkAttendanceCreate
)
from app.crud import attendance as attendance_crud
from app.api.v1.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[AttendanceResponse])
async def read_attendance_records(
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=1000),
    student_id: Optional[int] = None,
    class_id: Optional[int] = None,
    date: Optional[date] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách điểm danh với các bộ lọc tùy chọn:
    - ID sinh viên
    - ID lớp học
    - Ngày cụ thể 
    - Khoảng thời gian (start_date và end_date)
    - Trạng thái (present, absent, late, excused)
    
    Nếu không cung cấp giá trị cho các tham số, hệ thống sẽ trả về tất cả dữ liệu điểm danh
    dựa trên quyền của người dùng.
    
    Sinh viên chỉ được xem điểm danh của bản thân.
    """
    # Kiểm tra quyền
    if current_user.role == "student":
        # Sinh viên chỉ được xem điểm danh của bản thân
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy thông tin sinh viên"
            )
        
        # Nếu không chỉ định student_id, sử dụng ID của sinh viên đang đăng nhập
        if student_id is None:
            student_id = student.student_id
        
        # Nếu chỉ định student_id khác với ID của sinh viên đang đăng nhập, từ chối
        elif student_id != student.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem thông tin điểm danh của sinh viên khác"
            )
    
    # Phụ huynh chỉ được xem điểm danh của con em mình
    elif current_user.role == "parent":
        from app.models.models import Parent
        parent = db.query(Parent).filter(Parent.user_id == current_user.user_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy thông tin phụ huynh"
            )
        
        # Nếu không chỉ định student_id, sử dụng ID của sinh viên liên quan đến phụ huynh này
        if student_id is None:
            student_id = parent.student_id
        
        # Nếu chỉ định student_id khác với ID của sinh viên liên quan đến phụ huynh, từ chối
        elif student_id != parent.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem thông tin điểm danh của sinh viên khác"
            )
    records = attendance_crud.get_attendance_records(
        db, 
        skip=skip, 
        limit=limit, 
        student_id=student_id,
        class_id=class_id,
        date=date,
        start_date=start_date,
        end_date=end_date,
        status=status
    )
    return records

@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def create_new_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Tạo bản ghi điểm danh mới. Chỉ admin và giáo viên mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền tạo bản ghi điểm danh"
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
        class_obj = db.query(Class).filter(Class.class_id == attendance.class_id).first()
        if not class_obj or class_obj.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền tạo điểm danh cho lớp này"
            )
    
    return attendance_crud.create_attendance(db=db, attendance=attendance)

@router.get("/summary/{student_id}", response_model=AttendanceSummary)
async def get_attendance_summary(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thống kê tổng hợp điểm danh của một sinh viên
    """
    # Kiểm tra quyền
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student or student.student_id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem thống kê điểm danh của sinh viên khác"
            )
    
    elif current_user.role == "parent":
        from app.models.models import Parent
        parent = db.query(Parent).filter(Parent.user_id == current_user.user_id).first()
        if not parent or parent.student_id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem thống kê điểm danh của sinh viên khác"
            )
    
    # Kiểm tra sinh viên tồn tại
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sinh viên"
        )
    
    return attendance_crud.get_student_attendance_summary(db, student_id)

@router.post("/bulk", response_model=List[AttendanceResponse], status_code=status.HTTP_201_CREATED)
async def create_bulk_attendance(
    bulk_data: BulkAttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Tạo nhiều bản ghi điểm danh cùng lúc cho một lớp học vào một ngày cụ thể
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền tạo bản ghi điểm danh"
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
        class_obj = db.query(Class).filter(Class.class_id == bulk_data.class_id).first()
        if not class_obj or class_obj.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền tạo điểm danh cho lớp này"
            )
    
    return attendance_crud.bulk_create_attendance(
        db, 
        class_id=bulk_data.class_id,
        date=bulk_data.date,
        records=bulk_data.records
    )

@router.get("/{attendance_id}", response_model=AttendanceResponse)
async def read_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin chi tiết của một bản ghi điểm danh
    """
    db_attendance = attendance_crud.get_attendance(db, attendance_id=attendance_id)
    if db_attendance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bản ghi điểm danh"
        )
    
    # Kiểm tra quyền
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student or db_attendance.student_id != student.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem bản ghi điểm danh này"
            )
    
    elif current_user.role == "parent":
        from app.models.models import Parent
        parent = db.query(Parent).filter(Parent.user_id == current_user.user_id).first()
        if not parent or db_attendance.student_id != parent.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem bản ghi điểm danh này"
            )
    
    return db_attendance

@router.put("/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance_record(
    attendance_id: int,
    attendance: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật bản ghi điểm danh. Chỉ admin và giáo viên phụ trách lớp mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền cập nhật bản ghi điểm danh"
        )
    
    db_attendance = attendance_crud.get_attendance(db, attendance_id=attendance_id)
    if not db_attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bản ghi điểm danh"
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
        class_obj = db.query(Class).filter(Class.class_id == db_attendance.class_id).first()
        if not class_obj or class_obj.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền cập nhật điểm danh cho lớp này"
            )
    
    return attendance_crud.update_attendance(db=db, attendance_id=attendance_id, attendance=attendance)

@router.delete("/{attendance_id}", response_model=AttendanceResponse)
async def delete_attendance_record(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Xóa bản ghi điểm danh. Chỉ admin và giáo viên phụ trách lớp mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền xóa bản ghi điểm danh"
        )
    
    db_attendance = attendance_crud.get_attendance(db, attendance_id=attendance_id)
    if not db_attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bản ghi điểm danh"
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
        class_obj = db.query(Class).filter(Class.class_id == db_attendance.class_id).first()
        if not class_obj or class_obj.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xóa điểm danh cho lớp này"
            )
    
    return attendance_crud.delete_attendance(db=db, attendance_id=attendance_id)
