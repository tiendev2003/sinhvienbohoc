from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Parent, Student
from app.schemas.schemas import ParentCreate, ParentUpdate, ParentResponse
from app.crud import parent as parent_crud
from app.api.v1.auth import get_current_active_user
from app.services.auth import check_admin_role

router = APIRouter()

@router.get("/", response_model=List[ParentResponse])
async def read_parents(
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=1000),
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách phụ huynh/người giám hộ, có thể lọc theo ID sinh viên.
    """
    # Kiểm tra quyền
    if current_user.role == "student":
        # Sinh viên chỉ có thể xem thông tin phụ huynh của mình
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
                detail="Không có quyền xem thông tin phụ huynh của sinh viên khác"
            )
    
    # Nếu là phụ huynh, chỉ được xem thông tin của con mình
    elif current_user.role == "parent":
        parent = db.query(Parent).filter(Parent.user_id == current_user.user_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy thông tin phụ huynh"
            )
        
        # Phụ huynh chỉ được xem thông tin của con mình hoặc của chính mình
        if student_id is not None and student_id != parent.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem thông tin phụ huynh của sinh viên khác"
            )
        
        # Nếu không chỉ định student_id, sử dụng ID của sinh viên liên quan đến phụ huynh này
        if student_id is None:
            student_id = parent.student_id
    
    parents = parent_crud.get_parents(
        db, 
        skip=skip, 
        limit=limit, 
        student_id=student_id
    )
    return parents

@router.post("/", response_model=ParentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_parent(
    parent: ParentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Tạo mới liên kết phụ huynh với sinh viên. Chỉ admin mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền tạo liên kết phụ huynh-sinh viên"
        )
    
    return parent_crud.create_parent(db=db, parent=parent)

@router.get("/{parent_id}", response_model=ParentResponse)
async def read_parent(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin chi tiết của một phụ huynh.
    """
    db_parent = parent_crud.get_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin phụ huynh"
        )
    
    # Kiểm tra quyền
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student or db_parent.student_id != student.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem thông tin phụ huynh này"
            )
    
    elif current_user.role == "parent":
        if db_parent.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xem thông tin phụ huynh khác"
            )
    
    return db_parent

@router.put("/{parent_id}", response_model=ParentResponse)
async def update_parent_info(
    parent_id: int,
    parent: ParentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin phụ huynh. Admin và phụ huynh liên quan mới có quyền.
    """
    db_parent = parent_crud.get_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin phụ huynh"
        )
    
    # Kiểm tra quyền
    if current_user.role == "parent" and db_parent.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền cập nhật thông tin phụ huynh khác"
        )
    
    elif current_user.role not in ["admin", "parent", "counselor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền cập nhật thông tin phụ huynh"
        )
    
    return parent_crud.update_parent(db=db, parent_id=parent_id, parent=parent)

@router.delete("/{parent_id}", response_model=ParentResponse)
async def delete_parent_info(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Xóa thông tin phụ huynh. Chỉ admin mới có quyền.
    """
    # Kiểm tra quyền
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền xóa thông tin phụ huynh"
        )
    
    return parent_crud.delete_parent(db=db, parent_id=parent_id)
