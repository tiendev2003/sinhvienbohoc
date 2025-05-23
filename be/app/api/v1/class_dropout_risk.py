from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import json

from app.db.database import get_db
from app.models.models import User, Class, Student, DropoutRisk, ClassStudent
from app.schemas.schemas import ClassResponse
from app.services.auth import get_current_active_user, check_teacher_role
from app.services.dropout_risk_ml_service_fixed import MLDropoutRiskPredictionService

router = APIRouter()

@router.get("/{class_id}/dropout-risks/analytics", response_model=Dict[str, Any])
async def get_class_dropout_risk_analytics(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get analytics for dropout risks in a specific class using ML model prediction
    """
    # Check if class exists
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
    
    # Initialize the ML service for more accurate risk prediction
    ml_service = MLDropoutRiskPredictionService(db)
    
    # Get risk assessment for each student using ML prediction
    student_risks = []
    high_risk_students = []
    
    low_risk_count = 0
    medium_risk_count = 0
    high_risk_count = 0
    total_risk_percentage = 0
    
    # Factor mapping for displaying risk factors in UI
    factor_mapping = {
        "low_gpa": "Điểm số thấp",
        "poor_attendance": "Điểm danh kém",
        "disciplinary_issues": "Vấn đề kỷ luật",
        "financial_issues": "Khó khăn kinh tế",
        "failed_subjects": "Môn học F",
        "academic_warning": "Cảnh báo học tập",
        "dropped_classes": "Lịch sử bỏ lớp",
        "declining_performance": "Hiệu suất giảm sút",
        "attendance_trend": "Xu hướng điểm danh giảm"
    }
    
    for student in students_in_class:
        # Use ML model to predict risk for this student
        prediction_result = ml_service.predict_dropout_risk(student.student_id)
        
        if prediction_result:
            risk_percentage = prediction_result["risk_percentage"]
            total_risk_percentage += risk_percentage
            
            # Get risk factors from ML prediction
            risk_factors = prediction_result["risk_factors"]
            
            # Categorize risk levels
            if risk_percentage >= 75:
                high_risk_count += 1
                
                main_factors = []
                
                # Extract main risk factors from the ML prediction
                for factor, is_active in risk_factors.items():
                    if isinstance(is_active, bool) and is_active and factor in factor_mapping:
                        main_factors.append(factor_mapping[factor])
                
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
