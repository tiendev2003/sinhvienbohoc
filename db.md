CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Mã hóa mật khẩu (sử dụng bcrypt)
    role ENUM('admin', 'teacher', 'student', 'counselor', 'parent') NOT NULL, -- Thêm vai trò nhân viên tư vấn và phụ huynh
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20), -- Thêm số điện thoại
    profile_picture VARCHAR(255), -- Đường dẫn đến ảnh đại diện
    account_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active', -- Trạng thái tài khoản
    last_login TIMESTAMP NULL, -- Thời gian đăng nhập cuối cùng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE, -- Liên kết với bảng users
    student_code VARCHAR(20) UNIQUE NOT NULL, -- Mã sinh viên
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    hometown VARCHAR(100),
    current_address VARCHAR(255), -- Địa chỉ hiện tại
    family_income_level ENUM('very_low', 'low', 'medium', 'high', 'very_high'), -- Chi tiết hơn về hoàn cảnh kinh tế
    family_background TEXT, -- Thông tin về hoàn cảnh gia đình
    scholarship_status ENUM('none', 'partial', 'full'), -- Tình trạng học bổng
    scholarship_amount DECIMAL(10,2), -- Số tiền học bổng (nếu có)
    health_condition TEXT, -- Tình trạng sức khỏe
    mental_health_status TEXT, -- Tình trạng tâm lý
    attendance_rate FLOAT DEFAULT 100.0, -- Tỷ lệ điểm danh (%)
    previous_academic_warning INT DEFAULT 0, -- Số lần cảnh báo học vụ
    academic_status ENUM('good', 'warning', 'probation', 'suspended') DEFAULT 'good', -- Tình trạng học tập hiện tại
    entry_year INT, -- Năm nhập học
    expected_graduation_year INT, -- Năm dự kiến tốt nghiệp
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE classes (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(50) NOT NULL, -- Ví dụ: CNTT01
    class_description TEXT, -- Mô tả về lớp học
    academic_year VARCHAR(10) NOT NULL, -- Ví dụ: 2024-2025
    semester ENUM('1', '2', 'summer') NOT NULL, -- Học kỳ
    department VARCHAR(100), -- Khoa/Bộ môn
    start_date DATE, -- Ngày bắt đầu
    end_date DATE, -- Ngày kết thúc
    schedule JSON, -- Lịch học (dưới dạng JSON)
    teacher_id INT, -- Giáo viên chủ nhiệm
    max_students INT, -- Số lượng sinh viên tối đa
    current_students INT DEFAULT 0, -- Số lượng sinh viên hiện tại
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE subjects (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    subject_code VARCHAR(20) UNIQUE NOT NULL, -- Mã môn học
    subject_name VARCHAR(100) NOT NULL, -- Ví dụ: Toán cao cấp
    subject_description TEXT, -- Mô tả chi tiết về môn học
    department VARCHAR(100), -- Khoa/Bộ môn phụ trách
    credits INT NOT NULL, -- Số tín chỉ
    credits_theory FLOAT, -- Số tín chỉ lý thuyết
    credits_practice FLOAT, -- Số tín chỉ thực hành
    prerequisite_subjects VARCHAR(255), -- Các môn tiên quyết
    syllabus_link VARCHAR(255) -- Liên kết đến đề cương môn học
);

CREATE TABLE class_students (
    class_id INT,
    student_id INT,
    enrollment_date DATE DEFAULT CURRENT_DATE, -- Ngày đăng ký
    status ENUM('enrolled', 'dropped', 'completed') DEFAULT 'enrolled', -- Trạng thái tham gia
    PRIMARY KEY (class_id, student_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE grades (
    grade_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    subject_id INT,
    class_id INT,
    assignment_score FLOAT, -- Điểm bài tập
    midterm_score FLOAT, -- Điểm giữa kỳ
    final_score FLOAT, -- Điểm cuối kỳ
    gpa FLOAT, -- Điểm trung bình môn (tính tự động)
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE
);

CREATE TABLE disciplinary_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    violation_description TEXT,
    violation_date DATE NOT NULL,
    severity_level ENUM('minor', 'moderate', 'severe') NOT NULL, -- Mức độ nghiêm trọng của vi phạm
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE dropout_risks (
    risk_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    risk_percentage FLOAT NOT NULL, -- Xác suất bỏ học (0-100%)
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_factors JSON, -- Lưu các yếu tố nguy cơ (ví dụ: {"low_gpa": true, "high_absence": true})
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

