import { useEffect, useState } from 'react';
import { Link } from 'react-router';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    dropoutRiskCount: 0,
    attendanceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual API calls
        // Simulating API response
        setTimeout(() => {
          setStats({
            totalStudents: 1250,
            totalClasses: 45,
            dropoutRiskCount: 78,
            attendanceRate: 87.5,
          });
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Students</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
          <div className="mt-2">
            <Link to="/students" className="text-blue-600 hover:text-blue-800 text-sm">
              View all students →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Classes</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
          <div className="mt-2">
            <Link to="/classes" className="text-blue-600 hover:text-blue-800 text-sm">
              View all classes →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Dropout Risk Students</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.dropoutRiskCount}</p>
          <div className="mt-2">
            <Link to="/dropout-risks" className="text-blue-600 hover:text-blue-800 text-sm">
              View risk analysis →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Average Attendance</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.attendanceRate}%</p>
          <div className="mt-2">
            <Link to="/attendance" className="text-blue-600 hover:text-blue-800 text-sm">
              View attendance data →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-b pb-2">
              <p className="text-sm text-gray-600">Student "John Doe" was marked as high risk for dropping out.</p>
              <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm text-gray-600">Class "Computer Science 101" attendance updated.</p>
              <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm text-gray-600">New student "Jane Smith" was added to the system.</p>
              <p className="text-xs text-gray-400 mt-1">1 day ago</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Grade report for "Mathematics 202" was generated.</p>
              <p className="text-xs text-gray-400 mt-1">2 days ago</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Alerts</h2>
          <div className="space-y-4">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">10 students have missed more than 3 consecutive classes.</p>
              <Link to="/attendance" className="text-xs text-red-600 hover:text-red-800 mt-1 inline-block">
                Review now →
              </Link>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">25 students showed declining performance in the last assessment.</p>
              <Link to="/reports" className="text-xs text-yellow-600 hover:text-yellow-800 mt-1 inline-block">
                View report →
              </Link>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">Upcoming student evaluation meeting on May 25, 2025.</p>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block">
                Add to calendar →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/students/new"
            className="bg-blue-100 text-blue-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-200 transition-colors"
          >
            <span>Add New Student</span>
          </Link>
          <Link
            to="/attendance/new"
            className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-200 transition-colors"
          >
            <span>Take Attendance</span>
          </Link>
          <Link
            to="/dropout-risks"
            className="bg-purple-100 text-purple-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-purple-200 transition-colors"
          >
            <span>Run Risk Analysis</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
