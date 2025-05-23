from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class ClassSubjectBase(BaseModel):
    class_id: int
    subject_id: int


class ClassSubjectCreate(ClassSubjectBase):
    pass


class ClassSubjectRead(ClassSubjectBase):
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
