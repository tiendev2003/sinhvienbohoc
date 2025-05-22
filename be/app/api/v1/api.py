from fastapi import APIRouter

from app.api.v1 import (
    auth, users, students, teachers, parents, classes, subjects, 
    grades, attendance, disciplinary_records, dropout_risks, uploads,
    class_dropout_risk
)

api_router = APIRouter()

# Auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# User routes
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Student routes 
api_router.include_router(students.router, prefix="/students", tags=["students"])

# Teacher routes
api_router.include_router(teachers.router, prefix="/teachers", tags=["teachers"])

# Parent routes
api_router.include_router(parents.router, prefix="/parents", tags=["parents"])

# Class routes
api_router.include_router(classes.router, prefix="/classes", tags=["classes"])

# Class dropout risk routes
api_router.include_router(class_dropout_risk.router, prefix="/classes", tags=["class-dropout-risks"])

# Subject routes
api_router.include_router(subjects.router, prefix="/subjects", tags=["subjects"])

# Grade routes
api_router.include_router(grades.router, prefix="/grades", tags=["grades"])

# Attendance routes
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])

# Disciplinary record routes
api_router.include_router(disciplinary_records.router, prefix="/disciplinary-records", tags=["disciplinary_records"])

# Dropout risk routes
api_router.include_router(dropout_risks.router, prefix="/dropout-risks", tags=["dropout_risks"])

# Upload routes
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
