#!/bin/bash
# Script để khởi chạy backend server (Linux/MacOS)
echo "Đang khởi động Backend server cho Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học..."

# Kiểm tra xem môi trường ảo đã được kích hoạt chưa
if [ ! -d "venv" ]; then
    echo "Tạo môi trường ảo Python..."
    python3 -m venv venv
fi

# Kích hoạt môi trường ảo
source venv/bin/activate

# Cài đặt các thư viện cần thiết
echo "Cài đặt các thư viện..."
pip install -r requirements.txt

# Áp dụng migrations
echo "Áp dụng migrations..."
alembic -c alembic.ini upgrade head

# Khởi tạo dữ liệu mặc định
echo "Khởi tạo dữ liệu mặc định..."
python init_db.py

# Khởi động server
echo "Khởi động server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
