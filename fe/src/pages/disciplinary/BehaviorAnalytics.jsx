// File: BehaviorAnalytics.jsx - Analyze student behavior patterns and disciplinary trends
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { fetchDisciplinaryRecords } from '../../services/api';

const BehaviorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [topOffenders, setTopOffenders] = useState([]);
  const [filters, setFilters] = useState({
    timeframe: 'academic_year',
    gradeLevel: 'all',
    classId: 'all',
    severityLevel: 'all',
    viewTab: 'trends'
  });
  const { hasPermission } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a production app, this would come from the API
        const response = await fetchDisciplinaryRecords({ 
          ...filters,
          analytics: true
        });
        
        // Process the response data or use mock data for development
        setAnalyticsData(response?.data?.analytics || mockAnalyticsData);
        
        // Transform the data to match our component's expected format
        const processedOffenders = (response?.data?.topOffenders || mockTopOffenders).map(record => ({
          student_id: record.student?.student_id || record.student_id,
          student_name: record.student?.user?.full_name || 'Unknown',
          class_name: record.student?.class_name || 'Unknown',
          incident_count: record.incident_count || 1,
          highest_severity: record.severity_level || 'minor',
          risk_level: calculateRiskLevel(record.severity_level, record.incident_count || 1)
        }));
        
        setTopOffenders(processedOffenders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching behavior analytics data:', err);
        setError('Failed to load behavior analytics data');
        setLoading(false);
        
        // For development, use mock data if API fails
        setAnalyticsData(mockAnalyticsData);
        
        // Transform mock data to match our expected format
        const processedMockOffenders = mockTopOffenders.map(record => ({
          student_id: record.student_id,
          student_name: record.student_name,
          class_name: record.class_name,
          incident_count: record.incident_count || 1,
          highest_severity: record.highest_severity || 'minor',
          risk_level: record.risk_level || 'low'
        }));
        
        setTopOffenders(processedMockOffenders);
      }
    };

    fetchData();
  }, [filters]);

  // Helper function to calculate risk level based on severity and incident count
  const calculateRiskLevel = (severity, incidentCount) => {
    if (severity === 'severe' || incidentCount >= 5) {
      return 'high';
    } else if (severity === 'moderate' || incidentCount >= 3) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const studentColumns = [
    { header: 'Student ID', accessor: 'student_id' },
    { header: 'Name', accessor: 'student_name' },
    { header: 'Class', accessor: 'class_name' },
    { header: 'Incidents', accessor: 'incident_count' },
    { 
      header: 'Severity', 
      accessor: 'highest_severity',
      cell: (row) => {
        const severityColor = 
          row.highest_severity === 'severe' ? 'bg-red-100 text-red-800' :
          row.highest_severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
          'bg-yellow-100 text-yellow-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${severityColor}`}>
            {row.highest_severity.charAt(0).toUpperCase() + row.highest_severity.slice(1)}
          </span>
        );
      }
    },
    { 
      header: 'Risk Level', 
      accessor: 'risk_level',
      cell: (row) => {
        const riskColor = 
          row.risk_level === 'high' ? 'bg-red-100 text-red-800' :
          row.risk_level === 'medium' ? 'bg-orange-100 text-orange-800' :
          'bg-green-100 text-green-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${riskColor}`}>
            {row.risk_level.charAt(0).toUpperCase() + row.risk_level.slice(1)}
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
            to={`/students/${row.student_id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Student Profile
          </Link>
        </div>
      )
    }
  ];

  const classColumns = [
    { header: 'Class', accessor: 'class_name' },
    { header: 'Total Incidents', accessor: 'incident_count' },
    { header: 'Minor', accessor: 'minor_count' },
    { header: 'Moderate', accessor: 'moderate_count' },
    { header: 'Severe', accessor: 'severe_count' },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => {
        const statusColor = 
          row.status === 'good' ? 'bg-green-100 text-green-800' :
          row.status === 'warning' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
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
            to={`/classes/${row.class_id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Class Detail
          </Link>
        </div>
      )
    }
  ];

  // Mock data for development
  const mockTopOffenders = [
    {
      record_id: 1,
      student_id: 43,
      student: {
        student_id: 43,
        student_code: "SV100042",
        user: {
          full_name: "Susan Mendoza",
          user_id: 64
        }
      },
      violation_description: "Disrupting class",
      violation_date: "2023-12-31",
      severity_level: "moderate",
      incident_count: 5
    },
    {
      record_id: 2,
      student_id: 44,
      student: {
        student_id: 44,
        student_code: "SV100043",
        user: {
          full_name: "Trần Thị B",
          user_id: 65
        }
      },
      violation_description: "Late to class three times",
      violation_date: "2024-01-15",
      severity_level: "severe",
      incident_count: 4
    },
    {
      record_id: 3,
      student_id: 45,
      student: {
        student_id: 45,
        student_code: "SV100044",
        user: {
          full_name: "Lê Văn C",
          user_id: 66
        }
      },
      violation_description: "Cheating on exam",
      violation_date: "2024-02-10",
      severity_level: "moderate",
      incident_count: 3
    },
    {
      record_id: 4,
      student_id: 46,
      student: {
        student_id: 46,
        student_code: "SV100045",
        user: {
          full_name: "Phạm Thị D",
          user_id: 67
        }
      },
      violation_description: "Absence without notice",
      violation_date: "2024-03-05",
      severity_level: "minor",
      incident_count: 3
    },
    {
      record_id: 5,
      student_id: 44,
      student: {
        student_id: 44,
        student_code: "SV100043",
        user: {
          full_name: "Trần Thị B",
          user_id: 65
        }
      },
      violation_description: "Incomplete homework",
      violation_date: "2024-03-20",
      severity_level: "severe",
      incident_count: 2
    }
  ];

  const mockAnalyticsData = {
    incidentTypes: {
      labels: ['Vắng học không phép', 'Gây rối lớp học', 'Đánh nhau', 'Nộp bài trễ', 'Sử dụng điện thoại', 'Khác'],
      datasets: [
        {
          label: 'Incident Count',
          data: [35, 25, 10, 20, 15, 5],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    },
    monthlyDistribution: {
      labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Number of Incidents',
          data: [8, 12, 15, 10, 8, 14, 16, 12, 9, 6],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    },
    recurrenceRate: {
      labels: ['0 incidents', '1 incident', '2 incidents', '3+ incidents'],
      datasets: [
        {
          label: 'Number of Students',
          data: [350, 85, 35, 15],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    },
    classComparison: {
      labels: ['10A', '10B', '11A', '11B', '12A', '12B'],
      datasets: [
        {
          label: 'Incidents per Student',
          data: [0.4, 0.3, 0.5, 0.6, 0.2, 0.3],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    },
    classesByIncident: [
      {
        class_id: 1,
        class_name: '11B',
        incident_count: 22,
        minor_count: 10,
        moderate_count: 8,
        severe_count: 4,
        status: 'concern'
      },
      {
        class_id: 2,
        class_name: '10A',
        incident_count: 18,
        minor_count: 12,
        moderate_count: 5,
        severe_count: 1,
        status: 'warning'
      },
      {
        class_id: 3,
        class_name: '11A',
        incident_count: 15,
        minor_count: 10,
        moderate_count: 4,
        severe_count: 1,
        status: 'warning'
      },
      {
        class_id: 4,
        class_name: '10B',
        incident_count: 12,
        minor_count: 9,
        moderate_count: 3,
        severe_count: 0,
        status: 'good'
      },
      {
        class_id: 5,
        class_name: '12A',
        incident_count: 9,
        minor_count: 7,
        moderate_count: 2,
        severe_count: 0,
        status: 'good'
      }
    ],
    correlations: {
      labels: ['Academic Performance', 'Attendance Rate', 'Participation', 'Homework Completion', 'Extracurricular'],
      datasets: [
        {
          label: 'Correlation Strength',
          data: [-0.72, -0.68, -0.56, -0.64, -0.32],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading behavior analytics data...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  if (!hasPermission(PERMISSIONS.DISCIPLINARY_VIEW)) {
    return (
      <div className="bg-yellow-100 p-4 rounded-md">
        <p className="text-yellow-700">You don't have permission to view behavior analytics.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              to="/disciplinary" 
              className="mr-4 text-blue-500 hover:text-blue-700"
            >
              ← Back to Disciplinary Records
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Behavior Analytics</h1>
          </div>
        </div>
        
        <p className="text-gray-600 mt-2">
          Analyze student behavior patterns and disciplinary trends
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <select
              name="gradeLevel"
              value={filters.gradeLevel}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Grades</option>
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
              <option value="2">10B</option>
              <option value="3">11A</option>
              <option value="4">11B</option>
              <option value="5">12A</option>
              <option value="6">12B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              name="severityLevel"
              value={filters.severityLevel}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="minor">Minor</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Frame</label>
          <select
            name="timeframe"
            value={filters.timeframe}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="current_semester">Current Semester</option>
            <option value="previous_semester">Previous Semester</option>
            <option value="academic_year">Full Academic Year</option>
            <option value="last_year">Last Academic Year</option>
          </select>
        </div>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Incident Types Distribution</h2>
          <ChartComponent 
            type="pie" 
            data={analyticsData.incidentTypes}
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
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Distribution</h2>
          <ChartComponent 
            type="bar" 
            data={analyticsData.monthlyDistribution}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Incidents'
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Student Recurrence Rate</h2>
          <ChartComponent 
            type="pie" 
            data={analyticsData.recurrenceRate}
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
          <h2 className="text-lg font-semibold mb-4">Incidents per Student by Class</h2>
          <ChartComponent 
            type="bar" 
            data={analyticsData.classComparison}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Incidents per Student'
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Correlation with Other Factors</h2>
        <p className="text-sm text-gray-600 mb-4">Negative correlations indicate factors that tend to decrease as disciplinary incidents increase</p>
        <ChartComponent 
          type="horizontalBar" 
          data={analyticsData.correlations}
          options={{
            indexAxis: 'y',
            responsive: true,
            plugins: {
              legend: {
                display: false,
              }
            },
            scales: {
              x: {
                min: -1,
                max: 0,
                title: {
                  display: true,
                  text: 'Correlation Coefficient'
                }
              }
            }
          }}
        />
      </div>

      {/* Data Tables with Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <ul className="flex flex-wrap text-sm font-medium text-center border-b">
            <li className="mr-2">
              <button 
                className={`inline-block p-4 ${filters.viewTab === 'trends' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setFilters(prev => ({ ...prev, viewTab: 'trends' }))}
              >
                Students with Multiple Incidents
              </button>
            </li>
            <li className="mr-2">
              <button 
                className={`inline-block p-4 ${filters.viewTab === 'classes' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setFilters(prev => ({ ...prev, viewTab: 'classes' }))}
              >
                Classes by Incident Count
              </button>
            </li>
          </ul>
        </div>
        
        {filters.viewTab === 'trends' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Students with Multiple Incidents</h2>
            <DataTable 
              columns={studentColumns} 
              data={topOffenders} 
              pagination={true} 
              itemsPerPage={10} 
            />
          </div>
        )}
        
        {filters.viewTab === 'classes' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Classes by Incident Count</h2>
            <DataTable 
              columns={classColumns} 
              data={analyticsData.classesByIncident} 
              pagination={true} 
              itemsPerPage={10} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BehaviorAnalytics;
