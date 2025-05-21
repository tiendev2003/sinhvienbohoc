import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router';

// Header component
const Header = ({ toggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Placeholder user data until we have auth context
  const user = {
    name: 'Nguyễn Văn A',
    avatar: null, // We would use an actual avatar path here
    role: 'Sinh viên'
  };
  
  // Placeholder notifications
  const notifications = [
    { id: 1, text: 'Bạn có điểm thấp trong môn Toán cao cấp', time: '5 phút trước', unread: true },
    { id: 2, text: 'Đã cập nhật điểm danh hôm nay', time: '1 giờ trước', unread: false },
    { id: 3, text: 'Nhắc nhở: Nộp bài tập vào ngày mai', time: '3 giờ trước', unread: false }
  ];

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Left side: Logo and toggle */}
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar} 
              className="mr-4 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              ☰
            </button>
            <Link to="/" className="text-xl font-bold text-blue-600">
              Trường Học
            </Link>
          </div>

          {/* Right side: Search, notifications, and user profile */}
          <div className="flex items-center space-x-4">
            {/* Search box */}
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="py-1 px-3 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className="text-gray-600 hover:text-gray-900 focus:outline-none relative"
              >
                🔔
                {notifications.some(n => n.unread) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
                  <div className="py-2 px-3 border-b">
                    <h3 className="text-sm font-medium">Thông báo</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <ul>
                        {notifications.map(notification => (
                          <li 
                            key={notification.id} 
                            className={`py-2 px-3 hover:bg-gray-100 border-b border-gray-100 ${notification.unread ? 'bg-blue-50' : ''}`}
                          >
                            <div className="text-sm">{notification.text}</div>
                            <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-4 text-center text-gray-500 text-sm">
                        Không có thông báo mới
                      </div>
                    )}
                  </div>
                  <div className="py-2 px-3 text-center border-t text-xs text-blue-600">
                    <Link to="/notifications">Xem tất cả thông báo</Link>
                  </div>
                </div>
              )}
            </div>

            {/* User profile */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <span className="hidden md:inline-block text-sm">{user.name}</span>
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <div className="py-2 px-3 border-b">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <ul>
                    <li>
                      <Link to="/profile" className="block py-2 px-3 text-sm hover:bg-gray-100">
                        Hồ sơ cá nhân
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="block py-2 px-3 text-sm hover:bg-gray-100">
                        Cài đặt
                      </Link>
                    </li>
                    <li className="border-t">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left py-2 px-3 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired
};

export default Header;
