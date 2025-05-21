# Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học - Backend

Đây là phần Backend của Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học, được xây dựng bằng Python với FastAPI và MySQL.

## Tính năng

- Quản lý hệ thống xác thực người dùng (JWT)
- Phân quyền người dùng (admin, giáo viên, sinh viên, nhân viên tư vấn, phụ huynh)
- API quản lý thông tin người dùng
- API quản lý thông tin sinh viên
- API quản lý lớp học và môn học
- API quản lý điểm số
- API theo dõi điểm danh và tham gia lớp học
- API quản lý vi phạm kỷ luật
- Hệ thống phân tích và dự báo nguy cơ bỏ học
- API báo cáo và thống kê

## Cài đặt

1. Cài đặt Python (phiên bản 3.9 trở lên)
2. Clone repository này
3. Tạo môi trường ảo (virtual environment):

```bash
cd d:\trancongtien\python\sinhvienbohoc\be
python -m venv venv
venv\Scripts\activate
```

4. Cài đặt các thư viện cần thiết:

```bash
pip install -r requirements.txt
```

5. Tạo cơ sở dữ liệu MySQL:

```sql
CREATE DATABASE IF NOT EXISTS sinhvienbohoc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

6. Cấu hình biến môi trường:

Chỉnh sửa file `.env` để phù hợp với cấu hình cơ sở dữ liệu của bạn.

7. Tạo cấu trúc bảng trong cơ sở dữ liệu:

```bash
alembic upgrade head
```

## Chạy ứng dụng

1. Kích hoạt môi trường ảo:

```bash
cd d:\trancongtien\python\sinhvienbohoc\be
venv\Scripts\activate
```

2. Chạy ứng dụng:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Ứng dụng sẽ chạy trên http://localhost:8000

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Cấu trúc thư mục

- `alembic/`: Chứa các file migration cơ sở dữ liệu
- `app/`: Chứa mã nguồn chính của ứng dụng
  - `api/`: Chứa các endpoint API
    - `v1/`: API v1
  - `core/`: Chứa cấu hình cốt lõi của ứng dụng
  - `crud/`: Chứa các hàm CRUD (Create, Read, Update, Delete)
  - `db/`: Cấu hình cơ sở dữ liệu
  - `models/`: Chứa các model SQLAlchemy
  - `schemas/`: Chứa các schema Pydantic
  - `services/`: Chứa logic nghiệp vụ
  - `utils/`: Chứa các hàm tiện ích

## Phát triển

### Thêm bảng mới

1. Thêm model vào `app/models/models.py`
2. Thêm schema vào `app/schemas/schemas.py`
3. Tạo file CRUD mới trong `app/crud/`
4. Tạo endpoint API mới trong `app/api/v1/`
5. Đăng ký router trong `app/api/v1/api.py`
6. Tạo migration mới:

```bash
alembic revision --autogenerate -m "Add new table"
```

7. Áp dụng migration:

```bash
alembic upgrade head
```

## Dữ liệu giả cho phát triển

Để dễ dàng phát triển và kiểm thử, bạn có thể tạo dữ liệu giả cho hệ thống:

```bash
# Windows
generate_fake_data.bat

# Linux/Mac
chmod +x generate_fake_data.sh
./generate_fake_data.sh
```

Dữ liệu giả sẽ tạo ra:
- Tài khoản người dùng (admin, giáo viên, sinh viên, phụ huynh, và nhân viên tư vấn)
- Thông tin cá nhân của giáo viên và sinh viên
- Lớp học và môn học
- Điểm số sinh viên
- Thông tin điểm danh
- Hồ sơ kỷ luật
- Dữ liệu phân tích nguy cơ bỏ học

### Tài khoản mặc định

| Vai trò | Tên đăng nhập | Mật khẩu |
|---------|--------------|----------|
| Admin   | admin        | admin123 |
| Giáo viên | teacher1     | teacher1 |
| Sinh viên | student1     | student1 |
| Phụ huynh | parent1      | parent1  |
| Nhân viên tư vấn | counselor1  | counselor1 |

## Công nghệ sử dụng

- Python 3.9+
- FastAPI
- SQLAlchemy
- Pydantic
- JWT (JSON Web Tokens)
- MySQL
- Alembic (Database Migrations)
- scikit-learn (Machine Learning)
- Faker (Tạo dữ liệu giả)
