from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, Text, Date, TIMESTAMP, Boolean, JSON, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('admin', 'teacher', 'student', 'counselor', 'parent'), nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    profile_picture = Column(String(255), nullable=True)
    account_status = Column(Enum('active', 'inactive', 'suspended'), default='active')
    last_login = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    student = relationship("Student", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User {self.username}>"

class Student(Base):
    __tablename__ = "students"
    
    student_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True)
    student_code = Column(String(20), unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(Enum('male', 'female', 'other'), nullable=True)
    hometown = Column(String(100), nullable=True)
    current_address = Column(String(255), nullable=True)
    family_income_level = Column(Enum('very_low', 'low', 'medium', 'high', 'very_high'), nullable=True)
    family_background = Column(Text, nullable=True)
    scholarship_status = Column(Enum('none', 'partial', 'full'), nullable=True)
    scholarship_amount = Column(Numeric(10, 2), nullable=True)
    health_condition = Column(Text, nullable=True)
    mental_health_status = Column(Text, nullable=True)
    attendance_rate = Column(Float, default=100.0)
    previous_academic_warning = Column(Integer, default=0)
    academic_status = Column(Enum('good', 'warning', 'probation', 'suspended'), default='good')
    entry_year = Column(Integer, nullable=True)
    expected_graduation_year = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="student")
    grades = relationship("Grade", back_populates="student")
    disciplinary_records = relationship("DisciplinaryRecord", back_populates="student")
    dropout_risks = relationship("DropoutRisk", back_populates="student")
    classes = relationship("ClassStudent", back_populates="student")
    
    def __repr__(self):
        return f"<Student {self.student_code}>"

class Class(Base):
    __tablename__ = "classes"
    
    class_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    class_name = Column(String(50), nullable=False)
    class_description = Column(Text, nullable=True)
    academic_year = Column(String(10), nullable=False)
    semester = Column(Enum('1', '2', 'summer'), nullable=False)
    department = Column(String(100), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    schedule = Column(JSON, nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    max_students = Column(Integer, nullable=True)
    current_students = Column(Integer, default=0)
    
    # Relationships
    teacher = relationship("User")
    students = relationship("ClassStudent", back_populates="class_obj")
    grades = relationship("Grade", back_populates="class_obj")
    
    def __repr__(self):
        return f"<Class {self.class_name}>"

class Subject(Base):
    __tablename__ = "subjects"
    
    subject_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    subject_code = Column(String(20), unique=True, nullable=False)
    subject_name = Column(String(100), nullable=False)
    subject_description = Column(Text, nullable=True)
    department = Column(String(100), nullable=True)
    credits = Column(Integer, nullable=False)
    credits_theory = Column(Float, nullable=True)
    credits_practice = Column(Float, nullable=True)
    prerequisite_subjects = Column(String(255), nullable=True)
    syllabus_link = Column(String(255), nullable=True)
    
    # Relationships
    grades = relationship("Grade", back_populates="subject")
    
    def __repr__(self):
        return f"<Subject {self.subject_code}>"

class ClassStudent(Base):
    __tablename__ = "class_students"
    
    class_id = Column(Integer, ForeignKey("classes.class_id", ondelete="CASCADE"), primary_key=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), primary_key=True)
    enrollment_date = Column(TIMESTAMP, server_default=func.now())
    status = Column(Enum('enrolled', 'dropped', 'completed'), default='enrolled')
    
    # Relationships
    class_obj = relationship("Class", back_populates="students")
    student = relationship("Student", back_populates="classes")
    
    def __repr__(self):
        return f"<ClassStudent {self.class_id}-{self.student_id}>"

class Grade(Base):
    __tablename__ = "grades"
    
    grade_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"))
    subject_id = Column(Integer, ForeignKey("subjects.subject_id", ondelete="CASCADE"))
    class_id = Column(Integer, ForeignKey("classes.class_id", ondelete="CASCADE"))
    assignment_score = Column(Float, nullable=True)
    midterm_score = Column(Float, nullable=True)
    final_score = Column(Float, nullable=True)
    gpa = Column(Float, nullable=True)
    
    # Relationships
    student = relationship("Student", back_populates="grades")
    subject = relationship("Subject", back_populates="grades")
    class_obj = relationship("Class", back_populates="grades")
    
    def __repr__(self):
        return f"<Grade {self.grade_id}>"

class DisciplinaryRecord(Base):
    __tablename__ = "disciplinary_records"
    
    record_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"))
    violation_description = Column(Text, nullable=True)
    violation_date = Column(Date, nullable=False)
    severity_level = Column(Enum('minor', 'moderate', 'severe'), nullable=False)
    
    # Relationships
    student = relationship("Student", back_populates="disciplinary_records")
    
    def __repr__(self):
        return f"<DisciplinaryRecord {self.record_id}>"

class DropoutRisk(Base):
    __tablename__ = "dropout_risks"
    
    risk_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"))
    risk_percentage = Column(Float, nullable=False)
    analysis_date = Column(TIMESTAMP, server_default=func.now())
    risk_factors = Column(JSON, nullable=True)
    
    # Relationships
    student = relationship("Student", back_populates="dropout_risks")
    
    def __repr__(self):
        return f"<DropoutRisk {self.risk_id}>"
