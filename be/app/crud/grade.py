from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Grade, Student, Class, Subject
from app.schemas.schemas import GradeCreate, GradeUpdate

def get_grade(db: Session, grade_id: int) -> Optional[Grade]:
    return db.query(Grade).filter(Grade.grade_id == grade_id).first()

def get_grades(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    student_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    class_id: Optional[int] = None
) -> List[Grade]:
    query = db.query(Grade)
    
    if student_id is not None:
        query = query.filter(Grade.student_id == student_id)
    
    if subject_id is not None:
        query = query.filter(Grade.subject_id == subject_id)
        
    if class_id is not None:
        query = query.filter(Grade.class_id == class_id)
        
    return query.offset(skip).limit(limit).all()

def create_grade(db: Session, grade: GradeCreate) -> Grade:
    # Validate that student exists
    student = db.query(Student).filter(Student.student_id == grade.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Validate that subject exists
    subject = db.query(Subject).filter(Subject.subject_id == grade.subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Validate that class exists
    class_obj = db.query(Class).filter(Class.class_id == grade.class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if grade already exists for this student-subject-class combination
    existing_grade = db.query(Grade).filter(
        Grade.student_id == grade.student_id,
        Grade.subject_id == grade.subject_id,
        Grade.class_id == grade.class_id
    ).first()
    
    if existing_grade:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Grade already exists for this student-subject-class combination"
        )
    
    # Create grade
    db_grade = Grade(**grade.dict())
    
    # Calculate GPA if assignment, midterm, and final scores are provided
    if grade.assignment_score is not None and grade.midterm_score is not None and grade.final_score is not None:
        # Example GPA calculation (adjust according to your grading policy)
        # For example: 20% assignment + 30% midterm + 50% final
        db_grade.gpa = (grade.assignment_score * 0.2 + 
                        grade.midterm_score * 0.3 + 
                        grade.final_score * 0.5)
    
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade

def update_grade(db: Session, grade_id: int, grade: GradeUpdate) -> Grade:
    db_grade = get_grade(db, grade_id=grade_id)
    if not db_grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    update_data = grade.dict(exclude_unset=True)
    
    # Update grade attributes
    for key, value in update_data.items():
        setattr(db_grade, key, value)
    
    # Recalculate GPA if any score was updated
    if ('assignment_score' in update_data or 
        'midterm_score' in update_data or 
        'final_score' in update_data):
        
        # Only recalculate if all scores are now available
        if (db_grade.assignment_score is not None and 
            db_grade.midterm_score is not None and 
            db_grade.final_score is not None):
            
            # Example GPA calculation (adjust according to your grading policy)
            db_grade.gpa = (db_grade.assignment_score * 0.2 + 
                           db_grade.midterm_score * 0.3 + 
                           db_grade.final_score * 0.5)
    
    db.commit()
    db.refresh(db_grade)
    return db_grade

def delete_grade(db: Session, grade_id: int) -> Grade:
    db_grade = get_grade(db, grade_id=grade_id)
    if not db_grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    db.delete(db_grade)
    db.commit()
    return db_grade
