import os
import sys
import random
from datetime import datetime, timedelta
from decimal import Decimal
import json

 
# Add the project root to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models import (
    User, Teacher, Student, Class, Subject,
    Grade, DisciplinaryRecord, DropoutRisk, ClassSubject, Attendance
)
from app.models.models import ClassStudent
from app.db.database import engine, Base, SessionLocal
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from faker import Faker

# Initialize faker
fake = Faker()  # Use both Vietnamese and English locales
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Constants
NUM_USERS = 100
NUM_TEACHERS = 20
NUM_STUDENTS = 70
NUM_CLASSES = 15
NUM_SUBJECTS = 30

# Helper function to hash passwords
def get_password_hash(password):
    return pwd_context.hash(password)

def create_fake_users(db: Session):
    print("Creating fake users...")
    users = []
    
    # Admin user
    admin = User(
        username="admin",
        password_hash=get_password_hash("admin123"),
        role="admin",
        full_name="Admin User",
        email="admin@example.com",
        phone="0901234567",
        profile_picture="/profiles/admin.jpg",
        account_status="active",
        last_login=datetime.now()
    )
    db.add(admin)
    users.append(admin)
    
    # Teachers
    teacher_users = []
    for i in range(1, NUM_TEACHERS + 1):
        gender = random.choice(['male', 'female'])
        first_name = fake.first_name_male() if gender == 'male' else fake.first_name_female()
        last_name = fake.last_name()
        username = f"teacher{i}"
        teacher_user = User(
            username=username,
            password_hash=get_password_hash(f"teacher{i}"),
            role="teacher",
            full_name=f"{first_name} {last_name}",
            email=f"{username}@example.com",
            phone=fake.phone_number(),
            profile_picture=f"/profiles/teachers/{i}.jpg" if random.random() > 0.3 else None,
            account_status="active",
        )
        db.add(teacher_user)
        users.append(teacher_user)
        teacher_users.append(teacher_user)

    # Students
    student_users = []
    for i in range(1, NUM_STUDENTS + 1):
        gender = random.choice(['male', 'female'])
        first_name = fake.first_name_male() if gender == 'male' else fake.first_name_female()
        last_name = fake.last_name()
        username = f"student{i}"
        
        student_user = User(
            username=username,
            password_hash=get_password_hash(f"student{i}"),
            role="student",
            full_name=f"{first_name} {last_name}",
            email=f"{username}@example.com",
            phone=fake.phone_number(),
            profile_picture=f"/profiles/students/{i}.jpg" if random.random() > 0.4 else None,
            account_status=random.choices(["active", "inactive", "suspended"], weights=[0.9, 0.07, 0.03])[0],
        )
        db.add(student_user)
        users.append(student_user)
        student_users.append(student_user)
    
    # Commit users to database to ensure they have valid IDs
    db.commit()
    
    return admin, teacher_users, student_users

def create_teachers(db: Session, teacher_users):
    print("Creating teacher profiles...")
    teachers = []
    for user in teacher_users:
        teacher = Teacher(
            user_id=user.user_id,
            teacher_code=f"TC{user.user_id:04d}",  # Changed from TE to TC to match error message
            date_of_birth=datetime(2023, 12, 31),
            gender=random.choice(["male", "female", "other"]),
            department=random.choice(["Mathematics", "Physics", "Chemistry", "Biology", "Literature", "History", "Geography", "English"]),
            position=random.choice(["Head Teacher", "Senior Teacher", "Junior Teacher"]),
            specialization=random.choice(["Mathematics", "Physics", "Chemistry", "Biology", "Literature", "History", "Geography", "English"]),
            qualifications=random.choice(["Bachelor's", "Master's", "PhD"]),
            years_of_experience=random.randint(1, 30),
            date_hired=datetime(2023, 12, 31)
        )
        db.add(teacher)
        teachers.append(teacher)
    
    db.commit()
    return teachers

def create_classes(db: Session, teachers):
    print("Creating classes...")
    classes = []
    grades = ["10", "11", "12"]
    sections = ["A", "B", "C", "D", "E"]
    for i in range(1, NUM_CLASSES + 1):
        grade = random.choice(grades)
        section = random.choice(sections)
        teacher = random.choice(teachers)
        
        class_ = Class(
            class_name=f"{grade}{section}",
            class_description=f"Class for grade {grade}",
            academic_year="2024-2025",
            semester="1",
            department=random.choice(["Science", "Literature", "Social Studies"]),
            teacher_id=teacher.teacher_id,
            max_students=random.randint(30, 40),
            current_students=0,
            start_date=datetime(2024, 8, 15),
            end_date=datetime(2025, 5, 31),
            schedule=json.dumps({
                "morning_session": ["07:00-11:30"],
                "afternoon_session": ["13:30-17:00"]
            })
        )
        db.add(class_)
        classes.append(class_)
    
    db.commit()
    return classes

def create_subjects(db: Session):
    print("Creating subjects...")
    subjects = []
    
    # Core subjects
    core_subjects = [
        ("Toán", "Môn học về toán học", 4),
        ("Văn", "Môn học về ngữ văn", 4),
        ("Anh", "Môn học về tiếng Anh", 3),
        ("Lý", "Môn học về vật lý", 3),
        ("Hóa", "Môn học về hóa học", 3),
        ("Sinh", "Môn học về sinh học", 2),
        ("Sử", "Môn học về lịch sử", 2),
        ("Địa", "Môn học về địa lý", 2),
        ("GDCD", "Giáo dục công dân", 1),
        ("Tin", "Môn học về tin học", 2),
    ]
    for name, description, credits in core_subjects:
        subject = Subject(
            subject_name=name,
            subject_description=description,
            credits=credits,
            credits_theory=credits * 0.7,
            credits_practice=credits * 0.3,
            department=random.choice(["Science", "Literature", "Social Studies"]),
            subject_code=name.upper()[:3] + str(random.randint(100, 999))
        )
        db.add(subject)
        subjects.append(subject)
    
    # Additional subjects
    for i in range(len(core_subjects) + 1, NUM_SUBJECTS + 1):
        subject = Subject(
            subject_name=f"Subject {i}",
            subject_description=fake.text(max_nb_chars=200),
            credits=random.randint(1, 4),
            credits_theory=random.uniform(0.5, 2.5),
            credits_practice=random.uniform(0.5, 1.5),
            department=random.choice(["Science", "Literature", "Social Studies"]),
            subject_code=f"SUB{i:03d}"
        )
        db.add(subject)
        subjects.append(subject)
    
    db.commit()
    return subjects

def create_students(db: Session, student_users, classes):
    print("Creating student profiles...")
    students = []
    for i, user in enumerate(student_users):
        # Assign to a class
        class_ = random.choice(classes)
        student = Student(
            user_id=user.user_id,
            student_code=f"ST{user.user_id:04d}",
            date_of_birth=datetime(2023, 12, 31),
            gender=random.choice(["male", "female", "other"]),
            hometown=fake.city(),
            current_address=fake.address(),
            family_income_level=random.choice(["very_low", "low", "medium", "high", "very_high"]),
            family_background=fake.text(max_nb_chars=200),
            scholarship_status=random.choice(["none", "partial", "full"]),
            scholarship_amount=random.uniform(0, 20000000) if random.random() > 0.7 else None,
            health_condition=fake.text(max_nb_chars=100) if random.random() > 0.8 else None,
            mental_health_status=fake.text(max_nb_chars=100) if random.random() > 0.8 else None,
            attendance_rate=random.uniform(70, 100),
            previous_academic_warning=random.randint(0, 3),
            academic_status=random.choices(
                ["good", "warning", "probation", "suspended"],
                weights=[0.7, 0.2, 0.08, 0.02]
            )[0],
            entry_year=2024,
            expected_graduation_year=2027
        )
        db.add(student)
        students.append(student)
    
    db.commit()    # Create class_student relationships
    print("Creating class-student relationships...")
    for student in students:
        class_ = random.choice(classes)  # Randomly assign student to a class
        db.add(ClassStudent(
            class_id=class_.class_id,
            student_id=student.student_id,
            enrollment_date=datetime(2024, 8, 15),
            status="enrolled"
        ))
    
    db.commit()
    return students

def create_class_subjects(db: Session, classes, subjects, teachers):
    print("Creating class-subject relationships...")
    class_subjects = []
    
    for class_ in classes:
        # Each class gets 8-12 subjects
        num_subjects = random.randint(8, 12)
        selected_subjects = random.sample(subjects, num_subjects)
        
        for subject in selected_subjects:
            class_subject = ClassSubject(
                class_id=class_.class_id,
                subject_id=subject.subject_id
            )
            db.add(class_subject)
            class_subjects.append(class_subject)
    
    db.commit()
    return class_subjects

def create_grades(db: Session, students, class_subjects):
    print("Creating student grades...")
    for student in students:
        # Find the student's class through ClassStudent relationship
        student_class = db.query(ClassStudent).filter(ClassStudent.student_id == student.student_id).first()
        if not student_class:
            continue
            
        # Get class_subjects for student's class
        relevant_class_subjects = [cs for cs in class_subjects if cs.class_id == student_class.class_id]
        
        for class_subject in relevant_class_subjects:
            # Create multiple grades per subject
            for semester in ["1", "2"]:
                assignment_score = round(random.uniform(5.0, 10.0), 1)
                midterm_score = round(random.uniform(5.0, 10.0), 1)
                final_score = round(random.uniform(5.0, 10.0), 1)
                
                # Calculate GPA (20% assignment + 30% midterm + 50% final)
                gpa = round(assignment_score * 0.2 + midterm_score * 0.3 + final_score * 0.5, 2)
                
                grade = Grade(
                    student_id=student.student_id,
                    subject_id=class_subject.subject_id,
                    class_id=student_class.class_id,
                    assignment_score=assignment_score,
                    midterm_score=midterm_score,
                    final_score=final_score,
                    gpa=gpa
                )
                db.add(grade)
    
    db.commit()

def create_attendance(db: Session, students, class_subjects):
    print("Creating attendance records...")
    # Generate attendance for the last 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    current_date = start_date
    
    while current_date <= end_date:
        if current_date.weekday() < 5:  # Monday to Friday
            for student in students:
                # Get student's class through ClassStudent relationship
                student_class = db.query(ClassStudent).filter(ClassStudent.student_id == student.student_id).first()
                if not student_class:
                    continue
                
                # 90% chance of being present
                status = random.choices(
                    ["present", "absent", "late"],
                    weights=[0.9, 0.05, 0.05]
                )[0]
                
                attendance = Attendance(
                    student_id=student.student_id,
                    class_id=student_class.class_id,
                    date=current_date,
                    status=status,
                    minutes_late=random.randint(5, 30) if status == "late" else 0,
                    notes=fake.text(max_nb_chars=100) if status != "present" else None
                )
                db.add(attendance)
        
        current_date += timedelta(days=1)
    
    db.commit()

def create_disciplinary_records(db: Session, students):
    print("Creating disciplinary records...")
    # Create records for about 10% of students
    selected_students = random.sample(students, k=int(len(students) * 0.1))
    
    violations = [
        "Vắng học không phép",
        "Gây rối trong lớp học",
        "Không làm bài tập",
        "Vi phạm nội quy lớp học",
        "Dùng điện thoại trong giờ học",
        "Đi học trễ nhiều lần",
        "Nói chuyện nhiều trong lớp",
        "Không mang đồng phục",
        "Không tham gia hoạt động lớp",
        "Không tuân thủ hướng dẫn giáo viên"
    ]
    
    for student in selected_students:
        num_records = random.randint(1, 3)
        for _ in range(num_records):
            record = DisciplinaryRecord(
                student_id=student.student_id,
                violation_description=random.choice(violations),
                violation_date=datetime(2023, 12, 31).date(),
                severity_level=random.choice(["minor", "moderate", "severe"])
            )
            db.add(record)
    
    db.commit()

def create_dropout_risks(db: Session, students):
    print("Creating dropout risk assessments...")
    # Create risk assessment for all students
    for student in students:
        risk = DropoutRisk(
            student_id=student.student_id,
            risk_percentage=round(random.uniform(0, 100), 2),
            risk_factors=json.dumps({
                "attendance": round(random.uniform(0, 100), 2),
                "grades": round(random.uniform(0, 100), 2),
                "behavior": round(random.uniform(0, 100), 2),
                "family_background": round(random.uniform(0, 100), 2)
            }),
            analysis_date=datetime(2023, 12, 31),
        )
        db.add(risk)
    
    db.commit()

def main():
    print("Starting fake data generation...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Create all entities in order
        admin, teacher_users, student_users = create_fake_users(db)
        teachers = create_teachers(db, teacher_users)
        classes = create_classes(db, teachers)
        subjects = create_subjects(db)
        students = create_students(db, student_users, classes)
        class_subjects = create_class_subjects(db, classes, subjects, teachers)
        
        # Create related data
        create_grades(db, students, class_subjects)
        create_attendance(db, students, class_subjects)
        create_disciplinary_records(db, students)
        create_dropout_risks(db, students)
        
        print("Fake data generation completed successfully!")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
