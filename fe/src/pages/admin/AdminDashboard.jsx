import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import ClassStats from '../../components/dashboard/ClassStats';
import DropoutRiskOverview from '../../components/dashboard/DropoutRiskOverview';
import RecentActivities from '../../components/dashboard/RecentActivities';
import StudentStats from '../../components/dashboard/StudentStats';
import Card from '../../components/ui/Card';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalTeachers: 0,
    highRiskStudents: 0
  });

  useEffect(() => {
    // Simulate fetching data from API
    const fetchData = async () => {
      try {
        // In a real application, this would be an API call
        // const response = await api.get('/admin/dashboard-stats');
        // setStats(response.data);
        
        // Simulated data
        setTimeout(() => {
          setStats({
            totalStudents: 1245,
            totalClasses: 42,
            totalTeachers: 38,
            highRiskStudents: 57
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="stat-card">
            <h3 className="text-lg font-semibold">Total Students</h3>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
            <Link to="/admin/students" className="text-blue-600 text-sm">View all students →</Link>
          </div>
        </Card>
        
        <Card>
          <div className="stat-card">
            <h3 className="text-lg font-semibold">Total Classes</h3>
            <p className="text-3xl font-bold">{stats.totalClasses}</p>
            <Link to="/admin/classes" className="text-blue-600 text-sm">View all classes →</Link>
          </div>
        </Card>
        
        <Card>
          <div className="stat-card">
            <h3 className="text-lg font-semibold">Total Teachers</h3>
            <p className="text-3xl font-bold">{stats.totalTeachers}</p>
            <Link to="/admin/teachers" className="text-blue-600 text-sm">View all teachers →</Link>
          </div>
        </Card>
        
        <Card>
          <div className="stat-card">
            <h3 className="text-lg font-semibold">High Risk Students</h3>
            <p className="text-3xl font-bold text-red-600">{stats.highRiskStudents}</p>
            <Link to="/admin/dropout-risk" className="text-blue-600 text-sm">View risk details →</Link>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StudentStats />
        <ClassStats />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DropoutRiskOverview />
        <RecentActivities />
      </div>
    </div>
  );
};

export default AdminDashboard;
