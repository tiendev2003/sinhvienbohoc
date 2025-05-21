from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Student
from app.schemas.schemas import StudentCreate, StudentUpdate

def get_student(db: Session, student_id: int) -> Optional[Student]:
    return db.query(Student).filter(Student.student_id == student_id).first()

def get_student_by_code(db: Session, student_code: str) -> Optional[Student]:
    return db.query(Student).filter(Student.student_code == student_code).first()

def get_student_by_user_id(db: Session, user_id: int) -> Optional[Student]:
    return db.query(Student).filter(Student.user_id == user_id).first()

def get_students(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    academic_status: Optional[str] = None
) -> List[Student]:
    query = db.query(Student)
    if academic_status:
        query = query.filter(Student.academic_status == academic_status)
    return query.offset(skip).limit(limit).all()

def create_student(db: Session, student: StudentCreate) -> Student:
    # Check if student code already exists
    db_student = get_student_by_code(db, student_code=student.student_code)
    if db_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student code already registered"
        )
    
    # Check if user_id already has a student profile
    db_student = get_student_by_user_id(db, user_id=student.user_id)
    if db_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a student profile"
        )
    
    # Create student
    db_student = Student(**student.dict())
    
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: int, student: StudentUpdate) -> Student:
    db_student = get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    update_data = student.dict(exclude_unset=True)
    
    # Update student attributes
    for key, value in update_data.items():
        setattr(db_student, key, value)
    
    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int) -> Student:
    db_student = get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    db.delete(db_student)
    db.commit()
    return db_student
