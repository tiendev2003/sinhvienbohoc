from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import date

from app.models.models import DisciplinaryRecord, Student
from app.schemas.schemas import DisciplinaryRecordCreate, DisciplinaryRecordUpdate

def get_disciplinary_record(db: Session, record_id: int) -> Optional[DisciplinaryRecord]:
    return db.query(DisciplinaryRecord).filter(DisciplinaryRecord.record_id == record_id).first()

def get_disciplinary_records(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    student_id: Optional[int] = None,
    severity_level: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None
) -> List[DisciplinaryRecord]:
    query = db.query(DisciplinaryRecord)
    
    if student_id is not None:
        query = query.filter(DisciplinaryRecord.student_id == student_id)
    
    if severity_level:
        query = query.filter(DisciplinaryRecord.severity_level == severity_level)
        
    if from_date:
        query = query.filter(DisciplinaryRecord.violation_date >= from_date)
        
    if to_date:
        query = query.filter(DisciplinaryRecord.violation_date <= to_date)
        
    return query.order_by(DisciplinaryRecord.violation_date.desc()).offset(skip).limit(limit).all()

def create_disciplinary_record(db: Session, record: DisciplinaryRecordCreate) -> DisciplinaryRecord:
    # Validate that student exists
    student = db.query(Student).filter(Student.student_id == record.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Create disciplinary record
    db_record = DisciplinaryRecord(**record.dict())
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    # Increment previous_academic_warning count for severe violations
    if record.severity_level == "severe":
        student.previous_academic_warning += 1
        
        # Update academic_status based on warning count
        if student.previous_academic_warning >= 3:
            student.academic_status = "probation"
        elif student.previous_academic_warning >= 2:
            student.academic_status = "warning"
            
        db.commit()
    
    return db_record

def update_disciplinary_record(db: Session, record_id: int, record: DisciplinaryRecordUpdate) -> DisciplinaryRecord:
    db_record = get_disciplinary_record(db, record_id=record_id)
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplinary record not found"
        )
    
    update_data = record.dict(exclude_unset=True)
    
    # Check if the severity_level is being updated
    old_severity = db_record.severity_level
    new_severity = update_data.get("severity_level")
    
    # Update record attributes
    for key, value in update_data.items():
        setattr(db_record, key, value)
    
    db.commit()
    db.refresh(db_record)
    
    # Handle student warning count updates if severity changed
    if new_severity and old_severity != new_severity:
        student = db.query(Student).filter(Student.student_id == db_record.student_id).first()
        if student:
            # Decrement if it was severe and is no longer severe
            if old_severity == "severe" and new_severity != "severe":
                student.previous_academic_warning = max(0, student.previous_academic_warning - 1)
                
                # Update academic_status based on warning count
                if student.previous_academic_warning == 0:
                    student.academic_status = "good"
                elif student.previous_academic_warning == 1:
                    student.academic_status = "good"
                elif student.previous_academic_warning == 2:
                    student.academic_status = "warning"
                
            # Increment if it wasn't severe and is now severe
            elif old_severity != "severe" and new_severity == "severe":
                student.previous_academic_warning += 1
                
                # Update academic_status based on warning count
                if student.previous_academic_warning >= 3:
                    student.academic_status = "probation"
                elif student.previous_academic_warning >= 2:
                    student.academic_status = "warning"
            
            db.commit()
    
    return db_record

def delete_disciplinary_record(db: Session, record_id: int) -> DisciplinaryRecord:
    db_record = get_disciplinary_record(db, record_id=record_id)
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplinary record not found"
        )
    
    # Adjust student warning count if this is a severe record
    if db_record.severity_level == "severe":
        student = db.query(Student).filter(Student.student_id == db_record.student_id).first()
        if student and student.previous_academic_warning > 0:
            student.previous_academic_warning -= 1
            
            # Update academic_status based on warning count
            if student.previous_academic_warning == 0:
                student.academic_status = "good"
            elif student.previous_academic_warning == 1:
                student.academic_status = "good"
            elif student.previous_academic_warning == 2:
                student.academic_status = "warning"
                
            db.commit()
    
    db.delete(db_record)
    db.commit()
    return db_record
