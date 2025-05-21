from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Parent, Student, User
from app.schemas.schemas import ParentCreate, ParentUpdate

def get_parent(db: Session, parent_id: int) -> Optional[Parent]:
    return db.query(Parent).filter(Parent.parent_id == parent_id).first()

def get_parent_by_user_id(db: Session, user_id: int) -> Optional[Parent]:
    return db.query(Parent).filter(Parent.user_id == user_id).first()

def get_parents(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    student_id: Optional[int] = None
) -> List[Parent]:
    query = db.query(Parent)
    
    if student_id is not None:
        query = query.filter(Parent.student_id == student_id)
        
    return query.offset(skip).limit(limit).all()

def create_parent(db: Session, parent: ParentCreate) -> Parent:
    # Check if student exists
    student = db.query(Student).filter(Student.student_id == parent.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check if user exists and is a parent
    user = db.query(User).filter(User.user_id == parent.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must have parent role"
        )
    
    # Check if parent profile already exists for this user
    db_parent = get_parent_by_user_id(db, user_id=parent.user_id)
    if db_parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a parent profile"
        )
    
    # Create parent
    db_parent = Parent(**parent.dict())
    
    db.add(db_parent)
    db.commit()
    db.refresh(db_parent)
    return db_parent

def update_parent(db: Session, parent_id: int, parent: ParentUpdate) -> Parent:
    db_parent = get_parent(db, parent_id=parent_id)
    if not db_parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    update_data = parent.dict(exclude_unset=True)
    
    # Update parent attributes
    for key, value in update_data.items():
        setattr(db_parent, key, value)
    
    db.commit()
    db.refresh(db_parent)
    return db_parent

def delete_parent(db: Session, parent_id: int) -> Parent:
    db_parent = get_parent(db, parent_id=parent_id)
    if not db_parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    db.delete(db_parent)
    db.commit()
    return db_parent
