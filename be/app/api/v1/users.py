from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserUpdate, UserResponse
from app.crud.user import get_user, get_users, create_user, update_user, delete_user
from app.services.auth import get_current_active_user, check_admin_role

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Lấy danh sách người dùng, chỉ admin mới có quyền
    """
    users = get_users(db, skip=skip, limit=limit, role=role)
    return users

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_new_user(
    user: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Tạo người dùng mới, chỉ admin mới có quyền
    """
    return create_user(db=db, user=user)

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin người dùng theo ID
    Chỉ admin hoặc chính người dùng đó mới có quyền truy cập
    """
    if current_user.role != "admin" and current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền truy cập thông tin người dùng khác"
        )
        
    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user_info(
    user_id: int, 
    user: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin người dùng
    Chỉ admin hoặc chính người dùng đó mới có quyền cập nhật
    Admin có thể cập nhật tất cả thông tin
    Người dùng chỉ có thể cập nhật thông tin cá nhân, không thể đổi status
    """
    if current_user.role != "admin" and current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền cập nhật thông tin người dùng khác"
        )
        
    # Nếu người dùng không phải admin, không cho phép cập nhật account_status
    if current_user.role != "admin" and user.account_status is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền cập nhật trạng thái tài khoản"
        )
        
    return update_user(db=db, user_id=user_id, user=user)

@router.delete("/{user_id}", response_model=UserResponse)
async def delete_user_account(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Xóa người dùng, chỉ admin mới có quyền
    """
    return delete_user(db=db, user_id=user_id)
