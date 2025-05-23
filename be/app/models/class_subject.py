from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class ClassSubject(Base):
    __tablename__ = "class_subjects"
    
    class_id = Column(Integer, ForeignKey("classes.class_id", ondelete="CASCADE"), primary_key=True)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    class_obj = relationship("Class", back_populates="subjects")
    subject = relationship("Subject", back_populates="classes")
    
    def __repr__(self):
        return f"<ClassSubject {self.class_id}-{self.subject_id}>"
