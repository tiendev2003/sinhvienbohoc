from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.students import router as students_router
from app.api.v1.teachers import router as teachers_router
from app.api.v1.classes import router as classes_router
from app.api.v1.subjects import router as subjects_router
from app.api.v1.grades import router as grades_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.disciplinary_records import router as disciplinary_records_router
from app.api.v1.dropout_risks import router as dropout_risks_router
from app.api.v1.dropout_risk_ml import router as dropout_risk_ml_router
from app.api.v1.model_performance import router as model_performance_router
from app.api.v1.uploads import router as uploads_router
from app.api.v1.class_dropout_risk import router as class_dropout_risk_router
from app.api.v1.class_dropout_risk_ml import router as class_dropout_risk_ml_router
from app.api.v1.endpoints.class_subject import router as class_subject_router

api_router = APIRouter()

# Auth routes
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])

# User routes
api_router.include_router(users_router, prefix="/users", tags=["users"])

# Student routes 
api_router.include_router(students_router, prefix="/students", tags=["students"])

# Teacher routes
api_router.include_router(teachers_router, prefix="/teachers", tags=["teachers"])


# Class routes
api_router.include_router(classes_router, prefix="/classes", tags=["classes"])

# Class dropout risk routes
api_router.include_router(class_dropout_risk_router, prefix="/classes", tags=["class-dropout-risks"])

# Class dropout risk ML routes
api_router.include_router(class_dropout_risk_ml_router, prefix="/classes", tags=["class-dropout-risks-ml"])

# Subject routes
api_router.include_router(subjects_router, prefix="/subjects", tags=["subjects"])

# Class-Subject relation routes
api_router.include_router(class_subject_router, prefix="/class-subjects", tags=["class-subjects"])

# Grade routes
api_router.include_router(grades_router, prefix="/grades", tags=["grades"])

# Attendance routes
api_router.include_router(attendance_router, prefix="/attendance", tags=["attendance"])

# Disciplinary record routes
api_router.include_router(disciplinary_records_router, prefix="/disciplinary-records", tags=["disciplinary_records"])

# Dropout risk routes
api_router.include_router(dropout_risks_router, prefix="/dropout-risks", tags=["dropout_risks"])

# Dropout risk ML routes
api_router.include_router(dropout_risk_ml_router, prefix="/dropout-risks-ml", tags=["dropout_risks_ml"])

# Model performance routes
api_router.include_router(model_performance_router, prefix="/model-performance", tags=["model_performance"])

# Upload routes
api_router.include_router(uploads_router, prefix="/uploads", tags=["uploads"])
