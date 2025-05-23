from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
import json

from app.db.database import get_db
from app.models.models import User, Student
from app.services.auth import get_current_active_user, check_admin_role, check_counselor_role, check_teacher_role
from app.services.dropout_risk_ml_service import MLDropoutRiskPredictionService

router = APIRouter()

@router.post("/train-models", response_model=Dict[str, Any])
async def train_ml_models(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Huấn luyện lại mô hình Random Forest và Logistic Regression
    Chỉ admin mới có quyền thực hiện
    """
    try:
        ml_service = MLDropoutRiskPredictionService(db)
        results = ml_service.train_models()
        
        return {
            "message": "Huấn luyện mô hình thành công",
            "results": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi huấn luyện mô hình: {str(e)}"
        )

@router.get("/model-performance", response_model=Dict[str, Any])
async def get_model_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin hiệu suất của các mô hình ML
    """
    try:
        ml_service = MLDropoutRiskPredictionService(db)
        performance = ml_service.get_model_performance()
        
        return performance
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy thông tin hiệu suất mô hình: {str(e)}"
        )

@router.post("/predict/{student_id}", response_model=Dict[str, Any])
async def predict_student_dropout_risk_ml(
    student_id: int,
    use_ensemble: bool = Query(True, description="Sử dụng ensemble của cả hai mô hình"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dự đoán nguy cơ bỏ học cho sinh viên sử dụng ML
    """
    # Kiểm tra sinh viên tồn tại
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")
    
    try:
        ml_service = MLDropoutRiskPredictionService(db)
        result = ml_service.predict_dropout_risk(student_id, use_ensemble=use_ensemble)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Không thể thực hiện dự đoán cho sinh viên này"
            )
        
        # Đảm bảo risk_factors là dictionary
        if "risk_factors" in result and isinstance(result["risk_factors"], str):
            try:
                result["risk_factors"] = json.loads(result["risk_factors"])
            except (json.JSONDecodeError, TypeError):
                result["risk_factors"] = {}
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi dự đoán: {str(e)}"
        )

@router.post("/predict-all", response_model=List[Dict[str, Any]])
async def predict_all_students_ml(
    use_ensemble: bool = Query(True, description="Sử dụng ensemble của cả hai mô hình"),
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Dự đoán nguy cơ bỏ học cho tất cả sinh viên sử dụng ML
    Chỉ admin mới có quyền thực hiện
    """
    try:
        ml_service = MLDropoutRiskPredictionService(db)
        results = ml_service.predict_all_students()
        
        # Đảm bảo risk_factors là dictionary cho mỗi kết quả
        for result in results:
            if "risk_factors" in result and isinstance(result["risk_factors"], str):
                try:
                    result["risk_factors"] = json.loads(result["risk_factors"])
                except (json.JSONDecodeError, TypeError):
                    result["risk_factors"] = {}
        
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi dự đoán tất cả sinh viên: {str(e)}"
        )

@router.get("/feature-importance", response_model=Dict[str, Any])
async def get_feature_importance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin tầm quan trọng của các đặc trưng
    """
    try:
        ml_service = MLDropoutRiskPredictionService(db)
        
        # Tải mô hình nếu chưa có
        if ml_service.rf_model is None:
            if not ml_service._load_models():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Mô hình chưa được huấn luyện. Vui lòng huấn luyện mô hình trước."
                )
        
        # Lấy feature importance từ Random Forest
        feature_importance = dict(zip(ml_service.feature_names, ml_service.rf_model.feature_importances_))
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        
        # Lấy coefficients từ Logistic Regression
        lr_coefficients = dict(zip(ml_service.feature_names, ml_service.lr_model.coef_[0]))
        
        # Diễn giải các đặc trưng quan trọng
        feature_descriptions = {
            'attendance_rate': 'Tỷ lệ điểm danh',
            'avg_gpa': 'Điểm trung bình tích lũy',
            'failed_subjects': 'Số môn học không đạt',
            'total_subjects': 'Tổng số môn học',
            'minor_violations': 'Vi phạm kỷ luật nhẹ',
            'moderate_violations': 'Vi phạm kỷ luật trung bình',
            'severe_violations': 'Vi phạm kỷ luật nghiêm trọng',
            'academic_status': 'Tình trạng học tập',
            'family_income_level': 'Mức thu nhập gia đình',
            'scholarship_status': 'Tình trạng học bổng',
            'previous_academic_warning': 'Cảnh báo học tập trước đây',
            'dropped_classes': 'Số lớp đã bỏ',
            'semester_count': 'Số học kỳ đã học',
            'grade_trend': 'Xu hướng điểm số',
            'attendance_trend': 'Xu hướng điểm danh'
        }
        
        return {
            "random_forest_importance": [
                {
                    "feature": feature,
                    "importance": importance,
                    "description": feature_descriptions.get(feature, feature)
                }
                for feature, importance in sorted_features
            ],
            "logistic_regression_coefficients": [
                {
                    "feature": feature,
                    "coefficient": lr_coefficients[feature],
                    "description": feature_descriptions.get(feature, feature),
                    "interpretation": "Tăng nguy cơ" if lr_coefficients[feature] > 0 else "Giảm nguy cơ"
                }
                for feature in ml_service.feature_names
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy thông tin feature importance: {str(e)}"
        )

@router.get("/compare-models/{student_id}", response_model=Dict[str, Any])
async def compare_models_prediction(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    So sánh kết quả dự đoán giữa Random Forest và Logistic Regression
    """
    # Kiểm tra sinh viên tồn tại
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")
    
    try:
        ml_service = MLDropoutRiskPredictionService(db)
        
        # Dự đoán với cả hai mô hình
        result_ensemble = ml_service.predict_dropout_risk(student_id, use_ensemble=True)
        result_rf = ml_service.predict_dropout_risk(student_id, use_ensemble=False)
        
        if not result_ensemble or not result_rf:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Không thể thực hiện dự đoán cho sinh viên này"
            )
        
        # Trích xuất đặc trưng để phân tích
        features = ml_service._extract_student_features(student_id)
        
        return {
            "student_id": student_id,
            "student_code": student.student_code,
            "predictions": result_ensemble["prediction_details"],
            "risk_factors": result_ensemble["risk_factors"],
            "feature_analysis": result_ensemble["feature_analysis"],
            "recommendation": {
                "primary_concerns": [
                    factor for factor, is_risk in result_ensemble["risk_factors"].items() 
                    if is_risk
                ],
                "suggested_actions": ml_service._get_recommendations(result_ensemble["risk_factors"])
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi so sánh mô hình: {str(e)}"
        )

# Thêm method _get_recommendations vào MLDropoutRiskPredictionService
def get_recommendations(risk_factors: Dict[str, bool]) -> List[str]:
    """
    Đề xuất hành động dựa trên các yếu tố rủi ro
    """
    recommendations = []
    
    if risk_factors.get("poor_attendance"):
        recommendations.append("Liên hệ với sinh viên về vấn đề điểm danh và tìm hiểu nguyên nhân")
    
    if risk_factors.get("low_gpa"):
        recommendations.append("Hỗ trợ học tập bổ sung, tư vấn phương pháp học")
    
    if risk_factors.get("failed_subjects"):
        recommendations.append("Đăng ký học lại hoặc học cải thiện cho các môn không đạt")
    
    if risk_factors.get("disciplinary_issues"):
        recommendations.append("Tư vấn hành vi và hỗ trợ tâm lý")
    
    if risk_factors.get("financial_issues"):
        recommendations.append("Hỗ trợ tài chính, tìm kiếm học bổng hoặc việc làm thêm")
    
    if risk_factors.get("declining_performance"):
        recommendations.append("Theo dõi sát sao và can thiệp sớm để ngăn chặn xu hướng giảm")
    
    if not recommendations:
        recommendations.append("Tiếp tục theo dõi và duy trì hiệu suất học tập tốt")
    
    return recommendations
