@echo off
:: Script để khởi chạy backend server
echo Đang khởi động Backend server cho Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học...

:: Kiểm tra xem môi trường ảo đã được kích hoạt chưa
if not exist venv (
    echo Tạo môi trường ảo Python...
    python -m venv venv
)

:: Kích hoạt môi trường ảo
call venv\Scripts\activate

:: Cài đặt các thư viện cần thiết
echo Cài đặt các thư viện...
pip install -r requirements.txt

:: Áp dụng migrations
echo Áp dụng migrations...
alembic upgrade head

:: Khởi tạo dữ liệu mặc định
echo Khởi tạo dữ liệu mặc định...
python init_db.py

:: Khởi động server
echo Khởi động server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
