from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Teacher
from app.schemas.schemas import TeacherCreate, TeacherUpdate

def get_teacher(db: Session, teacher_id: int) -> Optional[Teacher]:
    return db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()

def get_teacher_by_code(db: Session, teacher_code: str) -> Optional[Teacher]:
    return db.query(Teacher).filter(Teacher.teacher_code == teacher_code).first()

def get_teacher_by_user_id(db: Session, user_id: int) -> Optional[Teacher]:
    return db.query(Teacher).filter(Teacher.user_id == user_id).first()

def get_teachers(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    department: Optional[str] = None
) -> List[Teacher]:
    query = db.query(Teacher)
    if department:
        query = query.filter(Teacher.department == department)
    return query.offset(skip).limit(limit).all()

def create_teacher(db: Session, teacher: TeacherCreate) -> Teacher:
    # Check if teacher code already exists
    db_teacher = get_teacher_by_code(db, teacher_code=teacher.teacher_code)
    if db_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher code already registered"
        )
    
    # Check if user_id already has a teacher profile
    db_teacher = get_teacher_by_user_id(db, user_id=teacher.user_id)
    if db_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a teacher profile"
        )
    
    # Create teacher
    db_teacher = Teacher(**teacher.dict())
    
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def update_teacher(db: Session, teacher_id: int, teacher: TeacherUpdate) -> Teacher:
    db_teacher = get_teacher(db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    update_data = teacher.dict(exclude_unset=True)
    
    # Update teacher attributes
    for key, value in update_data.items():
        setattr(db_teacher, key, value)
    
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def delete_teacher(db: Session, teacher_id: int) -> Teacher:
    db_teacher = get_teacher(db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    db.delete(db_teacher)
    db.commit()
    return db_teacher
