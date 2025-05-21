from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.schemas import TeacherCreate, TeacherUpdate, TeacherResponse, UserResponse
from app.models.models import Teacher, User
from app.crud import teacher as teacher_crud
from app.api.v1.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[TeacherResponse])
def read_teachers(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    department: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve teachers with optional filtering by department.
    """
    teachers = teacher_crud.get_teachers(db, skip=skip, limit=limit, department=department)
    return teachers

@router.post("/", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
def create_teacher(
    teacher: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new teacher.
    """
    # Check permission (only admin users can create teachers)
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return teacher_crud.create_teacher(db=db, teacher=teacher)

@router.get("/{teacher_id}", response_model=TeacherResponse)
def read_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific teacher by ID.
    """
    db_teacher = teacher_crud.get_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    return db_teacher

@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(
    teacher_id: int,
    teacher: TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a teacher.
    """
    # Check permission (only admin users or the teacher themselves can update)
    db_teacher = teacher_crud.get_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
        
    if current_user.role != "admin" and current_user.user_id != db_teacher.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return teacher_crud.update_teacher(db=db, teacher_id=teacher_id, teacher=teacher)

@router.delete("/{teacher_id}", response_model=TeacherResponse)
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a teacher.
    """
    # Check permission (only admin users can delete teachers)
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return teacher_crud.delete_teacher(db=db, teacher_id=teacher_id)
