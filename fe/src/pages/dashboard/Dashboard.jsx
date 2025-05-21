// Main dashboard page
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

// Import dashboard components
// For now these are commented out as they would be implemented later
// import StudentStats from '../../components/dashboard/StudentStats';
// import ClassStats from '../../components/dashboard/ClassStats';
// import DropoutRiskOverview from '../../components/dashboard/DropoutRiskOverview';
// import RecentActivities from '../../components/dashboard/RecentActivities';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    averageAttendance: 0,
    highRiskStudents: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Simulate loading data from an API
    const loadDashboardData = async () => {
      try {
        // This would be replaced with actual API calls
        // const data = await dashboardService.getStats();
        
        // Mock data for demonstration
        const mockStats = {
          totalStudents: 1250,
          totalClasses: 42,
          averageAttendance: 87.5,
          highRiskStudents: 56
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Different dashboard views based on user role
  const renderRoleBasedDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboardContent stats={stats} />;
      case 'teacher':
        return <TeacherDashboardContent stats={stats} />;
      case 'student':
        return <StudentDashboardContent stats={stats} />;
      case 'counselor':
        return <CounselorDashboardContent stats={stats} />;
      case 'parent':
        return <ParentDashboardContent stats={stats} />;
      default:
        return <DefaultDashboardContent stats={stats} />;
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.fullName || 'User'}!</p>
      
      {renderRoleBasedDashboard()}
    </div>
  );
};

// Placeholder components for role-based dashboards
const AdminDashboardContent = ({ stats }) => (
  <div className="admin-dashboard">
    <h2>Admin Dashboard</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Students</h3>
        <p className="stat-value">{stats.totalStudents}</p>
      </div>
      <div className="stat-card">
        <h3>Total Classes</h3>
        <p className="stat-value">{stats.totalClasses}</p>
      </div>
      <div className="stat-card">
        <h3>Avg. Attendance</h3>
        <p className="stat-value">{stats.averageAttendance}%</p>
      </div>
      <div className="stat-card high-risk">
        <h3>High Risk Students</h3>
        <p className="stat-value">{stats.highRiskStudents}</p>
      </div>
    </div>
  </div>
);

// Other role-based dashboard placeholders (simplified for now)
const TeacherDashboardContent = () => <div>Teacher Dashboard Content</div>;
const StudentDashboardContent = () => <div>Student Dashboard Content</div>;
const CounselorDashboardContent = () => <div>Counselor Dashboard Content</div>;
const ParentDashboardContent = () => <div>Parent Dashboard Content</div>;
const DefaultDashboardContent = () => <div>Default Dashboard Content</div>;

export default Dashboard;  
