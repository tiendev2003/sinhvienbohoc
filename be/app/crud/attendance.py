from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from fastapi import HTTPException, status

from app.models.models import Student
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate

def get_attendance(db: Session, attendance_id: int) -> Optional[Attendance]:
    return db.query(Attendance).filter(Attendance.attendance_id == attendance_id).first()

def get_attendance_records(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    student_id: Optional[int] = None,
    class_id: Optional[int] = None,
    date: Optional[date] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[str] = None
) -> List[Attendance]:
    query = db.query(Attendance)
    
    # Only apply filters if they have valid values
    if student_id is not None and student_id != "":
        query = query.filter(Attendance.student_id == student_id)
    
    if class_id is not None and class_id != "":
        query = query.filter(Attendance.class_id == class_id)
    
    # Specific date filter has priority over date range
    if date and date != "":
        query = query.filter(Attendance.date == date)
    else:
        if start_date and start_date != "":
            query = query.filter(Attendance.date >= start_date)
            
        if end_date and end_date != "":
            query = query.filter(Attendance.date <= end_date)
        
    if status and status != "":
        query = query.filter(Attendance.status == status)
        
    return query.order_by(Attendance.date.desc(), Attendance.student_id).offset(skip).limit(limit).all()

def create_attendance(db: Session, attendance: AttendanceCreate) -> Attendance:
    # Check if attendance record already exists for this student-class-date combination
    existing = (db.query(Attendance)
                .filter(Attendance.student_id == attendance.student_id)
                .filter(Attendance.class_id == attendance.class_id)
                .filter(Attendance.date == attendance.date)
                .first())
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance record already exists for this student, class, and date"
        )
    
    # Create attendance record
    db_attendance = Attendance(**attendance.dict())
    
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    # Update student attendance rate if status is 'absent' or 'present'
    if attendance.status in ['present', 'absent']:
        update_student_attendance_rate(db, attendance.student_id)
    
    return db_attendance

def update_attendance(db: Session, attendance_id: int, attendance: AttendanceUpdate) -> Attendance:
    db_attendance = get_attendance(db, attendance_id=attendance_id)
    if not db_attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    update_data = attendance.dict(exclude_unset=True)
    
    old_status = db_attendance.status
    
    # Update attendance attributes
    for key, value in update_data.items():
        setattr(db_attendance, key, value)
    
    db.commit()
    db.refresh(db_attendance)
    
    # If status changed between present and absent, update student attendance rate
    if (old_status in ['present', 'absent'] or 
        db_attendance.status in ['present', 'absent']):
        update_student_attendance_rate(db, db_attendance.student_id)
    
    return db_attendance

def delete_attendance(db: Session, attendance_id: int) -> Attendance:
    db_attendance = get_attendance(db, attendance_id=attendance_id)
    if not db_attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    student_id = db_attendance.student_id
    status = db_attendance.status
    
    db.delete(db_attendance)
    db.commit()
    
    # If deleted record was present or absent, update attendance rate
    if status in ['present', 'absent']:
        update_student_attendance_rate(db, student_id)
    
    return db_attendance

def update_student_attendance_rate(db: Session, student_id: int) -> None:
    """
    Update the attendance rate for a student based on their attendance records.
    Formula: (present / (present + absent)) * 100
    """
    present_count = db.query(func.count(Attendance.attendance_id)).filter(
        Attendance.student_id == student_id,
        Attendance.status == 'present'
    ).scalar() or 0
    
    absent_count = db.query(func.count(Attendance.attendance_id)).filter(
        Attendance.student_id == student_id,
        Attendance.status == 'absent'
    ).scalar() or 0
    
    total_count = present_count + absent_count
    
    # Calculate attendance rate (default to 100% if no records)
    attendance_rate = 100.0
    if total_count > 0:
        attendance_rate = (present_count / total_count) * 100.0
    
    # Update student record
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if student:
        student.attendance_rate = attendance_rate
        db.commit()

def get_student_attendance_summary(db: Session, student_id: int) -> Dict[str, Any]:
    """
    Get a summary of attendance for a specific student
    """
    # Count total classes
    total_classes = db.query(func.count(Attendance.attendance_id)).filter(
        Attendance.student_id == student_id
    ).scalar() or 0
    
    # Count by status
    present_count = db.query(func.count(Attendance.attendance_id)).filter(
        Attendance.student_id == student_id,
        Attendance.status == 'present'
    ).scalar() or 0
    
    absent_count = db.query(func.count(Attendance.attendance_id)).filter(
        Attendance.student_id == student_id,
        Attendance.status == 'absent'
    ).scalar() or 0
    
    late_count = db.query(func.count(Attendance.attendance_id)).filter(
        Attendance.student_id == student_id,
        Attendance.status == 'late'
    ).scalar() or 0
    
    excused_count = db.query(func.count(Attendance.attendance_id)).filter(
        Attendance.student_id == student_id,
        Attendance.status == 'excused'
    ).scalar() or 0
    
    # Calculate attendance rate
    attendance_rate = 100.0
    total_for_rate = present_count + absent_count
    if total_for_rate > 0:
        attendance_rate = (present_count / total_for_rate) * 100.0
    
    return {
        "student_id": student_id,
        "total_classes": total_classes,
        "present_count": present_count,
        "absent_count": absent_count,
        "late_count": late_count,
        "excused_count": excused_count,
        "attendance_rate": attendance_rate
    }

def bulk_create_attendance(db: Session, class_id: int, date: date, records: List[Dict[str, Any]]) -> List[Attendance]:
    """
    Create multiple attendance records for a class on a specific date
    """
    attendance_records = []
    
    for record in records:
        student_id = record.get("student_id")
        status = record.get("status", "present")
        minutes_late = record.get("minutes_late", 0)
        notes = record.get("notes")
        
        # Check if record already exists
        existing = (db.query(Attendance)
                    .filter(Attendance.student_id == student_id)
                    .filter(Attendance.class_id == class_id)
                    .filter(Attendance.date == date)
                    .first())
        
        if existing:
            # Update existing record
            for key, value in record.items():
                if key != "student_id":
                    setattr(existing, key, value)
            
            attendance_records.append(existing)
        else:
            # Create new record
            db_attendance = Attendance(
                student_id=student_id,
                class_id=class_id,
                date=date,
                status=status,
                minutes_late=minutes_late,
                notes=notes
            )
            
            db.add(db_attendance)
            attendance_records.append(db_attendance)
    
    db.commit()
    
    # Update attendance rates for all affected students
    student_ids = set(record.get("student_id") for record in records)
    for student_id in student_ids:
        update_student_attendance_rate(db, student_id)
    
    # Refresh all records to get their IDs
    for record in attendance_records:
        db.refresh(record)
    
    return attendance_records
