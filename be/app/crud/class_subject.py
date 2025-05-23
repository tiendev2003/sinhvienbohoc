from typing import List, Optional, Dict, Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.class_subject import ClassSubject
from app.models.models import Class, Subject

class CRUDClassSubject(CRUDBase[ClassSubject, Dict[str, Any], Dict[str, Any]]):
    def create_class_subject(
        self, db: Session, *, class_id: int, subject_id: int
    ) -> ClassSubject:
        """Add a subject to a class"""
        db_obj = ClassSubject(
            class_id=class_id,
            subject_id=subject_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove_class_subject(
        self, db: Session, *, class_id: int, subject_id: int
    ) -> bool:
        """Remove a subject from a class"""
        db_obj = db.query(ClassSubject).filter(
            ClassSubject.class_id == class_id,
            ClassSubject.subject_id == subject_id
        ).first()
        if not db_obj:
            return False
        db.delete(db_obj)
        db.commit()
        return True
    
    def get_subjects_by_class(
        self, db: Session, *, class_id: int, skip: int = 0, limit: int = 100
    ) -> List[Subject]:
        """Get all subjects for a specific class"""
        return db.query(Subject).join(
            ClassSubject, ClassSubject.subject_id == Subject.subject_id
        ).filter(
            ClassSubject.class_id == class_id
        ).offset(skip).limit(limit).all()
    
    def get_classes_by_subject(
        self, db: Session, *, subject_id: int, skip: int = 0, limit: int = 100
    ) -> List[Class]:
        """Get all classes for a specific subject"""
        return db.query(Class).join(
            ClassSubject, ClassSubject.class_id == Class.class_id
        ).filter(
            ClassSubject.subject_id == subject_id
        ).offset(skip).limit(limit).all()


class_subject = CRUDClassSubject(ClassSubject)
