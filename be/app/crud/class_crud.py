from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Class, ClassStudent
from app.schemas.schemas import ClassCreate, ClassUpdate

def get_class(db: Session, class_id: int) -> Optional[Class]:
    return db.query(Class).filter(Class.class_id == class_id).first()

def get_classes(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    teacher_id: Optional[int] = None,
    department: Optional[str] = None,
    academic_year: Optional[str] = None,
    semester: Optional[str] = None
) -> List[Class]:
    query = db.query(Class)
    
    if teacher_id is not None:
        query = query.filter(Class.teacher_id == teacher_id)
    
    if department:
        query = query.filter(Class.department == department)
        
    if academic_year:
        query = query.filter(Class.academic_year == academic_year)
        
    if semester:
        query = query.filter(Class.semester == semester)
        
    return query.offset(skip).limit(limit).all()

def create_class(db: Session, class_data: ClassCreate) -> Class:
    # Extract subject IDs if provided
    subject_ids = class_data.subjects if class_data.subjects else []
    
    # Create class instance without subjects
    class_dict = class_data.dict(exclude={'subjects'})
    db_class = Class(**class_dict)
    
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    
    # Add subjects to class if provided
    from app.models.class_subject import ClassSubject
    for subject_id in subject_ids:
        db_class_subject = ClassSubject(
            class_id=db_class.class_id,
            subject_id=subject_id
        )
        db.add(db_class_subject)
    
    db.commit()
    db.refresh(db_class)
    return db_class

def update_class(db: Session, class_id: int, class_data: ClassUpdate) -> Class:
    db_class = get_class(db, class_id=class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Extract subject IDs if provided
    subject_ids = class_data.subjects if class_data.subjects is not None else None
    
    # Update class attributes excluding subjects
    update_data = class_data.dict(exclude={'subjects'}, exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_class, key, value)
    
    # Update subjects if provided
    if subject_ids is not None:
        from app.models.class_subject import ClassSubject
        
        # Remove existing class-subject relationships
        db.query(ClassSubject).filter(ClassSubject.class_id == class_id).delete()
        
        # Add new class-subject relationships
        for subject_id in subject_ids:
            db_class_subject = ClassSubject(
                class_id=class_id,
                subject_id=subject_id
            )
            db.add(db_class_subject)
    
    db.commit()
    db.refresh(db_class)
    return db_class

def delete_class(db: Session, class_id: int) -> Class:
    db_class = get_class(db, class_id=class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    db.delete(db_class)
    db.commit()
    return db_class

def get_students_in_class(db: Session, class_id: int, skip: int = 0, limit: int = 100) -> List[ClassStudent]:
    return db.query(ClassStudent).filter(
        ClassStudent.class_id == class_id
    ).offset(skip).limit(limit).all()

def add_student_to_class(db: Session, class_id: int, student_id: int) -> ClassStudent:
    # Check if class exists
    db_class = get_class(db, class_id=class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if student is already in class
    existing_enrollment = db.query(ClassStudent).filter(
        ClassStudent.class_id == class_id,
        ClassStudent.student_id == student_id
    ).first()
    
    if existing_enrollment:
        if existing_enrollment.status == "dropped":
            # Update status if previously dropped
            existing_enrollment.status = "enrolled"
            db.commit()
            db.refresh(existing_enrollment)
            
            # Update class student count
            db_class.current_students += 1
            db.commit()
            
            return existing_enrollment
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student already enrolled in this class"
            )
    
    # Check if class is full
    if db_class.max_students and db_class.current_students >= db_class.max_students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Class is full"
        )
    
    # Add student to class
    db_class_student = ClassStudent(
        class_id=class_id,
        student_id=student_id,
        status="enrolled"
    )
    
    db.add(db_class_student)
    
    # Update class student count
    db_class.current_students += 1
    
    db.commit()
    db.refresh(db_class_student)
    return db_class_student

def remove_student_from_class(db: Session, class_id: int, student_id: int) -> ClassStudent:
    # Check if enrollment exists
    enrollment = db.query(ClassStudent).filter(
        ClassStudent.class_id == class_id,
        ClassStudent.student_id == student_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not enrolled in this class"
        )
    
    if enrollment.status == "dropped":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already dropped from this class"
        )
    
    # Update enrollment status
    enrollment.status = "dropped"
    
    # Update class student count
    db_class = get_class(db, class_id=class_id)
    if db_class and db_class.current_students > 0:
        db_class.current_students -= 1
    
    db.commit()
    db.refresh(enrollment)
    return enrollment

def get_available_students(db: Session, class_id: int, skip: int = 0, limit: int = 100) -> List[Dict]:
    """
    Get list of students not currently enrolled in the class
    """
    from app.models.models import Student
    
    # Get the class
    db_class = get_class(db, class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Get all student IDs currently in the class (including dropped)
    enrolled_student_ids = db.query(ClassStudent.student_id).filter(
        ClassStudent.class_id == class_id,
        ClassStudent.status != 'dropped'
    ).all()
    enrolled_student_ids = [id[0] for id in enrolled_student_ids]
    
    # Query students not in the class
    query = db.query(Student).filter(
        ~Student.student_id.in_(enrolled_student_ids)
    )
    
    return query.offset(skip).limit(limit).all()

def add_students_bulk(db: Session, class_id: int, student_ids: List[int]) -> List[ClassStudent]:
    """
    Add multiple students to a class at once
    """
    # Check if class exists
    db_class = get_class(db, class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if adding these students would exceed max_students
    if db_class.max_students:
        if db_class.current_students + len(student_ids) > db_class.max_students:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Adding these students would exceed the class maximum of {db_class.max_students} students"
            )
    
    # Get existing enrollments
    existing_enrollments = db.query(ClassStudent).filter(
        ClassStudent.class_id == class_id,
        ClassStudent.student_id.in_(student_ids)
    ).all()
    
    # Check for active enrollments
    active_students = [e.student_id for e in existing_enrollments if e.status == "enrolled"]
    if active_students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Students with IDs {active_students} are already enrolled in this class"
        )
    
    # Create new enrollments
    enrollments = []
    for student_id in student_ids:
        # Skip if student is already enrolled
        if student_id in [e.student_id for e in existing_enrollments]:
            continue
            
        enrollment = ClassStudent(
            class_id=class_id,
            student_id=student_id,
            status="enrolled"
        )
        db.add(enrollment)
        enrollments.append(enrollment)
    
    # Update class student count
    db_class.current_students += len(enrollments)
    
    db.commit()
    
    # Refresh all new enrollments
    for enrollment in enrollments:
        db.refresh(enrollment)
    
    return enrollments
