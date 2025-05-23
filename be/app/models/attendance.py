from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, Text, Date, TIMESTAMP, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, column_property
from sqlalchemy.ext.hybrid import hybrid_property

from app.db.database import Base
from app.models.models import Student, Class, User

class Attendance(Base):
    __tablename__ = "attendance"
    
    attendance_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum('present', 'absent', 'late', 'excused'), default='present', nullable=False)
    minutes_late = Column(Integer, default=0, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    student = relationship("Student", back_populates="attendance", foreign_keys=[student_id])
    class_obj = relationship("Class", back_populates="attendance", foreign_keys=[class_id])
    
    # Hybrid properties for frontend use
    @hybrid_property
    def student_name(self):
        return self.student.user.full_name if self.student and self.student.user else None
    
    @hybrid_property
    def class_name(self):
        return self.class_obj.class_name if self.class_obj else None
    
    def __repr__(self):
        return f"<Attendance {self.attendance_id}>"
    
    def to_dict(self):
        """Convert the attendance record to a dictionary with additional information"""
        return {
            "attendance_id": self.attendance_id,
            "student_id": self.student_id,
            "student_name": self.student_name,
            "class_id": self.class_id,
            "class_name": self.class_name,
            "date": self.date.isoformat() if self.date else None,
            "status": self.status,
            "minutes_late": self.minutes_late,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
