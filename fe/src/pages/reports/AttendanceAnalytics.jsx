// File: AttendanceAnalytics.jsx - Attendance analysis and reports
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { exportReport, fetchAttendanceReports } from '../../services/api';

const AttendanceAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    gradeLevel: 'all',
    classId: 'all',
    timeframe: 'current_month',
    attendanceType: 'all',
    viewTab: 'students'
  });
  const { hasPermission } = useAuth();

  useEffect(() => {
    const getReportData = async () => {
      try {
        setLoading(true);
        // In production, replace with actual API call
        const response = await fetchAttendanceReports(filters);
        setReportData(response?.data || mockReportData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance reports:', err);
        setError('Failed to fetch attendance reports');
        setLoading(false);
        // For development, use mock data
        setReportData(mockReportData);
      }
    };

    getReportData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      const response = await exportReport('attendance', { ...filters, format });
      
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${new Date().toISOString().slice(0, 10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportLoading(false);
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report. Please try again.');
      setExportLoading(false);
    }
  };

  const studentColumns = [
    { header: 'Student ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Class', accessor: 'className' },
    { header: 'Present (%)', accessor: 'presentRate' },
    { header: 'Absent', accessor: 'absences' },
    { header: 'Late', accessor: 'lates' },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => {
        const statusColor = 
          row.status === 'Excellent' ? 'bg-green-100 text-green-800' :
          row.status === 'Good' ? 'bg-blue-100 text-blue-800' :
          row.status === 'Average' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'Warning' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {row.status}
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
            to={`/students/${row.id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Student Detail
          </Link>
        </div>
      )
    }
  ];

  const classColumns = [
    { header: 'Class', accessor: 'name' },
    { header: 'Students', accessor: 'studentCount' },
    { header: 'Average Attendance', accessor: 'averageAttendance' },
    { header: 'Perfect Attendance', accessor: 'perfectAttendance' },
    { header: 'Chronic Absences', accessor: 'chronicAbsences' },
    { header: 'Status', accessor: 'status',
      cell: (row) => {
        const statusColor = 
          row.status === 'Excellent' ? 'bg-green-100 text-green-800' :
          row.status === 'Good' ? 'bg-blue-100 text-blue-800' :
          row.status === 'Average' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'Warning' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Details',
      accessor: 'actions',
      cell: (row) => (
        <Link 
          to={`/classes/${row.id}`}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
        >
          View Class
        </Link>
      )
    }
  ];

  const dateColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Day of Week', accessor: 'dayOfWeek' },
    { header: 'Present (%)', accessor: 'presentRate' },
    { header: 'Absent Count', accessor: 'absentCount' },
    { header: 'Late Count', accessor: 'lateCount' },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => {
        const statusColor = 
          row.status === 'High' ? 'bg-green-100 text-green-800' :
          row.status === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  // Mock data for development
  const mockReportData = {
    students: [
      {
        id: 1,
        name: 'Jane Cooper',
        className: '10A',
        presentRate: 98.5,
        absences: 1,
        lates: 2,
        status: 'Excellent'
      },
      {
        id: 2,
        name: 'Michael Brown',
        className: '9B',
        presentRate: 85.2,
        absences: 8,
        lates: 5,
        status: 'Average'
      },
      {
        id: 3,
        name: 'Sarah Wilson',
        className: '10A',
        presentRate: 72.5,
        absences: 15,
        lates: 3,
        status: 'Poor'
      },
      {
        id: 4,
        name: 'David Johnson',
        className: '9B',
        presentRate: 92.3,
        absences: 4,
        lates: 2,
        status: 'Good'
      },
      {
        id: 5,
        name: 'Emily Davis',
        className: '10A',
        presentRate: 95.8,
        absences: 2,
        lates: 1,
        status: 'Excellent'
      }
    ],
    classes: [
      {
        id: 1,
        name: '10A',
        studentCount: 35,
        averageAttendance: 92.5,
        perfectAttendance: 8,
        chronicAbsences: 2,
        status: 'Good'
      },
      {
        id: 2,
        name: '9B',
        studentCount: 32,
        averageAttendance: 88.3,
        perfectAttendance: 5,
        chronicAbsences: 4,
        status: 'Average'
      },
      {
        id: 3,
        name: '11C',
        studentCount: 30,
        averageAttendance: 96.7,
        perfectAttendance: 12,
        chronicAbsences: 0,
        status: 'Excellent'
      }
    ],
    dateAnalysis: [
      {
        date: '2023-11-01',
        dayOfWeek: 'Monday',
        presentRate: 95.2,
        absentCount: 8,
        lateCount: 5,
        status: 'High'
      },
      {
        date: '2023-11-02',
        dayOfWeek: 'Tuesday',
        presentRate: 96.5,
        absentCount: 6,
        lateCount: 4,
        status: 'High'
      },
      {
        date: '2023-11-03',
        dayOfWeek: 'Wednesday',
        presentRate: 94.8,
        absentCount: 9,
        lateCount: 3,
        status: 'High'
      },
      {
        date: '2023-11-06',
        dayOfWeek: 'Monday',
        presentRate: 85.3,
        absentCount: 25,
        lateCount: 7,
        status: 'Medium'
      },
      {
        date: '2023-11-07',
        dayOfWeek: 'Tuesday',
        presentRate: 92.1,
        absentCount: 14,
        lateCount: 5,
        status: 'Medium'
      }
    ],
    attendanceDistribution: {
      labels: ['Present', 'Absent', 'Late'],
      datasets: [
        {
          label: 'Attendance Distribution',
          data: [90.5, 6.8, 2.7],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1
        }
      ]
    },
    weekdayAnalysis: {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      datasets: [
        {
          label: 'Average Attendance Rate',
          data: [88.5, 92.3, 94.1, 91.7, 84.9],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    },
    monthlyTrend: {
      labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      datasets: [
        {
          label: 'Average Attendance Rate',
          data: [95.2, 93.8, 92.5, 90.1, 88.7, 91.2],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true
        }
      ]
    },
    absenceReasons: {
      labels: ['Illness', 'Family Emergency', 'Transportation', 'Appointments', 'Unexcused', 'Other'],
      datasets: [
        {
          label: 'Absence Reasons',
          data: [45, 15, 10, 12, 8, 10],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1
        }
      ]
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading attendance analytics...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  if (!hasPermission(PERMISSIONS.REPORTS_VIEW)) {
    return (
      <div className="bg-yellow-100 p-4 rounded-md">
        <p className="text-yellow-700">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              to="/reports" 
              className="mr-4 text-blue-500 hover:text-blue-700"
            >
              ← Back to Reports
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Analytics</h1>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exportLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
            >
              {exportLoading ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={exportLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              {exportLoading ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mt-2">
          Analyze attendance patterns and identify trends across students, classes, and time periods.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <select
              name="gradeLevel"
              value={filters.gradeLevel}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Grades</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              name="classId"
              value={filters.classId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Classes</option>
              <option value="1">10A</option>
              <option value="2">9B</option>
              <option value="3">11C</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Frame</label>
            <select
              name="timeframe"
              value={filters.timeframe}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current_month">Current Month</option>
              <option value="previous_month">Previous Month</option>
              <option value="current_semester">Current Semester</option>
              <option value="academic_year">Full Academic Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Type</label>
            <select
              name="attendanceType"
              value={filters.attendanceType}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
              <option value="late">Late Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 text-sm">Average Attendance</h3>
            <span className="text-green-500 text-xs font-semibold">+1.2%</span>
          </div>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-gray-800">90.5%</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Overall attendance rate for selected period</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 text-sm">Perfect Attendance</h3>
            <span className="text-green-500 text-xs font-semibold">+5</span>
          </div>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-gray-800">25</p>
            <p className="text-gray-500 text-sm ml-2">students</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Students with 100% attendance</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 text-sm">Chronic Absences</h3>
            <span className="text-red-500 text-xs font-semibold">+2</span>
          </div>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-gray-800">8</p>
            <p className="text-gray-500 text-sm ml-2">students</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Students with 10% absence rate</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 text-sm">Best Day</h3>
          </div>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-gray-800">Wed</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Best attendance day (94.1% average)</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Attendance Distribution</h2>
          <ChartComponent 
            type="pie" 
            data={reportData?.attendanceDistribution} 
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
          <h2 className="text-lg font-semibold mb-4">Weekday Analysis</h2>
          <ChartComponent 
            type="bar" 
            data={reportData?.weekdayAnalysis}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  min: 80,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Attendance Rate (%)'
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Trend</h2>
          <ChartComponent 
            type="line" 
            data={reportData?.monthlyTrend}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  min: 80,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Attendance Rate (%)'
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Absence Reasons</h2>
          <ChartComponent 
            type="doughnut" 
            data={reportData?.absenceReasons}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                }
              }
            }}
          />
        </div>
      </div>
      
      {/* Data Tables with Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <ul className="flex flex-wrap text-sm font-medium text-center border-b">
            <li className="mr-2">
              <button 
                className={`inline-block p-4 ${filters.viewTab === 'students' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setFilters(prev => ({ ...prev, viewTab: 'students' }))}
              >
                Student Attendance
              </button>
            </li>
            <li className="mr-2">
              <button 
                className={`inline-block p-4 ${filters.viewTab === 'classes' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setFilters(prev => ({ ...prev, viewTab: 'classes' }))}
              >
                Class Attendance
              </button>
            </li>
            <li className="mr-2">
              <button 
                className={`inline-block p-4 ${filters.viewTab === 'dates' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setFilters(prev => ({ ...prev, viewTab: 'dates' }))}
              >
                Date Analysis
              </button>
            </li>
          </ul>
        </div>
        
        {filters.viewTab === 'students' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Student Attendance Details</h2>
            <DataTable 
              columns={studentColumns} 
              data={reportData?.students} 
              pagination={true} 
              itemsPerPage={10} 
            />
          </div>
        )}
        
        {filters.viewTab === 'classes' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Class Attendance Comparison</h2>
            <DataTable 
              columns={classColumns} 
              data={reportData?.classes} 
              pagination={true} 
              itemsPerPage={10} 
            />
          </div>
        )}
        
        {filters.viewTab === 'dates' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Date-wise Attendance Analysis</h2>
            <DataTable 
              columns={dateColumns} 
              data={reportData?.dateAnalysis} 
              pagination={true} 
              itemsPerPage={10} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
