# filepath: d:\trancongtien\python\sinhvienbohoc\be\add_teacher_model.sql
-- Create teachers table
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
);

-- Update classes table to reference teachers instead of users
-- First, we need to temporarily remove any existing foreign key
ALTER TABLE classes DROP FOREIGN KEY IF EXISTS classes_ibfk_1;

-- Create the new foreign key
ALTER TABLE classes ADD CONSTRAINT classes_teachers_fk 
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE SET NULL;
