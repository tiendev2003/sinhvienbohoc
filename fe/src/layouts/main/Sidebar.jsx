// Sidebar component

import PropTypes from 'prop-types';
import { NavLink } from 'react-router';

const Sidebar = ({ isOpen }) => {
  // Placeholder user data
  const user = {
    name: 'Nguyễn Văn A',
    role: 'student' // 'admin', 'teacher', 'student', 'counselor', 'parent'
  };

  // Different menu items based on user role
  const getMenuItems = (role) => {
    const commonItems = [
      { path: '/dashboard', label: 'Tổng quan', icon: '📊' }
    ];

    switch (role) {
      case 'admin':
        return [
          ...commonItems,
          { path: '/admin', label: 'Quản trị', icon: '⚙️' },
          { path: '/students', label: 'Sinh viên', icon: '👨‍🎓' },
          { path: '/classes', label: 'Lớp học', icon: '🏫' },
          { path: '/subjects', label: 'Môn học', icon: '📚' },
          { path: '/teachers', label: 'Giáo viên', icon: '👨‍🏫' },
          { path: '/dropout-risk', label: 'Nguy cơ bỏ học', icon: '⚠️' },
          { path: '/reports', label: 'Báo cáo', icon: '📝' }
        ];
      case 'teacher':
        return [
          ...commonItems,
          { path: '/classes', label: 'Lớp học', icon: '🏫' },
          { path: '/students', label: 'Sinh viên', icon: '👨‍🎓' },
          { path: '/attendance', label: 'Điểm danh', icon: '✓' },
          { path: '/grades', label: 'Nhập điểm', icon: '📝' },
          { path: '/dropout-risk', label: 'Nguy cơ bỏ học', icon: '⚠️' }
        ];
      case 'student':
        return [
          ...commonItems,
          { path: '/classes', label: 'Lớp học', icon: '🏫' },
          { path: '/grades', label: 'Điểm số', icon: '📝' },
          { path: '/attendance', label: 'Điểm danh', icon: '✓' },
          { path: '/schedule', label: 'Lịch học', icon: '📅' },
          { path: '/self-assessment', label: 'Tự đánh giá', icon: '📊' }
        ];
      case 'counselor':
        return [
          ...commonItems,
          { path: '/students', label: 'Sinh viên', icon: '👨‍🎓' },
          { path: '/risk-students', label: 'SV nguy cơ cao', icon: '⚠️' },
          { path: '/consultations', label: 'Buổi tư vấn', icon: '💬' },
          { path: '/reports', label: 'Báo cáo', icon: '📝' }
        ];
      case 'parent':
        return [
          ...commonItems,
          { path: '/children', label: 'Con tôi', icon: '👨‍👩‍👧‍👦' },
          { path: '/grades', label: 'Điểm số', icon: '📝' },
          { path: '/attendance', label: 'Điểm danh', icon: '✓' },
          { path: '/teacher-notes', label: 'Nhận xét GV', icon: '💬' }
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems(user.role);

  return (
    <div className={`fixed h-full bg-gray-800 text-white transition-all duration-300 z-10 ${isOpen ? 'w-64' : 'w-0 -left-64'}`}>
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">
          Trường Học
        </h2>
        <p className="text-sm text-gray-400 mt-1">Hệ thống quản lý</p>
      </div>
      
      <nav className="mt-6">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mb-1">
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center py-3 px-4 hover:bg-gray-700
                  ${isActive ? 'bg-blue-600' : ''}
                `}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-400">
              {user.role === 'admin' ? 'Quản trị viên' :
               user.role === 'teacher' ? 'Giáo viên' :
               user.role === 'student' ? 'Sinh viên' :
               user.role === 'counselor' ? 'Nhân viên tư vấn' :
               user.role === 'parent' ? 'Phụ huynh' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

export default Sidebar;
