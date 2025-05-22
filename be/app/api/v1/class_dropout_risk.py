from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.models import User, Class, Student, DropoutRisk
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
    """
    # Check if class exists
    class_obj = db.query(Class).filter(Class.class_id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get all students in the class
    students_in_class = db.query(Student).join(
        Class, Student.class_id == Class.class_id
    ).filter(Class.class_id == class_id).all()
    
    if not students_in_class:
        return {
            "className": class_obj.class_name,
            "classCode": class_obj.class_code,
            "teacherName": f"{class_obj.teacher.last_name} {class_obj.teacher.first_name}" if class_obj.teacher else "N/A",
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
            
            # Categorize risk levels
            if risk_percentage >= 75:
                high_risk_count += 1
                
                # Parse risk factors
                risk_factors = {}
                if latest_risk.risk_factors:
                    if isinstance(latest_risk.risk_factors, str):
                        import json
                        try:
                            risk_factors = json.loads(latest_risk.risk_factors)
                        except json.JSONDecodeError:
                            risk_factors = {}
                    else:
                        risk_factors = latest_risk.risk_factors
                
                # Add to high risk students list
                main_factors = []
                if risk_factors:
                    factor_mapping = {
                        "low_gpa": "Điểm số",
                        "poor_attendance": "Điểm danh",
                        "disciplinary_issues": "Kỷ luật",
                        "financial_issues": "Kinh tế",
                        "failed_subjects": "Môn học F",
                        "academic_warning": "Cảnh báo học tập",
                        "dropped_classes": "Bỏ lớp"
                    }
                    
                    for factor, is_active in risk_factors.items():
                        if is_active and factor in factor_mapping:
                            main_factors.append(factor_mapping[factor])
                
                high_risk_students.append({
                    "id": student.student_id,
                    "name": f"{student.last_name} {student.first_name}",
                    "studentId": student.student_code,
                    "riskScore": int(risk_percentage),
                    "mainFactors": ", ".join(main_factors[:3]) if main_factors else "N/A"
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
        "classCode": class_obj.class_code,
        "teacherName": f"{class_obj.teacher.last_name} {class_obj.teacher.first_name}" if class_obj.teacher else "N/A",
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
