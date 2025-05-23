from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score
from app.models.models import Student, Grade, DisciplinaryRecord, ClassStudent
from app.models.attendance import Attendance
from app.crud.dropout_risk import create_dropout_risk
from app.schemas.schemas import DropoutRiskCreate
import json
import pickle
import os
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class MLDropoutRiskPredictionService:
    """
    Service phân tích nguy cơ bỏ học sử dụng Machine Learning
    Sử dụng Random Forest và Logistic Regression
    """
    def __init__(self, db: Session):
        self.db = db
        # Use absolute path for models directory
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "models")
        self.rf_model = None
        self.lr_model = None
        self.scaler = None
        self.feature_names = [
            'attendance_rate', 'avg_gpa', 'failed_subjects', 'total_subjects',
            'minor_violations', 'moderate_violations', 'severe_violations',
            'academic_status', 'family_income_level', 'scholarship_status',
            'previous_academic_warning', 'dropped_classes', 'semester_count',
            'grade_trend', 'attendance_trend'
        ]
        
    def _extract_student_features(self, student_id: int) -> Optional[Dict[str, Any]]:
        """
        Trích xuất đặc trưng từ dữ liệu sinh viên với error handling đầy đủ
        """
        try:
            # Lấy thông tin sinh viên
            student = self.db.query(Student).filter(Student.student_id == student_id).first()
            if not student:
                print(f"Student {student_id} not found")
                return None
            
            # Tính toán điểm danh với error handling
            try:
                attendance_records = self.db.query(Attendance).filter(
                    Attendance.student_id == student_id
                ).all()
                
                total_attendance = len(attendance_records)
                if total_attendance > 0:
                    present_count = sum(1 for a in attendance_records if getattr(a, 'status', None) == "present")
                    attendance_rate = (present_count / total_attendance * 100)
                else:
                    attendance_rate = 100.0
            except Exception as e:
                print(f"Error calculating attendance for student {student_id}: {e}")
                attendance_rate = 100.0
            
            # Tính toán điểm số với error handling
            try:
                grades = self.db.query(Grade).filter(Grade.student_id == student_id).all()
                if grades:
                    # Sử dụng gpa thay vì score
                    valid_gpas = [g.gpa for g in grades if g.gpa is not None]
                    if valid_gpas:
                        avg_gpa = sum(valid_gpas) / len(valid_gpas)
                        failed_subjects = sum(1 for gpa in valid_gpas if gpa < 5.0)
                    else:
                        avg_gpa = 0.0
                        failed_subjects = 0
                    total_subjects = len(grades)
                    
                    # Tính xu hướng điểm (so sánh 3 lần gần nhất)
                    recent_grades = sorted(grades, key=lambda x: x.grade_id, reverse=True)[:3]
                    recent_valid_gpas = [g.gpa for g in recent_grades if g.gpa is not None]
                    if len(recent_valid_gpas) >= 2:
                        grade_trend = (recent_valid_gpas[0] - recent_valid_gpas[-1]) / len(recent_valid_gpas)
                    else:
                        grade_trend = 0.0
                else:
                    avg_gpa = 0.0
                    failed_subjects = 0
                    total_subjects = 0
                    grade_trend = 0.0
            except Exception as e:
                print(f"Error calculating grades for student {student_id}: {e}")
                avg_gpa = 0.0
                failed_subjects = 0
                total_subjects = 0
                grade_trend = 0.0
                
            # Tính toán vi phạm kỷ luật với error handling
            try:
                disciplinary_records = self.db.query(DisciplinaryRecord).filter(
                    DisciplinaryRecord.student_id == student_id
                ).all()
                
                minor_violations = sum(1 for d in disciplinary_records if getattr(d, 'severity_level', None) == "minor")
                moderate_violations = sum(1 for d in disciplinary_records if getattr(d, 'severity_level', None) == "moderate")
                severe_violations = sum(1 for d in disciplinary_records if getattr(d, 'severity_level', None) == "severe")
            except Exception as e:
                print(f"Error calculating disciplinary records for student {student_id}: {e}")
                minor_violations = 0
                moderate_violations = 0
                severe_violations = 0
            
            # Tính toán thông tin lớp học với error handling
            try:
                enrollments = self.db.query(ClassStudent).filter(
                    ClassStudent.student_id == student_id
                ).all()
                
                dropped_classes = sum(1 for e in enrollments if getattr(e, 'status', None) == "dropped")
                semester_count = len(set(getattr(e, 'class_id', 0) for e in enrollments))
            except Exception as e:
                print(f"Error calculating class enrollments for student {student_id}: {e}")
                dropped_classes = 0
                semester_count = 1
            
            # Tính xu hướng điểm danh với error handling
            try:
                if total_attendance >= 10:
                    recent_attendance = sorted(attendance_records, key=lambda x: x.date, reverse=True)
                    recent_30 = recent_attendance[:min(30, len(recent_attendance)//2)]
                    previous_30 = recent_attendance[len(recent_30):len(recent_30)*2]
                    
                    if recent_30 and previous_30:
                        recent_rate = sum(1 for a in recent_30 if getattr(a, 'status', None) == "present") / len(recent_30)
                        previous_rate = sum(1 for a in previous_30 if getattr(a, 'status', None) == "present") / len(previous_30)
                        attendance_trend = recent_rate - previous_rate
                    else:
                        attendance_trend = 0.0
                else:
                    attendance_trend = 0.0
            except Exception as e:
                print(f"Error calculating attendance trend for student {student_id}: {e}")
                attendance_trend = 0.0
            
            # Mã hóa thuộc tính enum với error handling
            academic_status_map = {'good': 0, 'warning': 1, 'probation': 2, 'suspended': 3}
            income_level_map = {'very_low': 0, 'low': 1, 'medium': 2, 'high': 3, 'very_high': 4}
            scholarship_map = {'none': 0, 'partial': 1, 'full': 2}
            
            # Xử lý các thuộc tính có thể không tồn tại
            academic_status = academic_status_map.get(getattr(student, 'academic_status', None), 0)
            family_income_level = income_level_map.get(getattr(student, 'family_income_level', None), 2)  # default medium
            scholarship_status = scholarship_map.get(getattr(student, 'scholarship_status', None), 0)
            
            # Các thuộc tính không có trong model - sử dụng giá trị mặc định
            previous_academic_warning = 0  # Không có trong model Student
            
            # Tổng hợp đặc trưng
            features = {
                'attendance_rate': attendance_rate,
                'avg_gpa': avg_gpa,
                'failed_subjects': failed_subjects,
                'total_subjects': total_subjects,
                'minor_violations': minor_violations,
                'moderate_violations': moderate_violations,
                'severe_violations': severe_violations,
                'academic_status': academic_status,
                'family_income_level': family_income_level,
                'scholarship_status': scholarship_status,
                'previous_academic_warning': previous_academic_warning,
                'dropped_classes': dropped_classes,
                'semester_count': semester_count,
                'grade_trend': grade_trend,
                'attendance_trend': attendance_trend
            }
            
            return features
            
        except Exception as e:
            print(f"Error extracting features for student {student_id}: {e}")
            # Trả về features mặc định thay vì None
            return {
                'attendance_rate': 100.0,
                'avg_gpa': 0.0,
                'failed_subjects': 0,
                'total_subjects': 0,
                'minor_violations': 0,
                'moderate_violations': 0,
                'severe_violations': 0,
                'academic_status': 0,
                'family_income_level': 2,
                'scholarship_status': 0,
                'previous_academic_warning': 0,
                'dropped_classes': 0,
                'semester_count': 1,
                'grade_trend': 0.0,
                'attendance_trend': 0.0
            }
    
    def _prepare_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Chuẩn bị dữ liệu huấn luyện
        """
        students = self.db.query(Student).all()
        features_list = []
        labels = []
        
        for student in students:
            features = self._extract_student_features(student.student_id)
            if not features:
                continue
                
            # Tạo nhãn dựa trên các tiêu chí nguy cơ cao
            is_high_risk = (
                features['attendance_rate'] < 75 or
                features['avg_gpa'] < 5.0 or
                features['failed_subjects'] > 2 or
                features['severe_violations'] > 0 or
                features['moderate_violations'] > 2 or
                features['academic_status'] >= 2 or
                features['dropped_classes'] > 1
            )
            
            # Chuyển đổi features thành list theo thứ tự đã định
            feature_vector = [features[name] for name in self.feature_names]
            features_list.append(feature_vector)
            labels.append(1 if is_high_risk else 0)
        
        return np.array(features_list), np.array(labels)
    
    def train_models(self) -> Dict[str, Any]:
        """
        Huấn luyện cả Random Forest và Logistic Regression
        """
        print("Chuẩn bị dữ liệu huấn luyện...")
        X, y = self._prepare_training_data()
        
        if len(X) == 0:
            raise ValueError("Không có dữ liệu để huấn luyện")
        
        print(f"Dữ liệu huấn luyện: {len(X)} mẫu, {len(self.feature_names)} đặc trưng")
        print(f"Phân bố nhãn: {np.bincount(y)}")
        
        # Chia dữ liệu
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Chuẩn hóa dữ liệu
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Huấn luyện Random Forest
        print("Huấn luyện Random Forest...")
        rf_params = {
            'n_estimators': [100, 200],
            'max_depth': [5, 10, None],
            'min_samples_split': [2, 5],
            'min_samples_leaf': [1, 2]
        }
        
        rf_grid = GridSearchCV(
            RandomForestClassifier(random_state=42),
            rf_params,
            cv=3,
            scoring='roc_auc',
            n_jobs=-1
        )
        rf_grid.fit(X_train_scaled, y_train)
        self.rf_model = rf_grid.best_estimator_
        
        # Huấn luyện Logistic Regression
        print("Huấn luyện Logistic Regression...")
        lr_params = {
            'C': [0.1, 1, 10],
            'penalty': ['l2'],
            'solver': ['liblinear']
        }
        
        lr_grid = GridSearchCV(
            LogisticRegression(random_state=42, max_iter=1000),
            lr_params,
            cv=3,
            scoring='roc_auc',
            n_jobs=-1
        )
        lr_grid.fit(X_train_scaled, y_train)
        self.lr_model = lr_grid.best_estimator_
        
        # Đánh giá mô hình
        rf_pred = self.rf_model.predict(X_test_scaled)
        rf_pred_proba = self.rf_model.predict_proba(X_test_scaled)[:, 1]
        
        lr_pred = self.lr_model.predict(X_test_scaled)
        lr_pred_proba = self.lr_model.predict_proba(X_test_scaled)[:, 1]
        
        results = {
            'random_forest': {
                'accuracy': accuracy_score(y_test, rf_pred),
                'roc_auc': roc_auc_score(y_test, rf_pred_proba),
                'best_params': rf_grid.best_params_,
                'feature_importance': dict(zip(self.feature_names, self.rf_model.feature_importances_))
            },
            'logistic_regression': {
                'accuracy': accuracy_score(y_test, lr_pred),
                'roc_auc': roc_auc_score(y_test, lr_pred_proba),
                'best_params': lr_grid.best_params_,
                'coefficients': dict(zip(self.feature_names, self.lr_model.coef_[0]))
            },
            'training_info': {
                'total_samples': len(X),
                'training_samples': len(X_train),
                'test_samples': len(X_test),
                'feature_count': len(self.feature_names),
                'class_distribution': dict(zip(['Low Risk', 'High Risk'], np.bincount(y)))
            }
        }
        
        # Lưu mô hình
        self._save_models()
        
        print("Huấn luyện hoàn thành!")
        print(f"Random Forest - Accuracy: {results['random_forest']['accuracy']:.3f}, ROC-AUC: {results['random_forest']['roc_auc']:.3f}")
        print(f"Logistic Regression - Accuracy: {results['logistic_regression']['accuracy']:.3f}, ROC-AUC: {results['logistic_regression']['roc_auc']:.3f}")
        
        return results
    
    def _save_models(self):
        """
        Lưu mô hình đã huấn luyện
        """
        os.makedirs(self.models_dir, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        model_data = {
            'rf_model': self.rf_model,
            'lr_model': self.lr_model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'timestamp': timestamp
        }
        
        model_path = os.path.join(self.models_dir, f'ml_dropout_models_{timestamp}.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Mô hình đã được lưu tại: {model_path}")
    
    def _load_models(self) -> bool:
        """
        Tải mô hình đã huấn luyện
        """
        if not os.path.exists(self.models_dir):
            return False
            
        model_files = [f for f in os.listdir(self.models_dir) if f.startswith('ml_dropout_models_')]
        if not model_files:
            return False
            
        # Lấy file mới nhất
        latest_model = sorted(model_files)[-1]
        model_path = os.path.join(self.models_dir, latest_model)
        
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
                
            self.rf_model = model_data['rf_model']
            self.lr_model = model_data['lr_model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            
            print(f"Đã tải mô hình từ: {model_path}")
            return True
            
        except Exception as e:
            print(f"Lỗi khi tải mô hình: {e}")
            return False
    
    def predict_dropout_risk(self, student_id: int, use_ensemble: bool = True) -> Optional[Dict[str, Any]]:
        """
        Dự đoán nguy cơ bỏ học cho sinh viên
        """
        # Tải mô hình nếu chưa có
        if self.rf_model is None or self.lr_model is None:
            if not self._load_models():
                print("Chưa có mô hình được huấn luyện. Đang huấn luyện mô hình mới...")
                self.train_models()
        
        # Trích xuất đặc trưng
        features = self._extract_student_features(student_id)
        if not features:
            return None
        
        # Chuẩn bị dữ liệu dự đoán
        feature_vector = np.array([[features[name] for name in self.feature_names]])
        feature_vector_scaled = self.scaler.transform(feature_vector)
        
        # Dự đoán với Random Forest
        rf_proba = self.rf_model.predict_proba(feature_vector_scaled)[0, 1]
        rf_prediction = self.rf_model.predict(feature_vector_scaled)[0]
        
        # Dự đoán với Logistic Regression
        lr_proba = self.lr_model.predict_proba(feature_vector_scaled)[0, 1]
        lr_prediction = self.lr_model.predict(feature_vector_scaled)[0]
        
        # Tính toán kết quả ensemble
        if use_ensemble:
            # Trọng số: Random Forest 60%, Logistic Regression 40%
            ensemble_proba = 0.6 * rf_proba + 0.4 * lr_proba
            ensemble_prediction = 1 if ensemble_proba > 0.5 else 0
        else:
            ensemble_proba = rf_proba
            ensemble_prediction = rf_prediction
        
        # Phân tích yếu tố rủi ro
        risk_factors = self._analyze_risk_factors(features)
        
        # Chuyển đổi thành phần trăm
        risk_percentage = ensemble_proba * 100
        
        # Lưu kết quả vào database
        try:
            dropout_risk_data = DropoutRiskCreate(
                student_id=student_id,
                risk_percentage=risk_percentage,
                risk_factors=risk_factors
            )
            
            dropout_risk = create_dropout_risk(self.db, dropout_risk_data)
            risk_id = dropout_risk.risk_id
            analysis_date = dropout_risk.analysis_date
        except Exception as e:
            print(f"Error saving dropout risk to database: {e}")
            risk_id = None
            analysis_date = datetime.now()
        
        return {
            "risk_id": risk_id,
            "student_id": student_id,
            "risk_percentage": risk_percentage,
            "risk_level": self._get_risk_level(risk_percentage),
            "prediction_details": {
                "random_forest": {
                    "probability": rf_proba * 100,
                    "prediction": "High Risk" if rf_prediction == 1 else "Low Risk"
                },
                "logistic_regression": {
                    "probability": lr_proba * 100,
                    "prediction": "High Risk" if lr_prediction == 1 else "Low Risk"
                },
                "ensemble": {
                    "probability": risk_percentage,
                    "prediction": "High Risk" if ensemble_prediction == 1 else "Low Risk"
                }
            },
            "risk_factors": risk_factors,
            "feature_analysis": self._get_feature_analysis(features),
            "analysis_date": analysis_date
        }
    
    def _analyze_risk_factors(self, features: Dict[str, Any]) -> Dict[str, bool]:
        """
        Phân tích các yếu tố rủi ro
        """
        return {
            "poor_attendance": features['attendance_rate'] < 80,
            "low_gpa": features['avg_gpa'] < 6.0,
            "failed_subjects": features['failed_subjects'] > 0,
            "disciplinary_issues": (
                features['severe_violations'] > 0 or 
                features['moderate_violations'] > 1
            ),
            "academic_warning": features['previous_academic_warning'] > 0,
            "dropped_classes": features['dropped_classes'] > 0,
            "financial_issues": (
                features['family_income_level'] < 2 and 
                features['scholarship_status'] == 0
            ),
            "declining_performance": (
                features['grade_trend'] < -0.5 or 
                features['attendance_trend'] < -0.1
            )
        }
    
    def _get_feature_analysis(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Phân tích chi tiết các đặc trưng
        """
        if self.rf_model is None:
            return {}
            
        # Lấy feature importance từ Random Forest
        feature_importance = dict(zip(self.feature_names, self.rf_model.feature_importances_))
        
        # Phân tích từng đặc trưng
        analysis = {}
        for feature_name, value in features.items():
            if feature_name in feature_importance:
                analysis[feature_name] = {
                    "value": value,
                    "importance": feature_importance[feature_name],
                    "interpretation": self._interpret_feature(feature_name, value)
                }
        
        return analysis
    
    def _interpret_feature(self, feature_name: str, value: float) -> str:
        """
        Diễn giải ý nghĩa của từng đặc trưng
        """
        interpretations = {
            'attendance_rate': f"Tỷ lệ điểm danh {value:.1f}% ({'Tốt' if value >= 90 else 'Khá' if value >= 80 else 'Kém'})",
            'avg_gpa': f"Điểm trung bình {value:.2f} ({'Xuất sắc' if value >= 8.5 else 'Giỏi' if value >= 7.0 else 'Khá' if value >= 6.0 else 'Yếu'})",
            'failed_subjects': f"{int(value)} môn không đạt ({'Bình thường' if value == 0 else 'Cần chú ý'})",
            'severe_violations': f"{int(value)} vi phạm nghiêm trọng ({'An toàn' if value == 0 else 'Nguy hiểm'})",
            'academic_status': f"Tình trạng học tập cấp độ {int(value)} ({'Bình thường' if value == 0 else 'Cảnh báo' if value == 1 else 'Thử thách'})"
        }
        
        return interpretations.get(feature_name, f"Giá trị: {value}")
    
    def _get_risk_level(self, risk_percentage: float) -> str:
        """
        Xác định mức độ rủi ro
        """
        if risk_percentage >= 80:
            return "Rất cao"
        elif risk_percentage >= 60:
            return "Cao"
        elif risk_percentage >= 40:
            return "Trung bình"
        elif risk_percentage >= 20:
            return "Thấp"
        else:
            return "Rất thấp"
    
    def get_model_performance(self) -> Dict[str, Any]:
        """
        Lấy thông tin hiệu suất mô hình
        """
        if self.rf_model is None or self.lr_model is None:
            return {"error": "Mô hình chưa được huấn luyện"}
        
        # Đánh giá trên dữ liệu huấn luyện (để kiểm tra)
        X, y = self._prepare_training_data()
        X_scaled = self.scaler.transform(X)
        
        rf_scores = cross_val_score(self.rf_model, X_scaled, y, cv=3, scoring='roc_auc')
        lr_scores = cross_val_score(self.lr_model, X_scaled, y, cv=3, scoring='roc_auc')
        
        # Feature importance từ Random Forest
        feature_importance = dict(zip(self.feature_names, self.rf_model.feature_importances_))
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "random_forest": {
                "cross_val_auc_mean": rf_scores.mean(),
                "cross_val_auc_std": rf_scores.std(),
                "feature_importance": sorted_features
            },
            "logistic_regression": {
                "cross_val_auc_mean": lr_scores.mean(),
                "cross_val_auc_std": lr_scores.std(),
                "coefficients": dict(zip(self.feature_names, self.lr_model.coef_[0]))
            },
            "data_info": {
                "total_samples": len(X),
                "features_count": len(self.feature_names),
                "class_distribution": dict(zip(['Low Risk', 'High Risk'], np.bincount(y)))
            }
        }
    
    def predict_all_students(self) -> List[Dict[str, Any]]:
        """
        Dự đoán nguy cơ bỏ học cho tất cả sinh viên
        """
        students = self.db.query(Student).all()
        results = []
        
        for student in students:
            try:
                result = self.predict_dropout_risk(student.student_id)
                if result:
                    results.append(result)
            except Exception as e:
                print(f"Lỗi khi dự đoán cho sinh viên {student.student_id}: {e}")
                continue
        
        return results
    
    def _get_recommendations(self, risk_factors: Dict[str, bool]) -> List[str]:
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
