from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os
import pickle
from datetime import datetime

from app.db.database import get_db
from app.models.models import User
from app.services.auth import get_current_active_user, check_admin_role, check_teacher_role
from app.services.dropout_risk_prediction import DropoutRiskPredictionService

router = APIRouter()

@router.get("/dropout-risk/metrics", response_model=Dict[str, Any])
async def get_dropout_risk_model_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda: check_teacher_role(current_user=get_current_active_user()))
):
    """
    Lấy metrics hiệu suất của mô hình dự đoán nguy cơ bỏ học
    """
    try:
        # Try to load the latest model
        model_data = None
        model_dir = "models"
        
        if os.path.exists(model_dir):
            model_files = sorted([f for f in os.listdir(model_dir) if f.startswith("dropout_risk_model_")])
            if model_files:
                # Use the most recent model
                latest_model = model_files[-1]
                try:
                    with open(f"{model_dir}/{latest_model}", "rb") as f:
                        model_data = pickle.load(f)
                except Exception as e:
                    print(f"Error loading model: {e}")
        
        if not model_data:
            # Train a new model if no existing model
            prediction_service = DropoutRiskPredictionService(db)
            model_data = prediction_service._train_ml_model()
            
        if not model_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Không thể tải hoặc tạo mô hình machine learning"
            )
        
        # Extract metrics
        accuracy = model_data.get("accuracy", 0.0)
        roc_auc = model_data.get("roc_auc", 0.0)
        
        # Get model info
        model_info = {
            "model_type": type(model_data["model"]).__name__ if "model" in model_data else "Unknown",
            "features_count": len(model_data.get("features", [])),
            "features": model_data.get("features", []),
            "last_trained": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        return {
            "accuracy": round(accuracy, 4),
            "roc_auc": round(roc_auc, 4),
            "accuracy_percentage": round(accuracy * 100, 2),
            "roc_auc_percentage": round(roc_auc * 100, 2),
            "model_info": model_info,
            "performance_level": get_performance_level(accuracy, roc_auc),
            "recommendations": get_model_recommendations(accuracy, roc_auc)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lấy metrics mô hình: {str(e)}"
        )

@router.post("/dropout-risk/retrain", response_model=Dict[str, Any])
async def retrain_dropout_risk_model(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Huấn luyện lại mô hình dự đoán nguy cơ bỏ học (chỉ admin)
    """
    try:
        prediction_service = DropoutRiskPredictionService(db)
        model_data = prediction_service._train_ml_model()
        
        if not model_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Không thể huấn luyện mô hình"
            )
        
        accuracy = model_data.get("accuracy", 0.0)
        roc_auc = model_data.get("roc_auc", 0.0)
        
        return {
            "message": "Mô hình đã được huấn luyện lại thành công",
            "accuracy": round(accuracy, 4),
            "roc_auc": round(roc_auc, 4),
            "accuracy_percentage": round(accuracy * 100, 2),
            "roc_auc_percentage": round(roc_auc * 100, 2),
            "trained_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi huấn luyện lại mô hình: {str(e)}"
        )

def get_performance_level(accuracy: float, roc_auc: float) -> str:
    """
    Đánh giá mức độ hiệu suất của mô hình
    """
    avg_score = (accuracy + roc_auc) / 2
    
    if avg_score >= 0.9:
        return "Xuất sắc"
    elif avg_score >= 0.8:
        return "Tốt"
    elif avg_score >= 0.7:
        return "Khá"
    elif avg_score >= 0.6:
        return "Trung bình"
    else:
        return "Cần cải thiện"

def get_model_recommendations(accuracy: float, roc_auc: float) -> list:
    """
    Đưa ra khuyến nghị cải thiện mô hình
    """
    recommendations = []
    
    if accuracy < 0.7:
        recommendations.append("Cần cải thiện độ chính xác bằng cách thu thập thêm dữ liệu training")
    
    if roc_auc < 0.7:
        recommendations.append("Cần cải thiện khả năng phân biệt bằng cách điều chỉnh features")
    
    if accuracy < 0.8 and roc_auc < 0.8:
        recommendations.append("Cân nhắc sử dụng thuật toán machine learning khác")
        recommendations.append("Thực hiện feature engineering để cải thiện chất lượng dữ liệu")
    
    if not recommendations:
        recommendations.append("Mô hình đang hoạt động tốt, tiếp tục theo dõi performance")
    
    return recommendations
