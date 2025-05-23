from app.api.v1.auth import router as auth
from app.api.v1.users import router as users
from app.api.v1.students import router as students
from app.api.v1.teachers import router as teachers
from app.api.v1.classes import router as classes
from app.api.v1.subjects import router as subjects
from app.api.v1.grades import router as grades
from app.api.v1.attendance import router as attendance
from app.api.v1.disciplinary_records import router as disciplinary_records
from app.api.v1.dropout_risks import router as dropout_risks
from app.api.v1.uploads import router as uploads
from app.api.v1.class_dropout_risk import router as class_dropout_risk
from app.api.v1.endpoints.class_subject import router as class_subject

__all__ = [
    "auth",
    "users", 
    "students",
    "teachers",
   
    "classes",
    "subjects",
    "grades",
    "attendance",
    "disciplinary_records",
    "dropout_risks",
    "uploads",
    "class_dropout_risk",
    "class_subject"
]
