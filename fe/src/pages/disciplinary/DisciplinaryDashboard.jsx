// File: DisciplinaryDashboard.jsx - Dashboard for disciplinary records and analytics
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { fetchDisciplinaryRecords } from '../../services/api';

const DisciplinaryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [timeRange, setTimeRange] = useState('current_semester');
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a production app, this would come from the API
        const response = await fetchDisciplinaryRecords({ 
          timeframe: timeRange,
          includeStatistics: true,
          limit: 5,
          sort: 'violation_date,desc'
        });
        
        // Process the response data or use mock data for development
        setRecentIncidents(response?.data?.records || mockRecentIncidents);
        setStatistics(response?.data?.statistics || mockStatistics);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching disciplinary data:', err);
        setError('Failed to load disciplinary dashboard data');
        setLoading(false);
        // For development, use mock data if API fails
        setRecentIncidents(mockRecentIncidents);
        setStatistics(mockStatistics);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const columns = [
    { header: 'Student', accessor: 'student_name' },
    { header: 'Date', accessor: 'violation_date' },
    { 
      header: 'Severity', 
      accessor: 'severity_level',
      cell: (row) => {
        const severityColor = 
          row.severity_level === 'severe' ? 'bg-red-100 text-red-800' :
          row.severity_level === 'moderate' ? 'bg-orange-100 text-orange-800' :
          'bg-yellow-100 text-yellow-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${severityColor}`}>
            {row.severity_level.charAt(0).toUpperCase() + row.severity_level.slice(1)}
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: 'resolution_status',
      cell: (row) => {
        const statusColor = 
          row.resolution_status === 'resolved' ? 'bg-green-100 text-green-800' :
          row.resolution_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {row.resolution_status === 'resolved' ? 'Resolved' : 
             row.resolution_status === 'in_progress' ? 'In Progress' : 'Open'}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link 
            to={`/disciplinary/${row.id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            View
          </Link>
        </div>
      )
    }
  ];

  // Mock data for development
  const mockRecentIncidents = [
    {
      id: 1,
      student_id: 1,
      student_name: 'Nguyễn Văn A',
      violation_date: '2025-05-15',
      violation_description: 'Vắng học không phép',
      severity_level: 'minor',
      resolution_status: 'resolved'
    },
    {
      id: 2,
      student_id: 2,
      student_name: 'Trần Thị B',
      violation_date: '2025-05-10',
      violation_description: 'Gây rối trong lớp học',
      severity_level: 'moderate',
      resolution_status: 'in_progress'
    },
    {
      id: 3,
      student_id: 3,
      student_name: 'Lê Văn C',
      violation_date: '2025-05-08',
      violation_description: 'Đánh nhau',
      severity_level: 'severe',
      resolution_status: 'open'
    },
    {
      id: 4,
      student_id: 4,
      student_name: 'Phạm Thị D',
      violation_date: '2025-05-05',
      violation_description: 'Nộp bài trễ hạn',
      severity_level: 'minor',
      resolution_status: 'resolved'
    },
    {
      id: 5,
      student_id: 5,
      student_name: 'Hoàng Văn E',
      violation_date: '2025-05-01',
      violation_description: 'Không mang đồng phục',
      severity_level: 'minor',
      resolution_status: 'resolved'
    }
  ];

  const mockStatistics = {
    totalIncidents: 48,
    openIncidents: 12,
    resolvedIncidents: 36,
    incidentsBySeverity: {
      labels: ['Minor', 'Moderate', 'Severe'],
      datasets: [
        {
          label: 'Incidents by Severity',
          data: [28, 15, 5],
          backgroundColor: [
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    },
    incidentsByClass: {
      labels: ['10A', '10B', '11A', '11B', '12A', '12B'],
      datasets: [
        {
          label: 'Number of Incidents',
          data: [10, 8, 7, 12, 6, 5],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    },
    incidentsTrend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Disciplinary Incidents',
          data: [8, 10, 12, 9, 9],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        }
      ]
    },
    resolutionRate: {
      labels: ['Resolved', 'In Progress', 'Open'],
      datasets: [
        {
          label: 'Resolution Status',
          data: [36, 6, 6],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading disciplinary data...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  if (!hasPermission(PERMISSIONS.DISCIPLINARY_VIEW)) {
    return (
      <div className="bg-yellow-100 p-4 rounded-md">
        <p className="text-yellow-700">You don't have permission to view disciplinary records.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Disciplinary Records Dashboard</h1>
        
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current_semester">Current Semester</option>
            <option value="previous_semester">Previous Semester</option>
            <option value="academic_year">Academic Year</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>
          
          {hasPermission(PERMISSIONS.DISCIPLINARY_EDIT) && (
            <Link 
              to="/disciplinary/new"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create New Record
            </Link>
          )}
          
          <Link
            to="/disciplinary"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            View All Records
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm">Total Incidents</h3>
          <p className="text-3xl font-bold text-gray-800">{statistics.totalIncidents}</p>
          <div className="mt-2 text-xs text-gray-500">For selected period</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm">Open Incidents</h3>
          <p className="text-3xl font-bold text-red-600">{statistics.openIncidents}</p>
          <div className="mt-2 text-xs text-gray-500">Requiring attention</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm">Resolved Incidents</h3>
          <p className="text-3xl font-bold text-green-600">{statistics.resolvedIncidents}</p>
          <div className="mt-2 text-xs text-gray-500">Successfully closed</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm">Resolution Rate</h3>
          <p className="text-3xl font-bold text-blue-600">
            {Math.round((statistics.resolvedIncidents / statistics.totalIncidents) * 100)}%
          </p>
          <div className="mt-2 text-xs text-gray-500">Of total incidents</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Incidents by Severity</h2>
          <ChartComponent 
            type="pie" 
            data={statistics.incidentsBySeverity} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                }
              }
            }}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Resolution Status</h2>
          <ChartComponent 
            type="doughnut" 
            data={statistics.resolutionRate}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                }
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Incidents by Class</h2>
          <ChartComponent 
            type="bar" 
            data={statistics.incidentsByClass}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Incidents Trend</h2>
          <ChartComponent 
            type="line" 
            data={statistics.incidentsTrend}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                }
              }
            }}
          />
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Disciplinary Incidents</h2>
          <Link 
            to="/disciplinary"
            className="text-blue-500 hover:underline"
          >
            View All
          </Link>
        </div>
        
        <DataTable 
          columns={columns} 
          data={recentIncidents} 
          pagination={false} 
        />
      </div>
    </div>
  );
};

export default DisciplinaryDashboard;
