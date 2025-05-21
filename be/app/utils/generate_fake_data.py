import os
import sys
import random
from datetime import datetime, timedelta
from decimal import Decimal
import json

# Add the project root to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models.models import (
    User, Teacher, Student, Parent, Class, Subject, 
    ClassStudent, Grade, DisciplinaryRecord, DropoutRisk
)
from app.models.attendance import Attendance
from app.db.database import engine, Base, SessionLocal
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from faker import Faker

# Initialize faker
# 'vi_VN' locale không được hỗ trợ, sử dụng locale mặc định
fake = Faker('en_US')  # Sử dụng locale tiếng Anh mặc định
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Constants
NUM_USERS = 100
NUM_TEACHERS = 20
NUM_STUDENTS = 70
NUM_PARENTS = 70  # One parent per student
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
    
    # Teachers
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
    
    # Students
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
    
    # Parents
    for i in range(1, NUM_PARENTS + 1):
        gender = random.choice(['male', 'female'])
        first_name = fake.first_name_male() if gender == 'male' else fake.first_name_female()
        last_name = fake.last_name()
        username = f"parent{i}"
        
        parent_user = User(
            username=username,
            password_hash=get_password_hash(f"parent{i}"),
            role="parent",
            full_name=f"{first_name} {last_name}",
            email=f"{username}@example.com",
            phone=fake.phone_number(),
            profile_picture=f"/profiles/parents/{i}.jpg" if random.random() > 0.5 else None,
            account_status="active",
         )
        db.add(parent_user)
        users.append(parent_user)
    
    # Counselors
    for i in range(1, 6):
        gender = random.choice(['male', 'female'])
        first_name = fake.first_name_male() if gender == 'male' else fake.first_name_female()
        last_name = fake.last_name()
        username = f"counselor{i}"
        
        counselor_user = User(
            username=username,
            password_hash=get_password_hash(f"counselor{i}"),
            role="counselor",
            full_name=f"{first_name} {last_name}",
            email=f"{username}@example.com",
            phone=fake.phone_number(),
            profile_picture=f"/profiles/counselors/{i}.jpg" if random.random() > 0.3 else None,
            account_status="active",
         )
        db.add(counselor_user)
        users.append(counselor_user)
    
    db.commit()
    return users

def create_fake_teachers(db: Session):
    print("Creating fake teachers...")
    teachers = []
    
    # Get all users with teacher role
    teacher_users = db.query(User).filter_by(role="teacher").all()
    
    departments = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", 
                  "Engineering", "Literature", "History", "Foreign Languages", "Economics"]
    
    positions = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Teaching Assistant"]
    
    specializations = ["Artificial Intelligence", "Database Systems", "Software Engineering", 
                      "Networks", "Algorithms", "Calculus", "Algebra", "Statistics", 
                      "Quantum Physics", "Organic Chemistry", "Genetics", "Economics Theory"]
    
    for i, user in enumerate(teacher_users):
        # Use fixed datetime objects instead of random date ranges
        # Calculate a birthdate between 43 and 36 years ago (replacing 25-18 years calculation)
        birth_year = datetime.now().year - random.randint(36, 43)
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)  # Using 28 to be safe for all months
        date_of_birth = datetime(birth_year, birth_month, birth_day)
        
        years_exp = random.randint(1, 30)
        
        # Calculate hire date around 22 years after birth (using fixed date calculation)
        hire_year = birth_year + 22 + random.randint(0, 5)  # Between 22-27 years after birth
        hire_month = random.randint(1, 12)
        hire_day = random.randint(1, 28)
        hire_date = datetime(hire_year, hire_month, hire_day)
        
        # Ensure hire date is not in the future
        current_date = datetime.now()
        if hire_date > current_date:
            hire_date = datetime(current_date.year - random.randint(1, 5), 
                                hire_month, 
                                hire_day)
        
        teacher = Teacher(
            user_id=user.user_id,
            teacher_code=f"TCH{1000 + i}",
            department=random.choice(departments),
            position=random.choice(positions),
            specialization=random.choice(specializations),
            qualifications=fake.paragraph(nb_sentences=3),
            date_of_birth=date_of_birth,
            gender=random.choice(['male', 'female', 'other']),
            years_of_experience=years_exp,
            date_hired=hire_date
        )
        db.add(teacher)
        teachers.append(teacher)
    
    db.commit()
    return teachers

def create_fake_students(db: Session):
    print("Creating fake students...")
    students = []
    
    # Get all users with student role
    student_users = db.query(User).filter_by(role="student").all()
    for i, user in enumerate(student_users):
 
        date_of_birth = datetime(2023, 12, 31)
        entry_year = random.randint(2017, 2025)
        expected_graduation = entry_year + random.choice([3, 4, 5])
        
        student = Student(
            user_id=user.user_id,
            student_code=f"SV{100000 + i}",
            date_of_birth=date_of_birth,
            gender=random.choice(['male', 'female', 'other']),
            hometown=fake.city(),
            current_address=fake.address(),
            family_income_level=random.choice(['very_low', 'low', 'medium', 'high', 'very_high']),
            family_background=fake.paragraph(nb_sentences=2),
            scholarship_status=random.choices(['none', 'partial', 'full'], weights=[0.7, 0.2, 0.1])[0],
            scholarship_amount=None,
            health_condition=fake.paragraph(nb_sentences=1) if random.random() > 0.8 else None,
            mental_health_status=fake.paragraph(nb_sentences=1) if random.random() > 0.85 else None,
            attendance_rate=round(random.uniform(75.0, 100.0), 2),
            previous_academic_warning=random.choices([0, 1, 2], weights=[0.85, 0.1, 0.05])[0],
            academic_status=random.choices(['good', 'warning', 'probation', 'suspended'], weights=[0.8, 0.1, 0.07, 0.03])[0],
            entry_year=entry_year,
            expected_graduation_year=expected_graduation
        )
        
        # Set scholarship amount if status is not none
        if student.scholarship_status != 'none':
            student.scholarship_amount = Decimal(str(round(random.uniform(1000000, 15000000), 2)))
            
        db.add(student)
        students.append(student)
    
    db.commit()
    return students

def create_fake_parents(db: Session):
    print("Creating fake parents...")
    parents = []
    
    # Get all users with parent role and all students
    parent_users = db.query(User).filter_by(role="parent").all()
    students = db.query(Student).all()
    
    # Ensure we don't exceed the number of parent_users
    num_to_create = min(len(parent_users), len(students))
    
    education_levels = ['primary', 'secondary', 'high_school', 'college', 'university', 'post_graduate', 'none']
    occupations = ["Doctor", "Teacher", "Engineer", "Farmer", "Worker", "Business Owner", 
                   "Government Employee", "Sales", "IT Specialist", "Accountant", "Retired", "Unemployed"]
    
    for i in range(num_to_create):
        relation = random.choice(['father', 'mother', 'guardian', 'other'])
        
        parent = Parent(
            user_id=parent_users[i].user_id,
            student_id=students[i].student_id,
            relation_to_student=relation,
            occupation=random.choice(occupations),
            education_level=random.choice(education_levels),
            income=Decimal(str(round(random.uniform(5000000, 50000000), 2))),
            phone_secondary=fake.phone_number() if random.random() > 0.5 else None,
            address=fake.address() if random.random() > 0.3 else None
        )
        db.add(parent)
        parents.append(parent)
    
    db.commit()
    return parents

def create_fake_subjects(db: Session):
    print("Creating fake subjects...")
    subjects = []
    
    subject_data = [
        ("CS101", "Introduction to Programming", "Computer Science", 3),
        ("CS201", "Data Structures", "Computer Science", 4),
        ("CS301", "Algorithms", "Computer Science", 4),
        ("CS401", "Database Systems", "Computer Science", 3),
        ("CS402", "Software Engineering", "Computer Science", 4),
        ("CS403", "Computer Networks", "Computer Science", 3),
        ("CS404", "Operating Systems", "Computer Science", 4),
        ("CS405", "Artificial Intelligence", "Computer Science", 3),
        ("MATH101", "Calculus I", "Mathematics", 4),
        ("MATH201", "Calculus II", "Mathematics", 4),
        ("MATH301", "Linear Algebra", "Mathematics", 3),
        ("MATH401", "Probability and Statistics", "Mathematics", 3),
        ("PHYS101", "Physics I", "Physics", 4),
        ("PHYS201", "Physics II", "Physics", 4),
        ("PHYS301", "Modern Physics", "Physics", 3),
        ("CHEM101", "General Chemistry", "Chemistry", 4),
        ("CHEM201", "Organic Chemistry", "Chemistry", 4),
        ("BIO101", "General Biology", "Biology", 3),
        ("BIO201", "Cell Biology", "Biology", 4),
        ("ENG101", "English Composition", "English", 3),
        ("ENG201", "Technical Writing", "English", 3),
        ("ECON101", "Principles of Economics", "Economics", 3),
        ("ECON201", "Microeconomics", "Economics", 3),
        ("ECON301", "Macroeconomics", "Economics", 3),
        ("HIST101", "World History", "History", 3),
        ("HIST201", "Vietnamese History", "History", 3),
        ("SOC101", "Introduction to Sociology", "Sociology", 3),
        ("PSY101", "Introduction to Psychology", "Psychology", 3),
        ("ART101", "Art Appreciation", "Arts", 2),
        ("MUS101", "Music Appreciation", "Arts", 2)
    ]
    
    for i, (code, name, department, credits) in enumerate(subject_data):
        credits_theory = round(credits * 0.6, 1)
        credits_practice = round(credits * 0.4, 1)
        
        subject = Subject(
            subject_code=code,
            subject_name=name,
            subject_description=fake.paragraph(nb_sentences=3),
            department=department,
            credits=credits,
            credits_theory=credits_theory,
            credits_practice=credits_practice,
            prerequisite_subjects=None,
            syllabus_link=f"/syllabi/{code}.pdf" if random.random() > 0.3 else None
        )
        db.add(subject)
        subjects.append(subject)
    
    # Set prerequisites for some subjects
    subjects[1].prerequisite_subjects = "CS101"  # Data Structures requires Intro to Programming
    subjects[2].prerequisite_subjects = "CS201"  # Algorithms requires Data Structures
    subjects[3].prerequisite_subjects = "CS201"  # Database Systems requires Data Structures
    subjects[9].prerequisite_subjects = "MATH101"  # Calc II requires Calc I
    subjects[13].prerequisite_subjects = "PHYS101"  # Physics II requires Physics I
    subjects[16].prerequisite_subjects = "CHEM101"  # Organic Chemistry requires General Chemistry
    
    db.commit()
    return subjects

def create_fake_classes(db: Session):
    print("Creating fake classes...")
    classes = []
    
    # Get teachers and subjects
    teachers = db.query(Teacher).all()
    subjects = db.query(Subject).all()
    
    academic_years = ["2023-2024", "2024-2025"]
    semesters = ["1", "2", "summer"]
    
    # Generate classes
    for i in range(NUM_CLASSES):
        academic_year = random.choice(academic_years)
        semester = random.choice(semesters)
        subject = random.choice(subjects)
        teacher = random.choice(teachers)
        
        # Set dates based on academic year and semester
        if academic_year == "2023-2024":
            if semester == "1":
                start_date = datetime(2023, 9, 1)
                end_date = datetime(2023, 12, 31)
            elif semester == "2":
                start_date = datetime(2024, 1, 15)
                end_date = datetime(2024, 5, 15)
            else:  # summer
                start_date = datetime(2024, 6, 1)
                end_date = datetime(2024, 8, 15)
        else:  # 2024-2025
            if semester == "1":
                start_date = datetime(2024, 9, 1)
                end_date = datetime(2024, 12, 31)
            elif semester == "2":
                start_date = datetime(2025, 1, 15)
                end_date = datetime(2025, 5, 15)
            else:  # summer
                start_date = datetime(2025, 6, 1)
                end_date = datetime(2025, 8, 15)
        
        # Generate schedule - example format: [{"day": "Monday", "start_time": "08:00", "end_time": "10:00", "room": "A101"}]
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        class_day = random.choice(days)
        hours = [8, 9, 10, 13, 14, 15, 16]
        start_hour = random.choice(hours)
        room = f"{random.choice(['A', 'B', 'C', 'D'])}{random.randint(100, 399)}"
        
        schedule = [{
            "day": class_day,
            "start_time": f"{start_hour:02d}:00",
            "end_time": f"{start_hour+2:02d}:00",
            "room": room
        }]
        
        # Some classes have two sessions per week
        if random.random() > 0.5:
            remaining_days = [d for d in days if d != class_day]
            second_day = random.choice(remaining_days)
            second_start_hour = random.choice(hours)
            second_room = f"{random.choice(['A', 'B', 'C', 'D'])}{random.randint(100, 399)}"
            
            schedule.append({
                "day": second_day,
                "start_time": f"{second_start_hour:02d}:00",
                "end_time": f"{second_start_hour+2:02d}:00",
                "room": second_room
            })
        
        max_students = random.randint(30, 60)
        
        class_obj = Class(
            class_name=f"{subject.subject_code} - {academic_year} - {semester}",
            class_description=f"{subject.subject_name} - {academic_year} - Semester {semester}",
            academic_year=academic_year,
            semester=semester,
            department=subject.department,
            start_date=start_date,
            end_date=end_date,
            schedule=json.dumps(schedule),
            teacher_id=teacher.teacher_id,
            max_students=max_students,
            current_students=0  # Will update later after adding students
        )
        db.add(class_obj)
        classes.append(class_obj)
    
    db.commit()
    return classes

def assign_students_to_classes(db: Session):
    print("Assigning students to classes...")
    
    students = db.query(Student).all()
    classes = db.query(Class).all()
    
    # For each student, assign to 3-6 classes
    for student in students:
        num_classes = random.randint(3, 6)
        selected_classes = random.sample(classes, num_classes)
        
        for class_obj in selected_classes:
            # Determine enrollment status based on class dates
            current_date = datetime.now().date()
            
            # Fix: Check if end_date is a datetime object before calling date()
            if class_obj.end_date:
                end_date = class_obj.end_date.date() if isinstance(class_obj.end_date, datetime) else class_obj.end_date
                if end_date < current_date:
                    status = 'completed'
                else:
                    status = 'enrolled'
            elif class_obj.start_date:
                start_date = class_obj.start_date.date() if isinstance(class_obj.start_date, datetime) else class_obj.start_date
                if start_date > current_date:
                    status = 'enrolled'
                else:
                    status = 'enrolled'
            else:
                status = 'enrolled'
                
            # Randomly set some to dropped
            if random.random() < 0.05:  # 5% chance to be dropped
                status = 'dropped'
              
            # Create enrollment date using actual datetime objects
            start_enroll_date = class_obj.start_date - timedelta(days=30) if class_obj.start_date else datetime(2023, 8, 1)
            end_enroll_date = class_obj.start_date if class_obj.start_date else datetime(2023, 9, 1)
            
            class_student = ClassStudent(
                class_id=class_obj.class_id,
                student_id=student.student_id,
                enrollment_date= datetime(2023, 12, 31),
                status=status
            )
            db.add(class_student)
            
            # Update current_students count if enrolled or completed
            if status != 'dropped':
                class_obj.current_students += 1
    
    db.commit()

def create_fake_grades(db: Session):
    print("Creating fake grades...")
    
    # Get all class-student relationships
    class_students = db.query(ClassStudent).all()
    
    # Get subjects for each class
    class_subjects = {}
    for class_obj in db.query(Class).all():
        # Extract subject code from class name (format: "CS101 - 2023-2024 - 1")
        subject_code = class_obj.class_name.split(" - ")[0]
        subject = db.query(Subject).filter(Subject.subject_code == subject_code).first()
        if subject:
            class_subjects[class_obj.class_id] = subject.subject_id
    
    # Create grades for each class-student
    for cs in class_students:
        # Skip if the student dropped the class
        if cs.status == 'dropped':
            continue
            
        # Get the subject ID for this class
        if cs.class_id not in class_subjects:
            continue
            
        subject_id = class_subjects[cs.class_id]
        
        # Generate random scores
        if cs.status == 'completed':
            # For completed classes, generate all scores
            assignment_score = round(random.uniform(5.0, 10.0), 1)
            midterm_score = round(random.uniform(4.0, 10.0), 1)
            final_score = round(random.uniform(4.0, 10.0), 1)
            
            # Calculate GPA (weighted average: 20% assignment, 30% midterm, 50% final)
            gpa = round(0.2 * assignment_score + 0.3 * midterm_score + 0.5 * final_score, 2)
        else:
            # For enrolled classes, maybe have some scores but not final
            assignment_score = round(random.uniform(5.0, 10.0), 1) if random.random() > 0.3 else None
            midterm_score = round(random.uniform(4.0, 10.0), 1) if random.random() > 0.5 else None
            final_score = None  # Not completed yet
            gpa = None  # Can't calculate yet
            
        grade = Grade(
            student_id=cs.student_id,
            subject_id=subject_id,
            class_id=cs.class_id,
            assignment_score=assignment_score,
            midterm_score=midterm_score,
            final_score=final_score,
            gpa=gpa
        )
        db.add(grade)
    
    db.commit()

def create_fake_disciplinary_records(db: Session):
    print("Creating fake disciplinary records...")
    
    students = db.query(Student).all()
    
    violations = [
        "Late to class multiple times",
        "Disrupting class",
        "Inappropriate behavior",
        "Cheating on exam",
        "Plagiarism",
        "Damaging school property",
        "Fighting with other students",
        "Using mobile phone during exams",
        "Unauthorized absence",
        "Disobeying teacher instructions"
    ]
    
    # Only a subset of students will have disciplinary records
    selected_students = random.sample(students, int(len(students) * 0.25))  # 25% of students
    
    for student in selected_students:
        # Some students might have multiple records
        num_records = random.choices([1, 2, 3], weights=[0.7, 0.2, 0.1])[0]
        
        for _ in range(num_records):
            severity = random.choices(['minor', 'moderate', 'severe'], weights=[0.6, 0.3, 0.1])[0]
            
            record = DisciplinaryRecord(
                student_id=student.student_id,
                violation_description=random.choice(violations),
                violation_date= datetime(2023, 12, 31),
                severity_level=severity
            )
            db.add(record)
    
    db.commit()

def create_fake_dropout_risks(db: Session):
    print("Creating fake dropout risk assessments...")
    
    students = db.query(Student).all()
    
    # Calculate risk factors and percentage for each student
    for student in students:
        # Check factors that might increase dropout risk
        risk_factors = {}
        total_risk_score = 0
        
        # Academic performance (from grades)
        grades = db.query(Grade).filter_by(student_id=student.student_id).all()
        if grades:
            avg_gpa = sum(g.gpa for g in grades if g.gpa is not None) / len([g for g in grades if g.gpa is not None]) if any(g.gpa is not None for g in grades) else None
            
            if avg_gpa is not None:
                risk_factors["academic_performance"] = avg_gpa
                if avg_gpa < 5.0:
                    total_risk_score += 30
                elif avg_gpa < 6.5:
                    total_risk_score += 15
            
        # Attendance rate
        risk_factors["attendance"] = student.attendance_rate
        if student.attendance_rate < 80:
            total_risk_score += 25
        elif student.attendance_rate < 90:
            total_risk_score += 10
            
        # Disciplinary records
        disciplinary_records = db.query(DisciplinaryRecord).filter_by(student_id=student.student_id).all()
        risk_factors["disciplinary_records"] = len(disciplinary_records)
        
        # Count by severity
        severe_count = len([r for r in disciplinary_records if r.severity_level == 'severe'])
        moderate_count = len([r for r in disciplinary_records if r.severity_level == 'moderate'])
        
        total_risk_score += severe_count * 15 + moderate_count * 5
            
        # Family income level
        risk_factors["family_income"] = student.family_income_level
        if student.family_income_level in ['very_low', 'low']:
            total_risk_score += 10
            
        # Previous academic warnings
        risk_factors["previous_warnings"] = student.previous_academic_warning
        total_risk_score += student.previous_academic_warning * 10
            
        # Cap the risk percentage at 95%
        risk_percentage = min(total_risk_score, 95)
        
        # For students with 'good' academic status, cap at 40%
        if student.academic_status == 'good' and risk_percentage > 40:
            risk_percentage = random.randint(20, 40)
            
        # For students with 'warning' or worse, ensure minimum risk
        if student.academic_status == 'warning' and risk_percentage < 45:
            risk_percentage = random.randint(45, 60)
        elif student.academic_status == 'probation' and risk_percentage < 65:
            risk_percentage = random.randint(65, 80)
        elif student.academic_status == 'suspended' and risk_percentage < 80:
            risk_percentage = random.randint(80, 95)
        dropout_risk = DropoutRisk(
            student_id=student.student_id,
            risk_percentage=float(risk_percentage),
            analysis_date=datetime(2023, 12, 31),
            risk_factors=json.dumps(risk_factors)
        )
        db.add(dropout_risk)
    
    db.commit()

def create_fake_attendance(db: Session):
    print("Creating fake attendance records...")
    
    # Get class-student relationships for enrolled or completed classes
    class_students = db.query(ClassStudent).filter(ClassStudent.status != 'dropped').all()
    
    # For each class-student relationship, create attendance records
    for cs in class_students:
        # Get class details to determine dates
        class_obj = db.query(Class).filter_by(class_id=cs.class_id).first()
        
        if not class_obj or not class_obj.start_date or not class_obj.end_date:
            continue
            
        # Get class schedule
        schedule = json.loads(class_obj.schedule) if class_obj.schedule else []
        if not schedule:
            continue
            
        # Generate class dates based on schedule and class period
        class_dates = []
        current_date = class_obj.start_date
        
        # Convert weekday names to numbers (0 = Monday, 6 = Sunday)
        weekday_map = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6}
        
        while current_date <= class_obj.end_date:
            for session in schedule:
                day_of_week = weekday_map.get(session["day"])
                if day_of_week is not None and current_date.weekday() == day_of_week:
                    class_dates.append(current_date)
            
            current_date += timedelta(days=1)
            
        # Create attendance records for each class date
        for class_date in class_dates:
            # Skip future dates

                
            # Determine attendance status based on student's attendance rate
            student = db.query(Student).filter_by(student_id=cs.student_id).first()
            attendance_rate = student.attendance_rate if student else 90.0
            
            # Higher chance of being present based on attendance rate
            is_present = random.random() * 100 < attendance_rate
            
            status = "present" if is_present else random.choice(["absent", "excused", "late"])
            
            # For some absent students, add a reason
            reason = None
            if status in ["absent", "excused"]:
                if random.random() > 0.7:  # 30% chance to have a reason
                    reasons = ["Sick", "Family emergency", "Transportation issue", "Personal matter", 
                              "Medical appointment", "Weather conditions"]
                    reason = random.choice(reasons)
            
            attendance = Attendance(
                student_id=cs.student_id,
                class_id=cs.class_id,
                date=class_date,
                status=status,
                minutes_late=random.randint(5, 30) if status == "late" else None,
                notes=reason  # Use notes instead of reason
            )
            db.add(attendance)
    
    # Commit in smaller batches to avoid memory issues
    db.commit()

def initialize_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Create a new session
    db = SessionLocal()
    
    try:
        # Generate fake data
        create_fake_users(db)
        create_fake_teachers(db)
        create_fake_students(db)
        create_fake_parents(db)
        create_fake_subjects(db)
        create_fake_classes(db)
        assign_students_to_classes(db)
        create_fake_grades(db)
        create_fake_disciplinary_records(db)
        create_fake_dropout_risks(db)
        create_fake_attendance(db)
        
        print("Fake data generation completed!")
    except Exception as e:
        print(f"Error generating fake data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    initialize_database()
