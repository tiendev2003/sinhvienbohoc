from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import json

from app.db.database import get_db
from app.models.models import User, Class, Student, DropoutRisk, ClassStudent
from app.schemas.schemas import ClassResponse
from app.services.auth import get_current_active_user, check_teacher_role

router = APIRouter()

@router.get("/{class_id}/dropout-risks/analytics", response_model=Dict[str, Any])
async def get_class_dropout_risk_analytics(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get analytics for dropout risks in a specific class
    """    # Check if class exists
    class_obj = db.query(Class).filter(Class.class_id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get all students in the class through ClassStudent junction table
    students_in_class = db.query(Student).join(
        ClassStudent, Student.student_id == ClassStudent.student_id
    ).filter(
        ClassStudent.class_id == class_id,
        ClassStudent.status == "enrolled"
    ).all()    
    if not students_in_class:
        return {
            "className": class_obj.class_name,
            "classId": class_obj.class_id,
            "teacherName": f"{class_obj.teacher.user.full_name}" if class_obj.teacher and class_obj.teacher.user else "N/A",
            "summary": {
                "totalStudents": 0,
                "lowRisk": 0,
                "mediumRisk": 0,
                "highRisk": 0,
                "avgRiskPercentage": 0
            },
            "riskDistribution": {
                "labels": ["Rủi ro thấp", "Rủi ro trung bình", "Rủi ro cao"],
                "datasets": [{
                    "data": [0, 0, 0],
                    "backgroundColor": ["#10b981", "#f59e0b", "#ef4444"],
                    "borderColor": ["#10b981", "#f59e0b", "#ef4444"]
                }]
            },
            "highRiskStudents": []
        }
    
    student_ids = [s.student_id for s in students_in_class]
    
    # Get latest risk assessment for each student
    student_risks = []
    high_risk_students = []
    
    low_risk_count = 0
    medium_risk_count = 0
    high_risk_count = 0
    total_risk_percentage = 0
    
    for student in students_in_class:
        # Get latest risk assessment
        latest_risk = db.query(DropoutRisk).filter(
            DropoutRisk.student_id == student.student_id
        ).order_by(DropoutRisk.analysis_date.desc()).first()
        
        if latest_risk:
            risk_percentage = latest_risk.risk_percentage
            total_risk_percentage += risk_percentage
            
            # Parse risk factors early
            risk_factors = latest_risk.risk_factors or {}
            if isinstance(risk_factors, str):
                try:
                    risk_factors = json.loads(risk_factors)
                except json.JSONDecodeError:
                    risk_factors = {}
            
            # Categorize risk levels
            if risk_percentage >= 75:
                high_risk_count += 1
                
                # Factor mapping
                factor_mapping = {
                    "low_gpa": "Điểm số thấp",
                    "poor_attendance": "Điểm danh kém",
                    "disciplinary_issues": "Vấn đề kỷ luật",
                    "financial_issues": "Khó khăn kinh tế",
                    "failed_subjects": "Môn học F",
                    "academic_warning": "Cảnh báo học tập",
                    "dropped_classes": "Lịch sử bỏ lớp",
                    "academic_performance": "Điểm số thấp",
                    "attendance": "Điểm danh kém",
                    "disciplinary_records": "Vấn đề kỷ luật",
                    "family_income": "Khó khăn kinh tế",
                    "previous_warnings": "Cảnh báo học tập trước"
                }
                
                main_factors = []
                
                # Handle boolean format
                for factor, is_active in risk_factors.items():
                    if isinstance(is_active, bool) and is_active and factor in factor_mapping:
                        main_factors.append(factor_mapping[factor])
                
                # Handle numeric/value format
                if not main_factors:  # Only check these if no boolean factors were found
                    if risk_factors.get('academic_performance', 0) < 6:
                        main_factors.append(factor_mapping['academic_performance'])
                    if risk_factors.get('attendance', 100) < 80:
                        main_factors.append(factor_mapping['attendance'])
                    if risk_factors.get('disciplinary_records', 0) > 0:
                        main_factors.append(factor_mapping['disciplinary_records'])
                    if risk_factors.get('family_income') == 'low':
                        main_factors.append(factor_mapping['family_income'])
                    if risk_factors.get('previous_warnings', 0) > 0:
                        main_factors.append(factor_mapping['previous_warnings'])
                
                # Default factor based on risk percentage if no other factors
                if not main_factors:
                    if risk_percentage >= 75:
                        main_factors.append("Nguy cơ chung")
                    else:
                        main_factors.append("Theo dõi")
                
                high_risk_students.append({
                    "id": student.student_id,
                    "name": student.user.full_name if student.user else "N/A",
                    "studentId": student.student_code,
                    "riskScore": int(risk_percentage),
                    "mainFactors": ", ".join(main_factors[:3])
                })
            elif risk_percentage >= 50:
                medium_risk_count += 1
            else:
                low_risk_count += 1
            
            student_risks.append({
                "student_id": student.student_id,
                "risk_percentage": risk_percentage
            })
    
    # Calculate average risk
    avg_risk = total_risk_percentage / len(students_in_class) if students_in_class else 0
      # Prepare response data
    response_data = {
        "className": class_obj.class_name,
        "classId": class_obj.class_id,
        "teacherName": f"{class_obj.teacher.user.full_name}" if class_obj.teacher and class_obj.teacher.user else "N/A",
        "summary": {
            "totalStudents": len(students_in_class),
            "lowRisk": low_risk_count,
            "mediumRisk": medium_risk_count,
            "highRisk": high_risk_count,
            "avgRiskPercentage": round(avg_risk, 1)
        },
        "riskDistribution": {
            "labels": ["Rủi ro thấp", "Rủi ro trung bình", "Rủi ro cao"],
            "datasets": [{
                "data": [low_risk_count, medium_risk_count, high_risk_count],
                "backgroundColor": ["#10b981", "#f59e0b", "#ef4444"],
                "borderColor": ["#10b981", "#f59e0b", "#ef4444"]
            }]
        },
        "highRiskStudents": sorted(high_risk_students, key=lambda x: x["riskScore"], reverse=True)
    }
    
    return response_data
