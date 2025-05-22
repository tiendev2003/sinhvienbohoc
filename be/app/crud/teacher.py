from typing import List, Optional, Dict, Any, Union, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import HTTPException, status
from app.models.models import Teacher
from app.schemas.schemas import TeacherCreate, TeacherUpdate, PaginationParams, SearchParams
from app.crud.base import CRUDBase

class CRUDTeacher(CRUDBase[Teacher, TeacherCreate, TeacherUpdate]):
    """
    CRUD operations for Teacher model
    """
    def get_by_id(self, db: Session, teacher_id: int) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    
    def get_by_code(self, db: Session, teacher_code: str) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.teacher_code == teacher_code).first()
    
    def get_by_user_id(self, db: Session, user_id: int) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.user_id == user_id).first()
    
    def create_with_validation(self, db: Session, teacher_in: TeacherCreate) -> Teacher:
        """
        Create a teacher with code and user_id validation
        """
        # Check if teacher code already exists
        db_teacher = self.get_by_code(db, teacher_code=teacher_in.teacher_code)
        if db_teacher:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Teacher code already registered"
            )
        
        # Check if user_id already has a teacher profile
        db_teacher = self.get_by_user_id(db, user_id=teacher_in.user_id)
        if db_teacher:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has a teacher profile"
            )
        
        # Create teacher
        return super().create(db, obj_in=teacher_in)
    
    def get_teacher_details(
        self,
        db: Session,
        teacher_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed teacher information including related data
        """
        teacher = self.get_by_id(db, teacher_id)
        if not teacher:
            return None
            
        # Here you could add logic to fetch additional related data
        # Example: classes taught, assigned subjects, etc.
        
        return teacher


# Create a singleton instance for the CRUD Teacher operations
teacher = CRUDTeacher(Teacher)

# Compatibility functions for the existing API
def get_teacher(db: Session, teacher_id: int) -> Optional[Teacher]:
    return teacher.get_by_id(db, teacher_id)

def get_teacher_by_code(db: Session, teacher_code: str) -> Optional[Teacher]:
    return teacher.get_by_code(db, teacher_code)

def get_teacher_by_user_id(db: Session, user_id: int) -> Optional[Teacher]:
    return teacher.get_by_user_id(db, user_id)

def get_teachers(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    department: Optional[str] = None
) -> List[Teacher]:
    filters = {}
    if department:
        filters["department"] = department
    return teacher.get_multi(db, skip=skip, limit=limit, filters=filters)

def get_teachers_paginated(
    db: Session,
    pagination: PaginationParams,
    search: Optional[SearchParams] = None,
    filters: Optional[Dict[str, Any]] = None
) -> Tuple[List[Teacher], int]:
    """
    Get paginated list of teachers with search and filter capabilities
    """
    search_fields = ["teacher_code", "first_name", "last_name", "email", "phone_number", "department", "academic_rank"] 
    return teacher.get_paginated(
        db=db,
        pagination=pagination,
        search=search,
        filters=filters,
        search_fields=search_fields
    )

def create_teacher(db: Session, teacher_in: TeacherCreate) -> Teacher:
    return teacher.create_with_validation(db, teacher_in)

def update_teacher(db: Session, teacher_id: int, teacher_in: TeacherUpdate) -> Teacher:
    db_teacher = get_teacher(db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    return teacher.update(db, db_obj=db_teacher, obj_in=teacher_in)

def delete_teacher(db: Session, teacher_id: int) -> Teacher:
    db_teacher = get_teacher(db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    return teacher.remove(db, id=teacher_id)
