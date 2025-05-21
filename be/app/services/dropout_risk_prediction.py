from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from app.models.models import Student, Grade, DisciplinaryRecord, ClassStudent
from app.crud.dropout_risk import create_dropout_risk
from app.schemas.schemas import DropoutRiskCreate

class DropoutRiskPredictionService:
    """
    Service phân tích và dự báo nguy cơ bỏ học
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def _get_student_data(self, student_id: int) -> Dict[str, Any]:
        """
        Lấy dữ liệu sinh viên để phân tích
        """
        student = self.db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return None
        
        # Lấy thông tin điểm số
        grades = self.db.query(Grade).filter(Grade.student_id == student_id).all()
        avg_gpa = sum([g.gpa or 0 for g in grades]) / len(grades) if grades else 0
        failed_subjects = sum(1 for g in grades if g.gpa is not None and g.gpa < 5.0)
        
        # Lấy thông tin kỷ luật
        disciplinary_records = self.db.query(DisciplinaryRecord).filter(
            DisciplinaryRecord.student_id == student_id
        ).all()
        
        disciplinary_counts = {
            "minor": sum(1 for r in disciplinary_records if r.severity_level == "minor"),
            "moderate": sum(1 for r in disciplinary_records if r.severity_level == "moderate"),
            "severe": sum(1 for r in disciplinary_records if r.severity_level == "severe"),
        }
        
        # Lấy thông tin tham gia lớp học
        enrollments = self.db.query(ClassStudent).filter(
            ClassStudent.student_id == student_id
        ).all()
        
        dropped_classes = sum(1 for e in enrollments if e.status == "dropped")
        
        # Tổng hợp dữ liệu
        student_data = {
            "student_id": student.student_id,
            "attendance_rate": student.attendance_rate,
            "previous_academic_warning": student.previous_academic_warning,
            "academic_status": 0 if student.academic_status == "good" else (
                1 if student.academic_status == "warning" else (
                    2 if student.academic_status == "probation" else 3
                )
            ),
            "avg_gpa": avg_gpa,
            "failed_subjects": failed_subjects,
            "minor_violations": disciplinary_counts["minor"],
            "moderate_violations": disciplinary_counts["moderate"],
            "severe_violations": disciplinary_counts["severe"],
            "dropped_classes": dropped_classes,
            "family_income_level": 0 if student.family_income_level == "very_low" else (
                1 if student.family_income_level == "low" else (
                    2 if student.family_income_level == "medium" else (
                        3 if student.family_income_level == "high" else 4
                    )
                )
            ),
            "scholarship_status": 0 if student.scholarship_status == "none" else (
                1 if student.scholarship_status == "partial" else 2
            ),
        }
        
        return student_data
    
    def _build_risk_factors(self, student_data: Dict[str, Any]) -> Dict[str, bool]:
        """
        Xác định các yếu tố rủi ro dựa trên dữ liệu sinh viên
        """
        risk_factors = {}
        
        # Yếu tố học tập
        risk_factors["low_gpa"] = student_data["avg_gpa"] < 6.0
        risk_factors["failed_subjects"] = student_data["failed_subjects"] > 0
        risk_factors["academic_warning"] = student_data["previous_academic_warning"] > 0
        risk_factors["poor_attendance"] = student_data["attendance_rate"] < 80.0
        
        # Yếu tố kỷ luật
        risk_factors["disciplinary_issues"] = (
            student_data["minor_violations"] > 2 or
            student_data["moderate_violations"] > 0 or
            student_data["severe_violations"] > 0
        )
        
        # Yếu tố khác
        risk_factors["dropped_classes"] = student_data["dropped_classes"] > 0
        risk_factors["financial_issues"] = student_data["family_income_level"] < 2 and student_data["scholarship_status"] == 0
        
        return risk_factors
    
    def _calculate_risk_percentage(self, student_data: Dict[str, Any], risk_factors: Dict[str, bool]) -> float:
        """
        Tính toán phần trăm nguy cơ bỏ học dựa trên nhiều yếu tố
        """
        # Trọng số cho các yếu tố rủi ro
        weights = {
            "low_gpa": 30,
            "failed_subjects": 25,
            "academic_warning": 20,
            "poor_attendance": 25,
            "disciplinary_issues": 15,
            "dropped_classes": 10,
            "financial_issues": 15
        }
        
        # Tính tổng trọng số của các yếu tố
        total_weight = sum(weights.values())
        
        # Tính toán điểm rủi ro
        risk_score = sum(
            weights[factor] for factor, is_risky in risk_factors.items() if is_risky
        )
        
        # Chuyển đổi thành phần trăm
        risk_percentage = (risk_score / total_weight) * 100
        
        # Điều chỉnh dựa trên tình trạng học tập
        if student_data["academic_status"] == 3:  # suspended
            risk_percentage = max(80, risk_percentage)
        elif student_data["academic_status"] == 2:  # probation
            risk_percentage = max(60, risk_percentage)
        elif student_data["academic_status"] == 1:  # warning
            risk_percentage = max(40, risk_percentage)
        
        return min(risk_percentage, 100.0)
    
    def predict_dropout_risk(self, student_id: int) -> Optional[Dict[str, Any]]:
        """
        Dự báo nguy cơ bỏ học cho một sinh viên
        """
        student_data = self._get_student_data(student_id)
        if not student_data:
            return None
        
        risk_factors = self._build_risk_factors(student_data)
        risk_percentage = self._calculate_risk_percentage(student_data, risk_factors)
        
        # Lưu kết quả dự báo vào database
        dropout_risk_data = DropoutRiskCreate(
            student_id=student_id,
            risk_percentage=risk_percentage,
            risk_factors=risk_factors
        )
        
        dropout_risk = create_dropout_risk(self.db, dropout_risk_data)
        
        return {
            "risk_id": dropout_risk.risk_id,
            "student_id": student_id,
            "risk_percentage": risk_percentage,
            "risk_factors": risk_factors,
            "analysis_date": dropout_risk.analysis_date
        }
    
    def predict_all_students(self) -> List[Dict[str, Any]]:
        """
        Dự báo nguy cơ bỏ học cho tất cả sinh viên
        """
        students = self.db.query(Student).all()
        results = []
        
        for student in students:
            result = self.predict_dropout_risk(student.student_id)
            if result:
                results.append(result)
        
        return results
