"""
Script to apply the teacher model changes directly to the database
"""
import os
import pymysql
from app.core.config import settings

def apply_teacher_model():
    # Connect to the database
    conn = pymysql.connect(
        host=settings.MYSQL_HOST,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DATABASE,
    )
    
    try:
        with conn.cursor() as cursor:
            print("Creating teachers table...")
            
            # Create teachers table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS teachers (
                    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT UNIQUE,
                    teacher_code VARCHAR(20) NOT NULL UNIQUE,
                    department VARCHAR(100),
                    position VARCHAR(100),
                    specialization VARCHAR(255),
                    qualifications TEXT,
                    date_of_birth DATE,
                    gender ENUM('male', 'female', 'other'),
                    years_of_experience INT,
                    date_hired DATE,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                )
            """)
            
            print("Teacher table created successfully.")
            
            # Check if foreign key exists on classes table
            cursor.execute("""
                SELECT COUNT(*)
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = %s
                AND TABLE_NAME = 'classes'
                AND CONSTRAINT_NAME = 'classes_ibfk_1'
                AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            """, (settings.MYSQL_DATABASE,))
            
            fk_exists = cursor.fetchone()[0] > 0
            
            if fk_exists:
                print("Dropping existing foreign key on classes table...")
                cursor.execute("ALTER TABLE classes DROP FOREIGN KEY classes_ibfk_1")
            
            print("Adding new foreign key to teachers table...")
            
            # Add new foreign key to teachers
            try:
                cursor.execute("""
                    ALTER TABLE classes 
                    ADD CONSTRAINT classes_teachers_fk 
                    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) 
                    ON DELETE SET NULL
                """)
                print("Foreign key added successfully.")
            except pymysql.err.IntegrityError as e:
                print(f"Error adding foreign key: {e}")
                print("Continuing without modifying the classes table.")
            
            conn.commit()
            print("Database schema updated successfully!")
            
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    apply_teacher_model()
