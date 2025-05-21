from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Subject
from app.schemas.schemas import SubjectCreate, SubjectUpdate

def get_subject(db: Session, subject_id: int) -> Optional[Subject]:
    return db.query(Subject).filter(Subject.subject_id == subject_id).first()

def get_subject_by_code(db: Session, subject_code: str) -> Optional[Subject]:
    return db.query(Subject).filter(Subject.subject_code == subject_code).first()

def get_subjects(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    department: Optional[str] = None
) -> List[Subject]:
    query = db.query(Subject)
    
    if department:
        query = query.filter(Subject.department == department)
        
    return query.offset(skip).limit(limit).all()

def create_subject(db: Session, subject: SubjectCreate) -> Subject:
    # Check if subject code already exists
    db_subject = get_subject_by_code(db, subject_code=subject.subject_code)
    if db_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject code already exists"
        )
    
    # Create subject
    db_subject = Subject(**subject.dict())
    
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def update_subject(db: Session, subject_id: int, subject: SubjectUpdate) -> Subject:
    db_subject = get_subject(db, subject_id=subject_id)
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    update_data = subject.dict(exclude_unset=True)
    
    # Update subject attributes
    for key, value in update_data.items():
        setattr(db_subject, key, value)
    
    db.commit()
    db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int) -> Subject:
    db_subject = get_subject(db, subject_id=subject_id)
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    db.delete(db_subject)
    db.commit()
    return db_subject
