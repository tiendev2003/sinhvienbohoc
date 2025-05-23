from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.models import (
    User, Student, Class, Teacher, 
    Attendance, Grade, DisciplinaryRecord,
    ClassStudent, ClassSubject, Subject
)
from app.services.auth import get_current_active_user, check_admin_role, check_teacher_role

router = APIRouter()

@router.get("/stats", response_model=Dict[str, Any])
async def get_dashboard_stats(
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get dashboard statistics based on user role
    """
    if role == "admin":
        # Admin stats
        total_students = db.query(Student).count()
        total_classes = db.query(Class).count()
        
        # Calculate average attendance rate
        attendance_rate = db.query(func.avg(Attendance.is_present)).scalar() or 0
        attendance_rate = round(float(attendance_rate) * 100, 1)
        
        # Get count of high risk students
        high_risk_count = db.query(Student).filter(Student.dropout_risk >= 0.7).count()
        
        return {
            "totalStudents": total_students,
            "totalClasses": total_classes,
            "attendanceRate": attendance_rate,
            "dropoutRiskCount": high_risk_count
        }
        
    elif role == "teacher":
        # Get teacher's records
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        teacher_classes = db.query(Class).filter(Class.teacher_id == teacher.id).count()
        
        # Calculate attendance rate for teacher's classes
        attendance_rate = (
            db.query(func.avg(Attendance.is_present))
            .join(ClassStudent)
            .join(Class)
            .filter(Class.teacher_id == teacher.id)
            .scalar()
        ) or 0
        attendance_rate = round(float(attendance_rate) * 100, 1)
        
        # Count students needing attention (low grades or attendance)
        need_attention = (
            db.query(Student)
            .join(ClassStudent)
            .join(Class)
            .filter(Class.teacher_id == teacher.id)
            .filter(
                (Student.attendance_rate < 0.8) | 
                (Student.gpa < 2.0)
            )
            .count()
        )
        
        return {
            "teacherClasses": teacher_classes,
            "attendanceRate": attendance_rate,
            "needAttentionCount": need_attention
        }
        
    elif role == "student":
        # Get student's records
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Get attendance rate
        attendance_rate = (
            db.query(func.avg(Attendance.is_present))
            .filter(Attendance.student_id == student.id)
            .scalar()
        ) or 0
        attendance_rate = round(float(attendance_rate) * 100, 1)
        
        # Get GPA
        gpa = student.gpa if student.gpa else None
        
        # Get disciplinary count
        disciplinary_count = (
            db.query(DisciplinaryRecord)
            .filter(DisciplinaryRecord.student_id == student.id)
            .count()
        )
        
        # Get current class info
        current_class = (
            db.query(Class)
            .join(ClassStudent)
            .filter(ClassStudent.student_id == student.id)
            .first()
        )
        
        class_name = current_class.name if current_class else None
        teacher_name = (
            current_class.teacher.user.full_name 
            if current_class and current_class.teacher and current_class.teacher.user 
            else None
        )
        
        # Get current subjects
        current_subjects = []
        if current_class:
            subjects = (
                db.query(Subject, ClassSubject)
                .join(ClassSubject)
                .filter(ClassSubject.class_id == current_class.id)
                .all()
            )
            
            for subject, class_subject in subjects:
                # Get the teacher for this subject
                teacher = (
                    db.query(Teacher)
                    .filter(Teacher.id == class_subject.teacher_id)
                    .first()
                )
                
                # Get student's grade for this subject
                grade = (
                    db.query(Grade)
                    .filter(
                        Grade.student_id == student.id,
                        Grade.subject_id == subject.id
                    )
                    .first()
                )
                
                current_subjects.append({
                    "name": subject.name,
                    "teacher": teacher.user.full_name if teacher and teacher.user else "N/A",
                    "grade": grade.value if grade else None
                })
        
        return {
            "gpa": gpa,
            "attendanceRate": attendance_rate,
            "disciplinaryCount": disciplinary_count,
            "className": class_name,
            "teacherName": teacher_name,
            "currentSubjects": current_subjects
        }
    
    else:
        raise HTTPException(status_code=400, detail="Invalid role")
