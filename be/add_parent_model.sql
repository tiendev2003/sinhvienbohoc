# filepath: d:\trancongtien\python\sinhvienbohoc\be\add_parent_model.sql
-- Create parents table
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
);

-- Update Student relationship
ALTER TABLE students ADD COLUMN IF NOT EXISTS parents_relationship TEXT;
