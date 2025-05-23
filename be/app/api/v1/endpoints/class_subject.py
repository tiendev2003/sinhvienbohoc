from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.class_subject import class_subject
from app.schemas.class_subject import ClassSubjectCreate, ClassSubjectRead
from app.schemas.schemas import SubjectResponse, ClassResponse, MessageResponse

router = APIRouter()


@router.post("/", response_model=ClassSubjectRead, status_code=201)
def add_subject_to_class(
    class_subject_in: ClassSubjectCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    """
    Add a subject to a class.
    """
    return class_subject.create_class_subject(
        db=db, class_id=class_subject_in.class_id, subject_id=class_subject_in.subject_id
    )


@router.delete("/{class_id}/{subject_id}", response_model=MessageResponse)
def remove_subject_from_class(
    class_id: int,
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    """
    Remove a subject from a class.
    """
    result = class_subject.remove_class_subject(
        db=db, class_id=class_id, subject_id=subject_id
    )
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Subject not found in this class"
        )
    return {"message": "Subject removed from class successfully"}


@router.get("/class/{class_id}/subjects", response_model=List[SubjectResponse])
def get_subjects_in_class(
    class_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    """
    Get all subjects in a specific class.
    """
    subjects = class_subject.get_subjects_by_class(
        db=db, class_id=class_id, skip=skip, limit=limit
    )
    return subjects


@router.get("/subject/{subject_id}/classes", response_model=List[ClassResponse])
def get_classes_with_subject(
    subject_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
) -> Any:
    """
    Get all classes that have a specific subject.
    """
    classes = class_subject.get_classes_by_subject(
        db=db, subject_id=subject_id, skip=skip, limit=limit
    )
    return classes
