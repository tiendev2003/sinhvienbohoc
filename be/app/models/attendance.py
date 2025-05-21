from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, Text, Date, TIMESTAMP, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

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
    student = relationship("Student", back_populates="attendance")
    class_obj = relationship("Class", back_populates="attendance")
    
    def __repr__(self):
        return f"<Attendance {self.attendance_id}>"
