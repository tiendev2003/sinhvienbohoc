from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
from datetime import datetime

from app.db.database import get_db
from app.models.models import User, Class, Student, DropoutRisk, ClassStudent
from app.schemas.schemas import ClassResponse
from app.services.auth import get_current_active_user, check_teacher_role
from app.services.dropout_risk_ml_service_fixed import MLDropoutRiskPredictionService

router = APIRouter()

@router.get("/{class_id}/dropout-risks-ml/analytics", response_model=Dict[str, Any])
async def get_class_dropout_risk_ml_analytics(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get analytics for dropout risks in a specific class using ML model prediction with detailed ML insights
    """
    # Kiểm tra lớp học có tồn tại không
    class_obj = db.query(Class).filter(Class.class_id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Lấy danh sách sinh viên trong lớp qua bảng nối ClassStudent
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
            "mlModelInfo": {
                "modelType": "Hybrid ML",
                "algorithms": ["Random Forest", "Logistic Regression"],
                "lastTraining": None
            },
            "riskDistribution": {
                "labels": ["Rủi ro thấp", "Rủi ro trung bình", "Rủi ro cao"],
                "datasets": [{
                    "data": [0, 0, 0],
                    "backgroundColor": ["#10b981", "#f59e0b", "#ef4444"],
                    "borderColor": ["#10b981", "#f59e0b", "#ef4444"]
                }]
            },
            "featureImportance": [],
            "highRiskStudents": []
        }
    
    # Khởi tạo service phân tích nguy cơ bỏ học sử dụng ML
    ml_service = MLDropoutRiskPredictionService(db)
    
    # Biến để lưu kết quả phân tích
    student_risks = []
    high_risk_students = []
    feature_importance_sum = {}
    
    low_risk_count = 0
    medium_risk_count = 0
    high_risk_count = 0
    total_risk_percentage = 0
    
    # Phân tích nguy cơ cho từng sinh viên trong lớp bằng mô hình ML
    for student in students_in_class:
        # Sử dụng ML model để dự đoán nguy cơ bỏ học
        prediction_result = ml_service.predict_dropout_risk(student.student_id)
        
        if prediction_result:
            risk_percentage = prediction_result["risk_percentage"]
            total_risk_percentage += risk_percentage
            
            # Lưu trữ feature importance cho các tính năng
            if "feature_analysis" in prediction_result:
                for feature, analysis in prediction_result["feature_analysis"].items():
                    if feature not in feature_importance_sum:
                        feature_importance_sum[feature] = {"importance": 0, "count": 0}
                    feature_importance_sum[feature]["importance"] += analysis.get("importance", 0)
                    feature_importance_sum[feature]["count"] += 1
            
            # Phân loại mức độ rủi ro
            if risk_percentage >= 75:
                high_risk_count += 1
                
                # Lấy các yếu tố chính gây rủi ro
                main_factors = []
                risk_factors = prediction_result["risk_factors"]
                
                # Ánh xạ các yếu tố kỹ thuật thành các yếu tố dễ hiểu
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
                
                # Trích xuất các yếu tố rủi ro chính
                for factor, is_active in risk_factors.items():
                    if isinstance(is_active, bool) and is_active and factor in factor_mapping:
                        main_factors.append(factor_mapping[factor])
                
                # Nếu không có yếu tố rủi ro đáng kể, thêm một yếu tố mặc định
                if not main_factors:
                    if risk_percentage >= 75:
                        main_factors.append("Nguy cơ chung")
                    else:
                        main_factors.append("Theo dõi")
                
                # Tạo dữ liệu cho sinh viên có nguy cơ cao
                high_risk_students.append({
                    "id": student.student_id,
                    "name": student.user.full_name if student.user else "N/A",
                    "studentId": student.student_code,
                    "riskScore": int(risk_percentage),
                    "mainFactors": ", ".join(main_factors[:3]),
                    "modelConfidence": prediction_result["prediction_details"]["ensemble"]["probability"],
                    "detailedAnalysis": {
                        "rf_probability": prediction_result["prediction_details"]["random_forest"]["probability"],
                        "lr_probability": prediction_result["prediction_details"]["logistic_regression"]["probability"],
                        "key_features": [
                            {"name": k, "value": v["value"], "importance": v["importance"], "interpretation": v["interpretation"]}
                            for k, v in (prediction_result.get("feature_analysis", {}).items())
                        ][:5]  # Top 5 đặc trưng quan trọng nhất
                    }
                })
            elif risk_percentage >= 50:
                medium_risk_count += 1
            else:
                low_risk_count += 1
            
            student_risks.append({
                "student_id": student.student_id,
                "risk_percentage": risk_percentage
            })
    
    # Tính điểm trung bình nguy cơ toàn lớp
    avg_risk = total_risk_percentage / len(students_in_class) if students_in_class else 0
    
    # Tính trọng số trung bình cho các đặc trưng
    feature_importance = []
    if feature_importance_sum:
        for feature, data in feature_importance_sum.items():
            if data["count"] > 0:
                avg_importance = data["importance"] / data["count"]
                feature_importance.append({
                    "feature": feature,
                    "importance": avg_importance,
                    "displayName": feature.replace('_', ' ').title()
                })
        
        # Sắp xếp theo độ quan trọng giảm dần và lấy 10 đặc trưng hàng đầu
        feature_importance = sorted(feature_importance, key=lambda x: x["importance"], reverse=True)[:10]
    
    # Lấy thông tin về hiệu suất mô hình
    model_info = ml_service.get_model_performance() if hasattr(ml_service, 'rf_model') and ml_service.rf_model else None
    model_metrics = {}
    
    if model_info and not isinstance(model_info, dict) and "error" not in model_info:
        model_metrics = {
            "accuracyRF": model_info.get("random_forest", {}).get("cross_val_auc_mean", 0),
            "accuracyLR": model_info.get("logistic_regression", {}).get("cross_val_auc_mean", 0),
            "sampleSize": model_info.get("data_info", {}).get("total_samples", 0),
            "lastUpdate": datetime.now().isoformat()
        }
    
    # Chuẩn bị dữ liệu phản hồi
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
        "mlModelInfo": {
            "modelType": "Hybrid ML (Random Forest 60%, Logistic Regression 40%)",
            "algorithms": ["Random Forest", "Logistic Regression"],
            "lastTraining": datetime.now().strftime("%Y-%m-%d"),
            "metrics": model_metrics
        },
        "riskDistribution": {
            "labels": ["Rủi ro thấp", "Rủi ro trung bình", "Rủi ro cao"],
            "datasets": [{
                "data": [low_risk_count, medium_risk_count, high_risk_count],
                "backgroundColor": ["#10b981", "#f59e0b", "#ef4444"],
                "borderColor": ["#10b981", "#f59e0b", "#ef4444"]
            }]
        },
        "featureImportance": feature_importance,
        "highRiskStudents": sorted(high_risk_students, key=lambda x: x["riskScore"], reverse=True),
        "recommendations": [
            {
                "title": "Theo dõi điểm danh chặt chẽ",
                "description": "Điểm danh là một trong những chỉ báo sớm nhất về nguy cơ bỏ học. Cần theo dõi chặt chẽ và liên hệ ngay với sinh viên có tỷ lệ vắng mặt cao.",
                "category": "attendance",
                "priority": "high" if any("Điểm danh kém" in s.get("mainFactors", "") for s in high_risk_students) else "medium"
            },
            {
                "title": "Hỗ trợ học tập",
                "description": "Tổ chức các buổi học bổ sung hoặc kèm cặp cho các sinh viên có điểm thấp, đặc biệt là các sinh viên đã được xác định có nguy cơ bỏ học cao.",
                "category": "academic",
                "priority": "high" if any("Điểm số thấp" in s.get("mainFactors", "") or "Môn học F" in s.get("mainFactors", "") for s in high_risk_students) else "medium"
            },
            {
                "title": "Tư vấn tài chính",
                "description": "Một số sinh viên có nguy cơ bỏ học do khó khăn tài chính. Cần tư vấn về các chương trình học bổng, hỗ trợ tài chính có thể giúp họ tiếp tục việc học.",
                "category": "financial",
                "priority": "medium" if any("Khó khăn kinh tế" in s.get("mainFactors", "") for s in high_risk_students) else "low"
            }
        ]
    }
    
    return response_data
