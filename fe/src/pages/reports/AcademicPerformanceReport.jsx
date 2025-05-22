// File: AcademicPerformanceReport.jsx - Academic performance reports and analytics
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { exportReport, fetchAcademicReports } from '../../services/api';

const AcademicPerformanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    gradeLevel: 'all',
    classId: 'all',
    subjectId: 'all',
    timeframe: 'current_semester',
    performanceMetric: 'gpa'
  });
  const { hasPermission } = useAuth();

  useEffect(() => {
    const getReportData = async () => {
      try {
        setLoading(true);
        // In production, replace with actual API call
        const response = await fetchAcademicReports(filters);
        setReportData(response?.data || mockReportData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching academic reports:', err);
        setError('Failed to fetch academic reports');
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
      const response = await exportReport('academic', { ...filters, format });
      
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `academic-report-${new Date().toISOString().slice(0, 10)}.${format}`);
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
    { header: 'Average GPA', accessor: 'averageGPA' },
    { header: 'Passing Subjects', accessor: 'passingSubjects' },
    { header: 'Failing Subjects', accessor: 'failingSubjects' },
    { 
      header: 'Performance Level', 
      accessor: 'performanceLevel',
      cell: (row) => {
        const levelColor = 
          row.performanceLevel === 'Excellent' ? 'bg-green-100 text-green-800' :
          row.performanceLevel === 'Good' ? 'bg-blue-100 text-blue-800' :
          row.performanceLevel === 'Average' ? 'bg-yellow-100 text-yellow-800' :
          row.performanceLevel === 'Below Average' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${levelColor}`}>
            {row.performanceLevel}
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

  const subjectColumns = [
    { header: 'Subject', accessor: 'name' },
    { header: 'Average Grade', accessor: 'averageGrade' },
    { header: 'Pass Rate (%)', accessor: 'passRate' },
    { header: 'Highest Grade', accessor: 'highestGrade' },
    { header: 'Lowest Grade', accessor: 'lowestGrade' },
    { header: 'Standard Deviation', accessor: 'standardDeviation' },
    {
      header: 'Details',
      accessor: 'actions',
      cell: (row) => (
        <Link 
          to={`/subjects/${row.id}`}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
        >
          View Subject
        </Link>
      )
    }
  ];

  const classColumns = [
    { header: 'Class', accessor: 'name' },
    { header: 'Students', accessor: 'studentCount' },
    { header: 'Average GPA', accessor: 'averageGPA' },
    { header: 'Pass Rate (%)', accessor: 'passRate' },
    { header: 'Highest Performer', accessor: 'highestPerformer' },
    { header: 'Performance Level', accessor: 'performanceLevel',
      cell: (row) => {
        const levelColor = 
          row.performanceLevel === 'Excellent' ? 'bg-green-100 text-green-800' :
          row.performanceLevel === 'Good' ? 'bg-blue-100 text-blue-800' :
          row.performanceLevel === 'Average' ? 'bg-yellow-100 text-yellow-800' :
          row.performanceLevel === 'Below Average' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${levelColor}`}>
            {row.performanceLevel}
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

  // Mock data for development
  const mockReportData = {
    students: [
      {
        id: 1,
        name: 'Jane Cooper',
        className: '10A',
        averageGPA: 3.8,
        passingSubjects: 10,
        failingSubjects: 0,
        performanceLevel: 'Excellent'
      },
      {
        id: 2,
        name: 'Michael Brown',
        className: '9B',
        averageGPA: 2.5,
        passingSubjects: 7,
        failingSubjects: 3,
        performanceLevel: 'Average'
      },
      {
        id: 3,
        name: 'Sarah Wilson',
        className: '10A',
        averageGPA: 1.9,
        passingSubjects: 4,
        failingSubjects: 6,
        performanceLevel: 'Poor'
      },
      {
        id: 4,
        name: 'David Johnson',
        className: '9B',
        averageGPA: 3.2,
        passingSubjects: 9,
        failingSubjects: 1,
        performanceLevel: 'Good'
      },
      {
        id: 5,
        name: 'Emily Davis',
        className: '10A',
        averageGPA: 3.5,
        passingSubjects: 10,
        failingSubjects: 0,
        performanceLevel: 'Good'
      }
    ],
    subjects: [
      {
        id: 1,
        name: 'Mathematics',
        averageGrade: 78.5,
        passRate: 85,
        highestGrade: 98,
        lowestGrade: 45,
        standardDeviation: 12.3
      },
      {
        id: 2,
        name: 'Science',
        averageGrade: 82.3,
        passRate: 90,
        highestGrade: 99,
        lowestGrade: 55,
        standardDeviation: 10.1
      },
      {
        id: 3,
        name: 'History',
        averageGrade: 76.2,
        passRate: 82,
        highestGrade: 95,
        lowestGrade: 40,
        standardDeviation: 14.5
      },
      {
        id: 4,
        name: 'Literature',
        averageGrade: 81.7,
        passRate: 88,
        highestGrade: 97,
        lowestGrade: 50,
        standardDeviation: 11.2
      }
    ],
    classes: [
      {
        id: 1,
        name: '10A',
        studentCount: 35,
        averageGPA: 3.4,
        passRate: 92,
        highestPerformer: 'Jane Cooper',
        performanceLevel: 'Good'
      },
      {
        id: 2,
        name: '9B',
        studentCount: 32,
        averageGPA: 2.9,
        passRate: 78,
        highestPerformer: 'David Johnson',
        performanceLevel: 'Average'
      },
      {
        id: 3,
        name: '11C',
        studentCount: 30,
        averageGPA: 3.7,
        passRate: 95,
        highestPerformer: 'Alex Rodriguez',
        performanceLevel: 'Excellent'
      }
    ],
    gradeDistribution: {
      labels: ['A (90-100%)', 'B (80-89%)', 'C (70-79%)', 'D (60-69%)', 'F (<60%)'],
      datasets: [
        {
          label: 'Number of Students',
          data: [42, 65, 48, 25, 20],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1
        }
      ]
    },
    subjectPerformance: {
      labels: ['Mathematics', 'Science', 'History', 'Literature', 'Physical Education', 'Arts'],
      datasets: [
        {
          label: 'Average Score',
          data: [78.5, 82.3, 76.2, 81.7, 89.5, 85.2],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    },
    performanceTrend: {
      labels: ['Term 1', 'Term 2', 'Term 3', 'Term 4'],
      datasets: [
        {
          label: 'Class 10A',
          data: [82, 84, 86, 88],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true
        },
        {
          label: 'Class 9B',
          data: [75, 73, 78, 76],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true
        },
        {
          label: 'Class 11C',
          data: [85, 88, 90, 92],
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          fill: true
        }
      ]
    },
    passRateByClass: {
      labels: ['10A', '9B', '11C', '10B', '9A', '11A'],
      datasets: [
        {
          label: 'Pass Rate (%)',
          data: [92, 78, 95, 85, 82, 88],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading academic performance data...</div>;
  
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
            <h1 className="text-2xl font-bold text-gray-800">Academic Performance Reports</h1>
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
          View and analyze academic performance metrics across students, classes, and subjects.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Reports</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              name="subjectId"
              value={filters.subjectId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Subjects</option>
              <option value="1">Mathematics</option>
              <option value="2">Science</option>
              <option value="3">History</option>
              <option value="4">Literature</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <option value="last_academic_year">Last Academic Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Performance Metric</label>
            <select
              name="performanceMetric"
              value={filters.performanceMetric}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="gpa">GPA</option>
              <option value="pass_rate">Pass Rate</option>
              <option value="average_grade">Average Grade</option>
              <option value="improvement">Improvement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 text-sm">Average GPA</h3>
            <span className="text-green-500 text-xs font-semibold">+4.5%</span>
          </div>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-gray-800">3.2</p>
            <p className="text-gray-500 text-sm ml-2">/ 4.0</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Based on current semester data</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 text-sm">Pass Rate</h3>
            <span className="text-green-500 text-xs font-semibold">+2.3%</span>
          </div>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-gray-800">85.4%</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Overall pass rate across subjects</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 text-sm">Top Performer</h3>
          </div>
          <div className="flex items-end">
            <p className="text-lg font-bold text-gray-800">Jane Cooper</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Class 10A, GPA: 3.8/4.0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 text-sm">Students at Risk</h3>
            <span className="text-red-500 text-xs font-semibold">+1.2%</span>
          </div>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-gray-800">15.2%</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Students with failing grades in 2+ subjects</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Grade Distribution</h2>
          <ChartComponent 
            type="pie" 
            data={reportData?.gradeDistribution} 
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
          <h2 className="text-lg font-semibold mb-4">Subject Performance</h2>
          <ChartComponent 
            type="bar" 
            data={reportData?.subjectPerformance}
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
                  max: 100,
                  title: {
                    display: true,
                    text: 'Average Score'
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Performance Trend</h2>
        <ChartComponent 
          type="line" 
          data={reportData?.performanceTrend}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                min: 60,
                max: 100,
                title: {
                  display: true,
                  text: 'Average Score'
                }
              }
            }
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Pass Rate by Class</h2>
        <ChartComponent 
          type="bar" 
          data={reportData?.passRateByClass}
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
                max: 100,
                title: {
                  display: true,
                  text: 'Pass Rate (%)'
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
                className={`inline-block p-4 ${filters.viewTab === 'students' || !filters.viewTab ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setFilters(prev => ({ ...prev, viewTab: 'students' }))}
              >
                Students Performance
              </button>
            </li>
            <li className="mr-2">
              <button 
                className={`inline-block p-4 ${filters.viewTab === 'classes' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setFilters(prev => ({ ...prev, viewTab: 'classes' }))}
              >
                Classes Performance
              </button>
            </li>
            <li className="mr-2">
              <button 
                className={`inline-block p-4 ${filters.viewTab === 'subjects' ? 'text-blue-600 border-b-2 border-blue-600 active' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setFilters(prev => ({ ...prev, viewTab: 'subjects' }))}
              >
                Subjects Performance
              </button>
            </li>
          </ul>
        </div>
        
        {(!filters.viewTab || filters.viewTab === 'students') && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Student Academic Performance</h2>
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
            <h2 className="text-lg font-semibold mb-4">Class Performance Comparison</h2>
            <DataTable 
              columns={classColumns} 
              data={reportData?.classes} 
              pagination={true} 
              itemsPerPage={10} 
            />
          </div>
        )}
        
        {filters.viewTab === 'subjects' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Subject Performance Analysis</h2>
            <DataTable 
              columns={subjectColumns} 
              data={reportData?.subjects} 
              pagination={true} 
              itemsPerPage={10} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicPerformanceReport;
