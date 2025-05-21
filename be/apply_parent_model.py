"""
Script to apply the parent model changes directly to the database
"""
import os
import pymysql
from app.core.config import settings

def apply_parent_model():
    # Connect to the database
    conn = pymysql.connect(
        host=settings.MYSQL_HOST,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DATABASE,
    )
    
    try:
        with conn.cursor() as cursor:
            print("Creating parents table...")
            
            # Create parents table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS parents (
                    parent_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT UNIQUE,
                    student_id INT NOT NULL,
                    relationship ENUM('father', 'mother', 'guardian', 'other') NOT NULL,
                    occupation VARCHAR(100),
                    education_level ENUM('primary', 'secondary', 'high_school', 'college', 'university', 'post_graduate', 'none'),
                    income DECIMAL(10,2),
                    phone_secondary VARCHAR(20),
                    address VARCHAR(255),
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
                )
            """)
            
            print("Parent table created successfully.")
            
            # Check if parents_relationship column exists in students table
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = %s
                AND TABLE_NAME = 'students'
                AND COLUMN_NAME = 'parents_relationship'
            """, (settings.MYSQL_DATABASE,))
            
            column_exists = cursor.fetchone()[0] > 0
            
            if not column_exists:
                print("Adding parents_relationship column to students table...")
                cursor.execute("ALTER TABLE students ADD COLUMN parents_relationship TEXT")
                print("Column added successfully.")
            
            conn.commit()
            print("Database schema updated successfully!")
            
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    apply_parent_model()
