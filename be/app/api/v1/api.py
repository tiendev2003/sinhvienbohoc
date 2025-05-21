from fastapi import APIRouter

from app.api.v1 import auth, users, students, dropout_risks

api_router = APIRouter()

# Auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# User routes
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Student routes 
api_router.include_router(students.router, prefix="/students", tags=["students"])

# Dropout risk routes
api_router.include_router(dropout_risks.router, prefix="/dropout-risks", tags=["dropout_risks"])
