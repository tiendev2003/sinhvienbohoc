import sys
import os
from datetime import datetime
import traceback
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.database import Base
from app.models.models import User
# Import the Attendance model explicitly
from app.models.attendance import Attendance
# Make sure all models are loaded
import app.models.models

def init_db():
    try:
        # Kiểm tra kết nối tới database
        print(f"Đang kết nối tới database: {settings.DATABASE_URL}")
        engine = create_engine(settings.DATABASE_URL, echo=True)
        
        # Kiểm tra xem database có tồn tại không
        inspector = inspect(engine)
        print(f"Kết nối thành công tới database.")
        
        # Tạo session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Tạo tất cả bảng (nếu chưa có)
        print("Đang tạo các bảng...")
        Base.metadata.create_all(bind=engine)
        print("Tạo bảng thành công.")
        
        db = SessionLocal()
    except SQLAlchemyError as e:
        print(f"Lỗi kết nối database: {str(e)}")
        traceback.print_exc()
        sys.exit(1)
    # Kiểm tra xem đã có admin user chưa
    admin_user = db.query(User).filter(User.username == "admin").first()
    
    if not admin_user:
        # Tạo admin user mặc định
        admin_password = get_password_hash("Admin@123")
        admin = User(
            username="admin",
            password_hash=admin_password,
            full_name="Administrator",
            email="admin@example.com",
            role="admin",
            account_status="active",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(admin)
        db.commit()
        print("Đã tạo tài khoản admin mặc định:")
        print("  Username: admin")
        print("  Password: Admin@123")
    else:
        print("Tài khoản admin đã tồn tại.")
    
    # Đóng session
    db.close()

if __name__ == "__main__":
    print("Đang khởi tạo cơ sở dữ liệu...")
    init_db()
    print("Khởi tạo cơ sở dữ liệu hoàn tất!")
