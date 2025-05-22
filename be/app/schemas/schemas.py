from typing import Optional, List, Dict, Any, Union
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field, validator
from enum import Enum

# ----- Enums -----
class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"
    COUNSELOR = "counselor"
    PARENT = "parent"

class AccountStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class IncomeLevel(str, Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class ScholarshipStatus(str, Enum):
    NONE = "none"
    PARTIAL = "partial"
    FULL = "full"

class AcademicStatus(str, Enum):
    GOOD = "good"
    WARNING = "warning"
    PROBATION = "probation"
    SUSPENDED = "suspended"

class Semester(str, Enum):
    FIRST = "1"
    SECOND = "2"
    SUMMER = "summer"

class EnrollmentStatus(str, Enum):
    ENROLLED = "enrolled"
    DROPPED = "dropped"
    COMPLETED = "completed"

class SeverityLevel(str, Enum):
    MINOR = "minor"
    MODERATE = "moderate"
    SEVERE = "severe"

# ----- Base Models -----
class UserBase(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    account_status: Optional[AccountStatus] = None

class UserInDB(UserBase):
    user_id: int
    account_status: AccountStatus
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    user_id: int
    account_status: AccountStatus
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----- Student Models -----
class StudentBase(BaseModel):
    student_code: str
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    hometown: Optional[str] = None
    current_address: Optional[str] = None
    family_income_level: Optional[IncomeLevel] = None
    family_background: Optional[str] = None
    scholarship_status: Optional[ScholarshipStatus] = None
    scholarship_amount: Optional[float] = None
    health_condition: Optional[str] = None
    mental_health_status: Optional[str] = None
    entry_year: Optional[int] = None
    expected_graduation_year: Optional[int] = None

class StudentCreate(StudentBase):
    user_id: int

class StudentUpdate(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    hometown: Optional[str] = None
    current_address: Optional[str] = None
    family_income_level: Optional[IncomeLevel] = None
    family_background: Optional[str] = None
    scholarship_status: Optional[ScholarshipStatus] = None
    scholarship_amount: Optional[float] = None
    health_condition: Optional[str] = None
    mental_health_status: Optional[str] = None
    entry_year: Optional[int] = None
    expected_graduation_year: Optional[int] = None
    academic_status: Optional[AcademicStatus] = None

class StudentInDB(StudentBase):
    student_id: int
    user_id: int
    attendance_rate: float
    previous_academic_warning: int
    academic_status: AcademicStatus

    class Config:
        from_attributes = True

class StudentResponse(StudentBase):
    student_id: int
    user: Optional[UserResponse] = None
    attendance_rate: float
    previous_academic_warning: int
    academic_status: AcademicStatus

    class Config:
        from_attributes = True

# ----- Teacher Models -----
class TeacherBase(BaseModel):
    teacher_code: str
    department: Optional[str] = None
    position: Optional[str] = None
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    years_of_experience: Optional[int] = None
    date_hired: Optional[date] = None

class TeacherCreate(TeacherBase):
    user_id: int

class TeacherUpdate(BaseModel):
    department: Optional[str] = None
    position: Optional[str] = None
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    years_of_experience: Optional[int] = None
    date_hired: Optional[date] = None

class TeacherInDB(TeacherBase):
    teacher_id: int
    user_id: int

    class Config:
        from_attributes = True

class TeacherResponse(TeacherBase):
    teacher_id: int
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# ----- Parent Models -----
class ParentBase(BaseModel):
    student_id: int
    relation_to_student: str
    occupation: Optional[str] = None
    education_level: Optional[str] = None
    income: Optional[float] = None
    phone_secondary: Optional[str] = None
    address: Optional[str] = None

class ParentCreate(ParentBase):
    user_id: int

class ParentUpdate(BaseModel):
    relation_to_student: Optional[str] = None
    occupation: Optional[str] = None
    education_level: Optional[str] = None
    income: Optional[float] = None
    phone_secondary: Optional[str] = None
    address: Optional[str] = None

class ParentInDB(ParentBase):
    parent_id: int
    user_id: int

    class Config:
        from_attributes = True

class ParentResponse(ParentBase):
    parent_id: int
    user: Optional[UserResponse] = None
    student: Optional[StudentResponse] = None

    class Config:
        from_attributes = True

# ----- Class Models -----
class ClassBase(BaseModel):
    class_name: str
    class_description: Optional[str] = None
    academic_year: str
    semester: Semester
    department: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    schedule: Optional[Any] = None
    max_students: Optional[int] = None

class ClassCreate(ClassBase):
    teacher_id: Optional[int] = None

class ClassUpdate(BaseModel):
    class_name: Optional[str] = None
    class_description: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[Semester] = None
    department: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    schedule: Optional[Any] = None
    teacher_id: Optional[int] = None
    max_students: Optional[int] = None

class ClassInDB(ClassBase):
    class_id: int
    teacher_id: Optional[int] = None
    current_students: int

    class Config:
        from_attributes = True

class ClassResponse(ClassBase):
    class_id: int
    teacher_id: Optional[int] = None
    current_students: int
    teacher: Optional[TeacherResponse] = None

    class Config:
        from_attributes = True

# ----- Subject Models -----
class SubjectBase(BaseModel):
    subject_code: str
    subject_name: str
    subject_description: Optional[str] = None
    department: Optional[str] = None
    credits: int
    credits_theory: Optional[float] = None
    credits_practice: Optional[float] = None
    prerequisite_subjects: Optional[str] = None
    syllabus_link: Optional[str] = None

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = None
    subject_description: Optional[str] = None
    department: Optional[str] = None
    credits: Optional[int] = None
    credits_theory: Optional[float] = None
    credits_practice: Optional[float] = None
    prerequisite_subjects: Optional[str] = None
    syllabus_link: Optional[str] = None

class SubjectInDB(SubjectBase):
    subject_id: int

    class Config:
        from_attributes = True

class SubjectResponse(SubjectBase):
    subject_id: int

    class Config:
        from_attributes = True

# ----- ClassStudent Models -----
class ClassStudentBase(BaseModel):
    class_id: int
    student_id: int
    enrollment_date: Optional[date] = None
    status: EnrollmentStatus = EnrollmentStatus.ENROLLED

class ClassStudentCreate(ClassStudentBase):
    pass

class ClassStudentUpdate(BaseModel):
    status: Optional[EnrollmentStatus] = None

class ClassStudentInDB(ClassStudentBase):
    class Config:
        from_attributes = True

class ClassStudentResponse(ClassStudentBase):
    student: Optional[StudentResponse] = None
    class_obj: Optional[ClassResponse] = None

    class Config:
        from_attributes = True

# ----- Grade Models -----
class GradeBase(BaseModel):
    student_id: int
    subject_id: int
    class_id: int
    assignment_score: Optional[float] = None
    midterm_score: Optional[float] = None
    final_score: Optional[float] = None
    gpa: Optional[float] = None

class GradeCreate(GradeBase):
    pass

class GradeUpdate(BaseModel):
    assignment_score: Optional[float] = None
    midterm_score: Optional[float] = None
    final_score: Optional[float] = None
    gpa: Optional[float] = None

class GradeInDB(GradeBase):
    grade_id: int

    class Config:
        from_attributes = True

class GradeResponse(GradeBase):
    grade_id: int
    student: Optional[StudentResponse] = None
    subject: Optional[SubjectResponse] = None
    class_obj: Optional[ClassResponse] = None

    class Config:
        from_attributes = True

# ----- DisciplinaryRecord Models -----
class DisciplinaryRecordBase(BaseModel):
    student_id: int
    violation_description: Optional[str] = None
    violation_date: date
    severity_level: SeverityLevel

class DisciplinaryRecordCreate(DisciplinaryRecordBase):
    pass

class DisciplinaryRecordUpdate(BaseModel):
    violation_description: Optional[str] = None
    violation_date: Optional[date] = None
    severity_level: Optional[SeverityLevel] = None

class DisciplinaryRecordInDB(DisciplinaryRecordBase):
    record_id: int

    class Config:
        from_attributes = True

class DisciplinaryRecordResponse(DisciplinaryRecordBase):
    record_id: int
    student: Optional[StudentResponse] = None

    class Config:
        from_attributes = True

# ----- DropoutRisk Models -----
class DropoutRiskBase(BaseModel):
    student_id: int
    risk_percentage: float
    risk_factors: Optional[Dict[str, Any]] = None

class DropoutRiskCreate(DropoutRiskBase):
    pass

class DropoutRiskUpdate(BaseModel):
    risk_percentage: Optional[float] = None
    risk_factors: Optional[Dict[str, Any]] = None

class DropoutRiskInDB(DropoutRiskBase):
    risk_id: int
    analysis_date: datetime

    class Config:
        from_attributes = True

class DropoutRiskResponse(DropoutRiskBase):
    risk_id: int
    analysis_date: datetime
    student: Optional[StudentResponse] = None

    class Config:
        from_attributes = True

# ----- Auth Models -----
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[UserRole] = None
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# ----- Pagination and Search Schemas -----
class PaginationParams(BaseModel):
    page: int = Field(1, description="Page number starting from 1")
    size: int = Field(10, description="Number of items per page")
    
    @validator('page')
    def page_must_be_positive(cls, v):
        if v < 1:
            raise ValueError('Page number must be positive')
        return v
    
    @validator('size')
    def size_must_be_positive(cls, v):
        if v < 1:
            raise ValueError('Page size must be positive')
        if v > 100:
            return 100  # Limit maximum page size
        return v

class SearchParams(BaseModel):
    query: Optional[str] = Field(None, description="Search query string")
    field: Optional[str] = Field(None, description="Field to search in")
    
class PaginatedResponse(BaseModel):
    items: List[Any] = []
    total: int
    page: int
    size: int
    pages: int
