from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import DropoutRisk, Student
from app.schemas.schemas import DropoutRiskCreate, DropoutRiskUpdate
from datetime import datetime
import json

def get_dropout_risk(db: Session, risk_id: int) -> Optional[DropoutRisk]:
    risk = db.query(DropoutRisk).filter(DropoutRisk.risk_id == risk_id).first()
    if risk and isinstance(risk.risk_factors, str):
        try:
            risk.risk_factors = json.loads(risk.risk_factors)
        except (json.JSONDecodeError, TypeError):
            pass
    return risk

def get_dropout_risks_by_student(db: Session, student_id: int) -> List[DropoutRisk]:
    risks = db.query(DropoutRisk).filter(DropoutRisk.student_id == student_id).all()
    for risk in risks:
        if isinstance(risk.risk_factors, str):
            try:
                risk.risk_factors = json.loads(risk.risk_factors)
            except (json.JSONDecodeError, TypeError):
                pass
    return risks

def get_latest_dropout_risk_by_student(db: Session, student_id: int) -> Optional[DropoutRisk]:
    risk = db.query(DropoutRisk).filter(
        DropoutRisk.student_id == student_id
    ).order_by(DropoutRisk.analysis_date.desc()).first()
    
    if risk and isinstance(risk.risk_factors, str):
        try:
            risk.risk_factors = json.loads(risk.risk_factors)
        except (json.JSONDecodeError, TypeError):
            pass
    return risk

def get_dropout_risks(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    min_risk: Optional[float] = None,
    max_risk: Optional[float] = None
) -> List[DropoutRisk]:
    query = db.query(DropoutRisk)
    
    if min_risk is not None:
        query = query.filter(DropoutRisk.risk_percentage >= min_risk)
    
    if max_risk is not None:
        query = query.filter(DropoutRisk.risk_percentage <= max_risk)
        
    risks = query.offset(skip).limit(limit).all()
    
    # Ensure risk_factors is properly parsed from JSON string to dict
    for risk in risks:
        if isinstance(risk.risk_factors, str):
            try:
                risk.risk_factors = json.loads(risk.risk_factors)
            except (json.JSONDecodeError, TypeError):
                pass
                
    return risks

def create_dropout_risk(db: Session, dropout_risk: DropoutRiskCreate) -> DropoutRisk:
    # Check if student exists
    student = db.query(Student).filter(Student.student_id == dropout_risk.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Create dropout risk data
    risk_data = dropout_risk.dict()
    
    # Create dropout risk
    db_dropout_risk = DropoutRisk(**risk_data, analysis_date=datetime.utcnow())
    
    db.add(db_dropout_risk)
    db.commit()
    db.refresh(db_dropout_risk)
    
    # Ensure risk_factors is properly parsed from JSON string to dict
    if db_dropout_risk.risk_factors and isinstance(db_dropout_risk.risk_factors, str):
        try:
            db_dropout_risk.risk_factors = json.loads(db_dropout_risk.risk_factors)
        except (json.JSONDecodeError, TypeError):
            pass
            
    return db_dropout_risk

def update_dropout_risk(db: Session, risk_id: int, dropout_risk: DropoutRiskUpdate) -> DropoutRisk:
    db_dropout_risk = get_dropout_risk(db, risk_id=risk_id)
    if not db_dropout_risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dropout risk assessment not found"
        )
    
    update_data = dropout_risk.dict(exclude_unset=True)
    
    # Update dropout risk attributes
    for key, value in update_data.items():
        setattr(db_dropout_risk, key, value)
    
    db.commit()
    db.refresh(db_dropout_risk)
    
    # Ensure risk_factors is properly parsed from JSON string to dict
    if db_dropout_risk.risk_factors and isinstance(db_dropout_risk.risk_factors, str):
        try:
            db_dropout_risk.risk_factors = json.loads(db_dropout_risk.risk_factors)
        except (json.JSONDecodeError, TypeError):
            pass
            
    return db_dropout_risk

def delete_dropout_risk(db: Session, risk_id: int) -> DropoutRisk:
    db_dropout_risk = get_dropout_risk(db, risk_id=risk_id)
    if not db_dropout_risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dropout risk assessment not found"
        )
    
    db.delete(db_dropout_risk)
    db.commit()
    return db_dropout_risk
