import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

// Dashboard cho Admin
const AdminDashboard = ({ stats, isLoading, error }) => {
  if (isLoading || error) return null;
  
  return (
    <>
      {/* Stats Cards cho Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Tổng số học sinh</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
          <div className="mt-2">
            <Link to="/students" className="text-blue-600 hover:text-blue-800 text-sm">
              Xem tất cả học sinh →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Tổng số lớp học</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
          <div className="mt-2">
            <Link to="/classes" className="text-blue-600 hover:text-blue-800 text-sm">
              Xem tất cả lớp học →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Học sinh có nguy cơ</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.dropoutRiskCount}</p>
          <div className="mt-2">
            <Link to="/dropout-risk" className="text-blue-600 hover:text-blue-800 text-sm">
              Xem phân tích →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Tỷ lệ điểm danh</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.attendanceRate}%</p>
          <div className="mt-2">
            <Link to="/attendance" className="text-blue-600 hover:text-blue-800 text-sm">
              Xem chi tiết →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions cho Admin */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/students/new"
            className="bg-blue-100 text-blue-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-200 transition-colors"
          >
            <span>Thêm học sinh mới</span>
          </Link>
          <Link
            to="/classes/new"
            className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-200 transition-colors"
          >
            <span>Tạo lớp học mới</span>
          </Link>
          <Link
            to="/reports"
            className="bg-purple-100 text-purple-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-purple-200 transition-colors"
          >
            <span>Xem báo cáo</span>
          </Link>
        </div>
      </div>
    </>
  );
};

// Dashboard cho Giáo viên
const TeacherDashboard = ({ stats, isLoading, error }) => {
  if (isLoading || error) return null;
  
  return (
    <>
      {/* Stats Cards cho Giáo viên */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Lớp học phụ trách</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.teacherClasses || 0}</p>
          <div className="mt-2">
            <Link to="/classes" className="text-blue-600 hover:text-blue-800 text-sm">
              Xem lớp học →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Tỷ lệ điểm danh</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.attendanceRate}%</p>
          <div className="mt-2">
            <Link to="/attendance" className="text-blue-600 hover:text-blue-800 text-sm">
              Xem điểm danh →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Học sinh cần chú ý</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.needAttentionCount || 0}</p>
          <div className="mt-2">
            <Link to="/grades" className="text-blue-600 hover:text-blue-800 text-sm">
              Xem chi tiết →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions cho Giáo viên */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/attendance/new"
            className="bg-blue-100 text-blue-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-200 transition-colors"
          >
            <span>Điểm danh</span>
          </Link>
          <Link
            to="/grades/new"
            className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-200 transition-colors"
          >
            <span>Nhập điểm</span>
          </Link>
          <Link
            to="/disciplinary/new"
            className="bg-yellow-100 text-yellow-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-yellow-200 transition-colors"
          >
            <span>Ghi nhận kỷ luật</span>
          </Link>
        </div>
      </div>
    </>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    dropoutRiskCount: 0,
    attendanceRate: 0,
    teacherClasses: 0,
    needAttentionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Thay thế bằng API calls thực tế dựa theo role
        setTimeout(() => {
          if (user?.role === 'admin') {
            setStats({
              totalStudents: 1250,
              totalClasses: 45,
              dropoutRiskCount: 78,
              attendanceRate: 87.5
            });
          } else if (user?.role === 'teacher') {
            setStats({
              teacherClasses: 5,
              attendanceRate: 92.3,
              needAttentionCount: 12
            });
          }
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Không thể tải dữ liệu dashboard');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {user?.role === 'admin' && (
        <AdminDashboard stats={stats} isLoading={isLoading} error={error} />
      )}
      
      {user?.role === 'teacher' && (
        <TeacherDashboard stats={stats} isLoading={isLoading} error={error} />
      )}
    </div>
  );
};

export default Dashboard;
