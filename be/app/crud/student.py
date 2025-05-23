from typing import List, Optional, Dict, Any, Union, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import HTTPException, status
from app.models.models import Student
from app.schemas.schemas import StudentCreate, StudentUpdate, PaginationParams, SearchParams
from app.crud.base import CRUDBase

class CRUDStudent(CRUDBase[Student, StudentCreate, StudentUpdate]):
    """
    CRUD operations for Student model
    """
    def get_by_id(self, db: Session, student_id: int) -> Optional[Student]:
        return db.query(Student).filter(Student.student_id == student_id).first()
    
    def get_by_code(self, db: Session, student_code: str) -> Optional[Student]:
        return db.query(Student).filter(Student.student_code == student_code).first()
    
    def get_by_user_id(self, db: Session, user_id: int) -> Optional[Student]:
        return db.query(Student).filter(Student.user_id == user_id).first()
    
    def create_with_validation(self, db: Session, student_in: StudentCreate) -> Student:
        """
        Create a student with code and user_id validation
        """
        # Check if student code already exists
        db_student = self.get_by_code(db, student_code=student_in.student_code)
        if db_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student code already registered"
            )
        
        # Check if user_id already has a student profile
        db_student = self.get_by_user_id(db, user_id=student_in.user_id)
        if db_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has a student profile"
            )
        
        # Create student
        return super().create(db, obj_in=student_in)
    
    def get_student_details(
        self,
        db: Session,
        student_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed student information including related data
        """
        student = self.get_by_id(db, student_id)
        if not student:
            return None
            
        # Here you could add logic to fetch additional related data
        # Example: attendance records, grades, etc.
        
        return student


# Create a singleton instance for the CRUD Student operations
student = CRUDStudent(Student)

# Compatibility functions for the existing API
def get_student(db: Session, student_id: int) -> Optional[Student]:
    return student.get_by_id(db, student_id)

def get_student_by_code(db: Session, student_code: str) -> Optional[Student]:
    return student.get_by_code(db, student_code)

def get_student_by_user_id(db: Session, user_id: int) -> Optional[Student]:
    return student.get_by_user_id(db, user_id)

def get_students(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    academic_status: Optional[str] = None
) -> List[Student]:
    filters = {}
    if academic_status:
        filters["academic_status"] = academic_status
    return student.get_multi(db, skip=skip, limit=limit, filters=filters)

def get_students_paginated(
    db: Session,
    pagination: PaginationParams,
    search: Optional[SearchParams] = None,
    filters: Optional[Dict[str, Any]] = None
) -> Tuple[List[Student], int]:
    """
    Get paginated list of students with search and filter capabilities
    """
    search_fields = ["student_code", "first_name", "last_name", "email", "phone_number"]
    return student.get_paginated(
        db=db,
        pagination=pagination,
        search=search,
        filters=filters,
        search_fields=search_fields
    )

def create_student(db: Session, student_in: StudentCreate) -> Student:
    return student.create_with_validation(db, student_in)

def update_student(db: Session, student_id: int, student_in: StudentUpdate) -> Student:
    db_student = get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return student.update(db, db_obj=db_student, obj_in=student_in)

def delete_student(db: Session, student_id: int) -> Student:
    db_student = get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return student.remove(db, id=student_id)

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
