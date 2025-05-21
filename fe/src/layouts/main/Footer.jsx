// Footer component
import { Link } from 'react-router';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học</h3>
            <p className="text-gray-300">
              Hệ thống giúp các tổ chức giáo dục xác định và hỗ trợ sinh viên có nguy cơ bỏ học thông qua phân tích dữ liệu và học máy.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-gray-300 hover:text-white">Trang chủ</Link></li>
              <li><Link to="/students" className="text-gray-300 hover:text-white">Sinh viên</Link></li>
              <li><Link to="/classes" className="text-gray-300 hover:text-white">Lớp học</Link></li>
              <li><Link to="/subjects" className="text-gray-300 hover:text-white">Môn học</Link></li>
              <li><Link to="/dropout-risk" className="text-gray-300 hover:text-white">Phân tích nguy cơ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <address className="not-italic text-gray-300">
              <p>Số 1 Đại Cồ Việt, Hai Bà Trưng</p>
              <p>Hà Nội, Việt Nam</p>
              <p className="mt-2">Email: contact@truonghoc.edu.vn</p>
              <p>Điện thoại: (024) 3869 4242</p>
            </address>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {currentYear} Trường Học Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
