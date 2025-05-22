from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import json

from app.db.database import get_db
from app.models.models import User, Student
from app.schemas.schemas import DropoutRiskCreate, DropoutRiskUpdate, DropoutRiskResponse
from app.crud.dropout_risk import (
    get_dropout_risk, 
    get_dropout_risks, 
    get_dropout_risks_by_student,
    get_latest_dropout_risk_by_student,
    create_dropout_risk, 
    update_dropout_risk, 
    delete_dropout_risk
)
from app.services.auth import get_current_active_user, check_admin_role, check_counselor_role, check_teacher_role
from app.services.dropout_risk_prediction import DropoutRiskPredictionService

router = APIRouter()

@router.get("/", response_model=List[DropoutRiskResponse])
async def read_dropout_risks(
    skip: int = 0, 
    limit: int = 100, 
    min_risk: Optional[float] = None,
    max_risk: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách đánh giá nguy cơ bỏ học
    Sinh viên chỉ được xem đánh giá của bản thân
    """
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student:
            return []
        risks = get_dropout_risks_by_student(db, student_id=student.student_id)
    else:
        # Nếu là giáo viên, cố vấn hoặc admin, cho phép xem tất cả
        risks = get_dropout_risks(db, skip=skip, limit=limit, min_risk=min_risk, max_risk=max_risk)
    
    # Đảm bảo risk_factors là dictionary
    for risk in risks:
        if risk.risk_factors and isinstance(risk.risk_factors, str):
            try:
                risk.risk_factors = json.loads(risk.risk_factors)
            except (json.JSONDecodeError, TypeError):
                risk.risk_factors = {}
    
    return risks

@router.post("/", response_model=DropoutRiskResponse, status_code=status.HTTP_201_CREATED)
async def create_new_dropout_risk(
    dropout_risk: DropoutRiskCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda: check_teacher_role(current_user=get_current_active_user()))
):
    """
    Tạo đánh giá nguy cơ bỏ học mới, chỉ giáo viên/cố vấn/admin có quyền
    """
    return create_dropout_risk(db=db, dropout_risk=dropout_risk)

@router.get("/{risk_id}", response_model=DropoutRiskResponse)
async def read_dropout_risk(
    risk_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin đánh giá nguy cơ bỏ học theo ID
    Sinh viên chỉ được xem đánh giá của bản thân
    """
    db_risk = get_dropout_risk(db, risk_id=risk_id)
    if db_risk is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
    
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
        if not student or student.student_id != db_risk.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không đủ quyền truy cập thông tin đánh giá của sinh viên khác"
            )
    
    # Đảm bảo risk_factors là dictionary
    if db_risk.risk_factors and isinstance(db_risk.risk_factors, str):
        try:
            db_risk.risk_factors = json.loads(db_risk.risk_factors)
        except (json.JSONDecodeError, TypeError):
            db_risk.risk_factors = {}
    
    return db_risk

@router.put("/{risk_id}", response_model=DropoutRiskResponse)
async def update_dropout_risk_info(
    risk_id: int, 
    dropout_risk: DropoutRiskUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda: check_teacher_role(current_user=get_current_active_user()))
):
    """
    Cập nhật thông tin đánh giá nguy cơ bỏ học, chỉ giáo viên/cố vấn/admin có quyền
    """
    return update_dropout_risk(db=db, risk_id=risk_id, dropout_risk=dropout_risk)

@router.delete("/{risk_id}", response_model=DropoutRiskResponse)
async def delete_dropout_risk_assessment(
    risk_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Xóa đánh giá nguy cơ bỏ học, chỉ admin mới có quyền
    """
    return delete_dropout_risk(db=db, risk_id=risk_id)

@router.post("/predict/{student_id}", response_model=Dict[str, Any])
async def predict_student_dropout_risk(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda: check_teacher_role(current_user=get_current_active_user()))
):
    """
    Dự báo nguy cơ bỏ học cho sinh viên
    """
    # Kiểm tra sinh viên tồn tại
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")
        
    # Thực hiện dự báo
    prediction_service = DropoutRiskPredictionService(db)
    result = prediction_service.predict_dropout_risk(student_id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Không thể thực hiện dự báo cho sinh viên này"
        )
    
    # Đảm bảo risk_factors là dictionary
    if "risk_factors" in result and isinstance(result["risk_factors"], str):
        try:
            result["risk_factors"] = json.loads(result["risk_factors"])
        except (json.JSONDecodeError, TypeError):
            result["risk_factors"] = {}
            
    return result

@router.post("/recalculate/{student_id}", response_model=Dict[str, Any])
async def recalculate_student_dropout_risk(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(lambda: check_teacher_role(current_user=get_current_active_user()))
):
    """
    Tính toán lại nguy cơ bỏ học cho sinh viên
    """
    # Kiểm tra sinh viên tồn tại
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")
        
    # Thực hiện dự báo
    prediction_service = DropoutRiskPredictionService(db)
    result = prediction_service.predict_dropout_risk(student_id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Không thể thực hiện dự báo cho sinh viên này"
        )
    
    # Đảm bảo risk_factors là dictionary
    if "risk_factors" in result and isinstance(result["risk_factors"], str):
        try:
            result["risk_factors"] = json.loads(result["risk_factors"])
        except (json.JSONDecodeError, TypeError):
            result["risk_factors"] = {}
            
    return result

@router.post("/predict-all", response_model=List[Dict[str, Any]])
async def predict_all_students_dropout_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
):
    """
    Dự báo nguy cơ bỏ học cho tất cả sinh viên, chỉ admin mới có quyền
    """
    prediction_service = DropoutRiskPredictionService(db)
    results = prediction_service.predict_all_students()
    
    # Đảm bảo risk_factors là dictionary cho mỗi kết quả
    for result in results:
        if "risk_factors" in result and isinstance(result["risk_factors"], str):
            try:
                result["risk_factors"] = json.loads(result["risk_factors"])
            except (json.JSONDecodeError, TypeError):
                result["risk_factors"] = {}
                
    return results
