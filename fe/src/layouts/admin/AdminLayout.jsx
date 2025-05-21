// Admin layout
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Placeholder user object until auth context is fully implemented
  const user = { name: 'Admin User' };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // For testing without auth context
    console.log('Logging out...');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Quản lý người dùng', icon: 'users' },
    { path: '/admin/risk-analytics', label: 'Phân tích nguy cơ', icon: 'chart-bar' },
    { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: 'document-report' },
    { path: '/admin/settings', label: 'Cài đặt hệ thống', icon: 'cog' }
  ];

  // Simple icon component based on name
  const Icon = ({ name }) => {
    // This would be replaced with actual icons in a real implementation
    return <span className="mr-2">{name === 'dashboard' ? '📊' : 
                                  name === 'users' ? '👥' : 
                                  name === 'chart-bar' ? '📈' : 
                                  name === 'document-report' ? '📝' : 
                                  name === 'cog' ? '⚙️' : '🔗'}</span>;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <div className="text-xl font-bold">Admin Panel</div>}
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded hover:bg-gray-700"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="mt-6">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="mb-2">
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) => `
                    flex items-center py-3 px-4 hover:bg-gray-700
                    ${isActive ? 'bg-blue-600' : ''}
                  `}
                >
                  <Icon name={item.icon} />
                  {isSidebarOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto p-4">
          <div className={`border-t border-gray-700 pt-4 ${!isSidebarOpen && 'text-center'}`}>
            {isSidebarOpen ? (
              <div>
                <div className="mb-2">{user?.name}</div>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Hệ thống Quản lý và Dự báo Sinh viên Có Nguy cơ Bỏ học</h1>
            <div className="flex items-center">
              <span className="mr-4">Xin chào, {user?.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
