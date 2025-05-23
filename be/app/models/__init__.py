# Import all models here
from .models import Base, User, Student, Teacher,  Class, Subject, Grade, DisciplinaryRecord, DropoutRisk
from .attendance import Attendance
from .class_subject import ClassSubject

__all__ = [
    "Base", "User", "Student", "Teacher", "Class", "Subject",
    "Grade", "Attendance", "DisciplinaryRecord", "DropoutRisk", "ClassSubject"
]
