// File: AttendanceReport.jsx - Attendance reports and statistics
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import DataTable from '../../components/common/DataTable';
import { fetchAttendanceStats, fetchClassAttendance } from '../../services/api';

const AttendanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [classAttendanceData, setClassAttendanceData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In production, replace with actual API call for overall stats
        const response = await fetchAttendanceStats(dateRange);
        setStats(response?.data || mockStats);
        
        // Get list of classes
        setClasses(mockClasses);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance statistics:', err);
        setError('Failed to fetch attendance statistics');
        setLoading(false);
        // For development, use mock data if API fails
        setStats(mockStats);
        setClasses(mockClasses);
      }
    };
    
    fetchData();
  }, [dateRange]);
  
  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) {
        setClassAttendanceData([]);
        return;
      }
      
      try {
        setLoading(true);
        // In production, replace with actual API call
        const response = await fetchClassAttendance(classId, dateRange);
        setClassAttendanceData(response?.data || mockClassAttendance);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching class attendance data:', err);
        setError('Failed to fetch class attendance data');
        setLoading(false);
        // For development, use mock data if API fails
        setClassAttendanceData(mockClassAttendance);
      }
    };
    
    fetchClassData();
  }, [classId, dateRange]);
  
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Define columns for student attendance table
  const columns = [
    { header: 'Student', accessor: 'studentName' },
    { header: 'Total Days', accessor: 'totalDays' },
    { header: 'Present', accessor: 'presentDays' },
    { header: 'Absent', accessor: 'absentDays' },
    { header: 'Late', accessor: 'lateDays' },
    { 
      header: 'Attendance Rate', 
      accessor: 'attendanceRate',
      cell: (row) => {
        const rate = row.attendanceRate;
        const colorClass = 
          rate > 90 ? 'text-green-600' :
          rate > 80 ? 'text-blue-600' :
          rate > 70 ? 'text-yellow-600' :
          'text-red-600';
        
        return <span className={`font-semibold ${colorClass}`}>{rate}%</span>;
      }
    },
    {
      header: 'Trend',
      accessor: 'trend',
      cell: (row) => {
        const trends = {
          up: '↑',
          down: '↓',
          stable: '→'
        };
        
        const trendColor = 
          row.trend === 'up' ? 'text-green-600' :
          row.trend === 'down' ? 'text-red-600' :
          'text-gray-600';
        
        return <span className={`text-xl ${trendColor}`}>{trends[row.trend]}</span>;
      }
    }
  ];
  
  // Mock data for development
  const mockStats = {
    overallAttendance: 88,
    presentPercentage: 88,
    absentPercentage: 7,
    latePercentage: 5,
    totalStudents: 450,
    totalClasses: 15,
    attendanceByGrade: {
      labels: ['Grade 10', 'Grade 11', 'Grade 12'],
      datasets: [
        {
          label: 'Attendance Rate (%)',
          data: [92, 87, 84],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    },
    attendanceTrend: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Present',
          data: [90, 88, 91, 89],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
        {
          label: 'Absent',
          data: [6, 7, 6, 8],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
        },
        {
          label: 'Late',
          data: [4, 5, 3, 3],
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          fill: true,
        }
      ]
    },
    topClassesByAttendance: [
      { className: '10A1', rate: 95 },
      { className: '11B3', rate: 93 },
      { className: '10C2', rate: 92 },
      { className: '12A2', rate: 90 },
      { className: '11A1', rate: 89 }
    ],
    classesNeedingAttention: [
      { className: '12C3', rate: 78 },
      { className: '11C1', rate: 80 },
      { className: '10B3', rate: 82 }
    ]
  };
  
  const mockClasses = [
    { id: 1, name: '10A1' },
    { id: 2, name: '10A2' },
    { id: 3, name: '10B1' },
    { id: 4, name: '11A1' },
    { id: 5, name: '11B1' },
    { id: 6, name: '12A1' },
  ];
  
  const mockClassAttendance = [
    { 
      studentId: 1, 
      studentName: 'Jane Cooper', 
      totalDays: 30, 
      presentDays: 28, 
      absentDays: 1, 
      lateDays: 1, 
      attendanceRate: 93, 
      trend: 'up' 
    },
    { 
      studentId: 2, 
      studentName: 'Michael Brown', 
      totalDays: 30, 
      presentDays: 25, 
      absentDays: 3, 
      lateDays: 2, 
      attendanceRate: 83, 
      trend: 'down' 
    },
    { 
      studentId: 3, 
      studentName: 'Sarah Wilson', 
      totalDays: 30, 
      presentDays: 27, 
      absentDays: 2, 
      lateDays: 1, 
      attendanceRate: 90, 
      trend: 'stable' 
    },
    { 
      studentId: 4, 
      studentName: 'David Johnson', 
      totalDays: 30, 
      presentDays: 30, 
      absentDays: 0, 
      lateDays: 0, 
      attendanceRate: 100, 
      trend: 'up' 
    },
    { 
      studentId: 5, 
      studentName: 'Emily Davis', 
      totalDays: 30, 
      presentDays: 26, 
      absentDays: 2, 
      lateDays: 2, 
      attendanceRate: 87, 
      trend: 'stable' 
    },
  ];
  
  if (loading && !stats) return <div className="flex justify-center p-8">Loading attendance statistics...</div>;
  
  if (error && !stats) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link 
          to="/attendance" 
          className="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Back to Attendance
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Attendance Reports</h1>
      </div>
      
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Date Range</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="w-full md:w-1/2">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Overall Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Overall Attendance Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Overall Attendance Rate</p>
            <p className="text-3xl font-bold text-blue-600">{stats.overallAttendance}%</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-3xl font-bold text-green-600">{stats.presentPercentage}%</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-3xl font-bold text-red-600">{stats.absentPercentage}%</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Late</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.latePercentage}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Attendance by Grade Level</h3>
            <ChartComponent 
              type="bar" 
              data={stats.attendanceByGrade}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Attendance Trend</h3>
            <ChartComponent 
              type="line" 
              data={stats.attendanceTrend}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Top Classes by Attendance</h3>
            <div className="space-y-2">
              {stats.topClassesByAttendance.map((cls, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{cls.className}</span>
                  <span className="text-green-600 font-semibold">{cls.rate}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Classes Needing Attention</h3>
            <div className="space-y-2">
              {stats.classesNeedingAttention.map((cls, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{cls.className}</span>
                  <span className="text-red-600 font-semibold">{cls.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Class-specific attendance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Class Attendance Details</h2>
        
        <div className="mb-6">
          <label htmlFor="classId" className="block text-gray-700 font-medium mb-2">
            Select Class
          </label>
          <select
            id="classId"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        
        {classId ? (
          loading ? (
            <div className="flex justify-center p-4">Loading class data...</div>
          ) : (
            <div>
              <h3 className="text-lg font-medium mb-3">Student Attendance</h3>
              <DataTable 
                columns={columns} 
                data={classAttendanceData} 
                pagination={true} 
                itemsPerPage={10} 
              />
              
              <div className="mt-6">
                <button
                  onClick={() => {
                    // In production, implement actual export functionality
                    alert('Attendance report exported successfully (mock)');
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Export Report
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-4 text-gray-500">Select a class to view attendance details</div>
        )}
      </div>
    </div>
  );
};

export default AttendanceReport;
