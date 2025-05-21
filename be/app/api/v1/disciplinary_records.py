from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import date

from app.db.database import get_db
from app.models.models import User, Student, Teacher, DisciplinaryRecord
from app.schemas.schemas import DisciplinaryRecordCreate, DisciplinaryRecordUpdate, DisciplinaryRecordResponse
from app.crud import disciplinary_record as disciplinary_crud
from app.api.v1.auth import get_current_active_user
from app.services.auth import check_admin_role

router = APIRouter()

@router.get("/", response_model=List[DisciplinaryRecordResponse])
async def read_disciplinary_records(
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=1000),
    student_id: Optional[int] = None,
    severity_level: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách biên bản kỷ luật với bộ lọc tùy chọn:
    - ID sinh viên
    - Mức độ nghiêm trọng
    - Khoảng thời gian
    
    Sinh viên chỉ được xem biên bản của bản thân.
    """
    # Kiểm tra quyền
    if current_user.role == "student":
        # Sinh viên chỉ được xem biên bản của bản thân
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
                detail="Không có quyền xem biên bản kỷ luật của sinh viên khác"
            )
    
    records = disciplinary_crud.get_disciplinary_records(
        db, 
        skip=skip, 
        limit=limit, 
        student_id=student_id,
        severity_level=severity_level,
        from_date=from_date,
        to_date=to_date
    )
    return records

@router.post("/", response_model=DisciplinaryRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_new_disciplinary_record(
    record: DisciplinaryRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Tạo biên bản kỷ luật mới. Chỉ admin và giáo viên mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher", "counselor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền tạo biên bản kỷ luật"
        )
    
    return disciplinary_crud.create_disciplinary_record(db=db, record=record)

@router.get("/{record_id}", response_model=DisciplinaryRecordResponse)
async def read_disciplinary_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin chi tiết về biên bản kỷ luật.
    """
    db_record = disciplinary_crud.get_disciplinary_record(db, record_id=record_id)
    if db_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy biên bản kỷ luật"
        )
    
    # Kiểm tra quyền
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student or db_record.student_id != student.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem biên bản kỷ luật này"
            )
    
    return db_record

@router.put("/{record_id}", response_model=DisciplinaryRecordResponse)
async def update_disciplinary_record_info(
    record_id: int,
    record: DisciplinaryRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin biên bản kỷ luật. Chỉ admin, giáo viên và cố vấn mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role not in ["admin", "teacher", "counselor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền cập nhật biên bản kỷ luật"
        )
    
    return disciplinary_crud.update_disciplinary_record(db=db, record_id=record_id, record=record)

@router.delete("/{record_id}", response_model=DisciplinaryRecordResponse)
async def delete_disciplinary_record_info(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Xóa biên bản kỷ luật. Chỉ admin mới có quyền.
    """
    # Chỉ admin mới có quyền xóa biên bản kỷ luật
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền xóa biên bản kỷ luật"
        )
    
    return disciplinary_crud.delete_disciplinary_record(db=db, record_id=record_id)
