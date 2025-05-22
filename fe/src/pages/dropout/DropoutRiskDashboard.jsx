// File: DropoutRiskDashboard.jsx - Dashboard showing dropout risk analytics
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { dropoutRiskService } from '../../services/dropoutRiskService';

const DropoutRiskDashboard = () => {
  const [studentsAtRisk, setStudentsAtRisk] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    riskLevel: 'all',
    gradeLevel: 'all',
    classId: 'all',
  });
  const { hasPermission } = useAuth();
  
  // Function to process API data into chart statistics
  const processDataForStats = (students) => {
    if (!students || !Array.isArray(students) || students.length === 0) {
      console.warn('No valid student data to process for statistics');
      return {
        riskDistribution: {
          labels: ['High Risk (70-100%)', 'Medium Risk (30-69%)', 'Low Risk (0-29%)'],
          datasets: [{ label: 'Students by Risk Category', data: [0, 0, 0], backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 205, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'], borderColor: ['rgb(255, 99, 132)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)'], borderWidth: 1 }]
        },
        riskFactors: {
          labels: ['Low Academic Performance', 'Poor Attendance', 'Disciplinary Issues', 'Low Family Income', 'Previous Warnings'],
          datasets: [{ label: 'Contributing Factors', data: [0, 0, 0, 0, 0], backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgb(54, 162, 235)', borderWidth: 1 }]
        },
        monthlyTrend: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{ label: 'Average Risk Percentage', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], fill: false, borderColor: 'rgb(75, 192, 192)', tension: 0.1 }]
        }
      };
    }

    // Count risk levels
    const highRisk = students.filter(s => {
      const riskPercentage = typeof s.risk_percentage === 'number' ? 
        s.risk_percentage : parseFloat(s.risk_percentage || 0);
      return riskPercentage >= 70;
    }).length;
    
    const mediumRisk = students.filter(s => {
      const riskPercentage = typeof s.risk_percentage === 'number' ? 
        s.risk_percentage : parseFloat(s.risk_percentage || 0);
      return riskPercentage >= 30 && riskPercentage < 70;
    }).length;
    
    const lowRisk = students.filter(s => {
      const riskPercentage = typeof s.risk_percentage === 'number' ? 
        s.risk_percentage : parseFloat(s.risk_percentage || 0);
      return riskPercentage < 30;
    }).length;
    
    // Count risk factors
    const factorCounts = {
      'Low Academic Performance': 0,
      'Poor Attendance': 0,
      'Disciplinary Issues': 0,
      'Low Family Income': 0,
      'Previous Warnings': 0
    };
    
    // Analyze risk factors - handle different data formats
    students.forEach(student => {
      const factors = student.risk_factors || {};
      
      // Boolean format
      if (factors.low_gpa === true || factors.low_academic_performance === true) 
        factorCounts['Low Academic Performance']++;
      if (factors.poor_attendance === true) 
        factorCounts['Poor Attendance']++;
      if (factors.disciplinary_issues === true) 
        factorCounts['Disciplinary Issues']++;
      if (factors.financial_issues === true || factors.low_family_income === true) 
        factorCounts['Low Family Income']++;
      if (factors.academic_warning === true || factors.previous_warnings === true) 
        factorCounts['Previous Warnings']++;
        
      // Numeric format (old format support)
      if (factors.academic_performance !== undefined && factors.academic_performance < 6) 
        factorCounts['Low Academic Performance']++;
      if (factors.attendance !== undefined && factors.attendance < 80) 
        factorCounts['Poor Attendance']++;
      if (factors.disciplinary_records !== undefined && factors.disciplinary_records > 0) 
        factorCounts['Disciplinary Issues']++;
      if (factors.family_income === 'low') 
        factorCounts['Low Family Income']++;
      if (factors.previous_warnings !== undefined && factors.previous_warnings > 0) 
        factorCounts['Previous Warnings']++;
    });
    
    // Generate trend data (mock for now as we don't have historical data)
    // In a real implementation, this would be fetched from the API
    const monthlyTrend = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Average Risk Percentage',
          data: [30, 32, 35, 40, 42, 45, 43, 41, 46, 50, 52, 48],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
    
    return {
      riskDistribution: {
        labels: ['High Risk (70-100%)', 'Medium Risk (30-69%)', 'Low Risk (0-29%)'],
        datasets: [
          {
            label: 'Students by Risk Category',
            data: [highRisk, mediumRisk, lowRisk],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 205, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
            ],
            borderWidth: 1
          }
        ]
      },
      riskFactors: {
        labels: Object.keys(factorCounts),
        datasets: [
          {
            label: 'Contributing Factors',
            data: Object.values(factorCounts),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }
        ]
      },
      monthlyTrend
    };
  };
  useEffect(() => {
    const getDropoutRiskData = async () => {
      try {
        setLoading(true);
        
        // Using the dropout risk service
        const response = await dropoutRiskService.getAllRisks({ 
          risk_level: filter.riskLevel !== 'all' ? filter.riskLevel : undefined,
          grade_level: filter.gradeLevel !== 'all' ? filter.gradeLevel : undefined,
          class_id: filter.classId !== 'all' ? filter.classId : undefined
        });
        
        console.log('Dropout risk data response:', response);
        
        // Process data for dashboard
        if (response && response.data) {
          // Extract students data
          const students = Array.isArray(response.data) ? response.data : [];
          
          // Calculate statistics
          const stats = processDataForStats(students);
          
          setStudentsAtRisk(students);
          setStatsData(stats);
        } else {
          // If no data is returned, use mock data for development
          setStudentsAtRisk(mockStudentsAtRisk);
          setStatsData(mockStatsData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dropout risk data:', err);
        setError('Failed to fetch dropout risk data: ' + (err.message || 'Unknown error'));
        setLoading(false);
        
        // For development, use mock data if API fails
        setStudentsAtRisk(mockStudentsAtRisk);
        setStatsData(mockStatsData);
      }
    };

    getDropoutRiskData();
  }, [filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const columns = [
    { header: 'Risk ID', accessor: 'risk_id' },
    { 
      header: 'Student Name', 
      accessor: 'student',
      cell: (row) => {
        const student = row.student || {};
        const fullName = student.user ? student.user.full_name : 
                         (student.last_name && student.first_name) ? 
                         `${student.last_name} ${student.first_name}` : 
                         'Unknown';
                         
        return (
          <Link 
            to={`/students/${student.student_id || row.student_id}`}
            className="text-blue-600 hover:underline"
          >
            {fullName}
          </Link>
        );
      }
    },
    { 
      header: 'Student Code', 
      accessor: 'student',
      cell: (row) => {
        const student = row.student || {};
        return student.student_code || 'N/A';
      }
    },
    { 
      header: 'Grade Level', 
      accessor: 'student',
      cell: (row) => {
        const student = row.student || {};
        return student.entry_year ? 
          `Grade ${student.entry_year - 2011}` : 
          'N/A';
      }
    },
    { 
      header: 'Risk Percentage', 
      accessor: 'risk_percentage',
      cell: (row) => {
        const riskPercentage = typeof row.risk_percentage === 'number' ? 
          row.risk_percentage : 
          parseFloat(row.risk_percentage || 0);
          
        const riskColor = 
          riskPercentage < 30 ? 'bg-green-100 text-green-800' :
          riskPercentage < 70 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
            {riskPercentage.toFixed(1)}%
          </span>
        );
      }
    },
    { 
      header: 'Risk Factors', 
      accessor: 'risk_factors',
      cell: (row) => {
        const factors = [];
        
        // Handle different formats of risk factors
        if (row.risk_factors) {
          // Boolean format
          if (row.risk_factors.low_gpa === true) 
            factors.push('Low Academic Performance');
          if (row.risk_factors.poor_attendance === true) 
            factors.push('Poor Attendance');
          if (row.risk_factors.disciplinary_issues === true) 
            factors.push('Disciplinary Issues');
          if (row.risk_factors.financial_issues === true) 
            factors.push('Low Family Income');
          if (row.risk_factors.academic_warning === true) 
            factors.push('Previous Warnings');
            
          // Numeric format (old format support)
          if (row.risk_factors.academic_performance && row.risk_factors.academic_performance < 6) 
            factors.push('Low Academic Performance');
          if (row.risk_factors.attendance && row.risk_factors.attendance < 80) 
            factors.push('Poor Attendance');
          if (row.risk_factors.disciplinary_records && row.risk_factors.disciplinary_records > 0) 
            factors.push('Disciplinary Issues');
          if (row.risk_factors.family_income === 'low') 
            factors.push('Low Family Income');
          if (row.risk_factors.previous_warnings && row.risk_factors.previous_warnings > 0) 
            factors.push('Previous Warnings');
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {factors.length > 0 ? factors.map((factor, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
              >
                {factor}
              </span>
            )) : (
              <span className="text-gray-500 text-xs">No significant factors</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link 
            to={`/dropout-risk/${row.risk_id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            View Details
          </Link>
          {hasPermission(PERMISSIONS.DROPOUT_RISK_EDIT) && (
            <Link 
              to={`/dropout-risk/interventions?studentId=${row.student.student_id}`}
              className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm"
            >
              Add Intervention
            </Link>
          )}
        </div>
      )
    }
  ];

  // Mock data for development
  const mockStudentsAtRisk = [
    {
      risk_id: 1,
      student_id: 1,
      risk_percentage: 87.0,
      analysis_date: '2023-12-31T00:00:00',
      risk_factors: {
        academic_performance: 7.355,
        attendance: 99.52,
        disciplinary_records: 0,
        family_income: 'high',
        previous_warnings: 1
      },
      student: {
        student_code: 'SV100000',
        date_of_birth: '2023-12-31',
        gender: 'other',
        hometown: 'East Melissaborough',
        current_address: '7271 Osborn Road Apt. 269\nEast Danielbury, IL 15136-9995',
        family_income_level: 'high',
        family_background: 'Accusantium architecto saepe necessitatibus praesentium. Harum porro eum quos assumenda dolorem asperiores dolorum.',
        scholarship_status: 'full',
        scholarship_amount: 3489942.99,
        health_condition: null,
        mental_health_status: null,
        entry_year: 2022,
        expected_graduation_year: 2026,
        student_id: 1,
        user: {
          username: 'student1',
          full_name: 'Nathan Miller',
          email: 'student1@example.com',
          phone: '(814)328-0538x07146',
          role: 'student',
          profile_picture: null,
          user_id: 22,
          account_status: 'active',
          last_login: '2025-05-22T04:32:57',
          created_at: '2025-05-21T22:28:56',
          updated_at: '2025-05-22T11:32:57'
        },
        attendance_rate: 99.52,
        previous_academic_warning: 1,
        academic_status: 'suspended'
      }
    },
    {
      risk_id: 2,
      student_id: 2,
      risk_percentage: 65.5,
      analysis_date: '2023-12-15T00:00:00',
      risk_factors: {
        academic_performance: 5.2,
        attendance: 75.0,
        disciplinary_records: 2,
        family_income: 'low',
        previous_warnings: 0
      },
      student: {
        student_code: 'SV100001',
        date_of_birth: '2003-05-10',
        gender: 'male',
        hometown: 'Hanoi',
        current_address: '123 Hanoi Street',
        family_income_level: 'low',
        family_background: 'Stable family',
        scholarship_status: 'partial',
        scholarship_amount: 5000000,
        health_condition: 'good',
        mental_health_status: 'stable',
        entry_year: 2021,
        expected_graduation_year: 2025,
        student_id: 2,
        user: {
          username: 'student2',
          full_name: 'Nguyen Van A',
          email: 'student2@example.com',
          phone: '(814)328-0538x07147',
          role: 'student',
          profile_picture: null,
          user_id: 23,
          account_status: 'active',
          last_login: '2025-05-20T10:00:00',
          created_at: '2025-05-21T22:28:56',
          updated_at: '2025-05-21T22:28:56'
        },
        attendance_rate: 75.0,
        previous_academic_warning: 0,
        academic_status: 'good'
      }
    }
  ];

  const mockStatsData = {
    riskDistribution: {
      labels: ['High Risk (70-100%)', 'Medium Risk (30-69%)', 'Low Risk (0-29%)'],
      datasets: [
        {
          label: 'Students by Risk Category',
          data: [10, 25, 65],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
          ],
          borderWidth: 1
        }
      ]
    },
    riskFactors: {
      labels: ['Low Academic Performance', 'Poor Attendance', 'Disciplinary Issues', 'Low Family Income', 'Previous Warnings'],
      datasets: [
        {
          label: 'Contributing Factors',
          data: [20, 15, 10, 8, 5],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    },
    monthlyTrend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Average Risk Percentage',
          data: [30, 32, 35, 40, 42, 45, 43, 41, 46, 50, 52, 48],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading dropout risk data...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dropout Risk Analysis</h1>
        <p className="text-gray-600">
          Monitor and identify students at risk of dropping out based on various indicators.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">High Risk Students</h2>
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <span className="text-red-600 text-2xl font-bold">{statsData?.riskDistribution.datasets[0].data[0] || 0}</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Students with risk percentage above 70%</p>
              <p className="text-sm text-red-600 font-medium">Immediate attention required</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Medium Risk Students</h2>
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
              <span className="text-yellow-600 text-2xl font-bold">{statsData?.riskDistribution.datasets[0].data[1] || 0}</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Students with risk percentage 30-69%</p>
              <p className="text-sm text-yellow-600 font-medium">Close monitoring needed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Low Risk Students</h2>
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <span className="text-green-600 text-2xl font-bold">{statsData?.riskDistribution.datasets[0].data[2] || 0}</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Students with risk percentage below 30%</p>
              <p className="text-sm text-green-600 font-medium">Performing well</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Risk Distribution</h2>
          <ChartComponent 
            type="pie" 
            data={statsData?.riskDistribution} 
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
          <h2 className="text-lg font-semibold mb-4">Top Risk Factors</h2>
          <ChartComponent 
            type="bar" 
            data={statsData?.riskFactors}
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
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Risk Percentage Trend Over Time</h2>
        <ChartComponent 
          type="line" 
          data={statsData?.monthlyTrend}
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
                max: 100
              }
            }
          }}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select
              name="riskLevel"
              value={filter.riskLevel}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="high">High Risk (70-100%)</option>
              <option value="medium">Medium Risk (30-69%)</option>
              <option value="low">Low Risk (0-29%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <select
              name="gradeLevel"
              value={filter.gradeLevel}
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
              value={filter.classId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Classes</option>
              <option value="9A">9A</option>
              <option value="9B">9B</option>
              <option value="10A">10A</option>
              <option value="10B">10B</option>
              <option value="11A">11A</option>
              <option value="11B">11B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students At Risk Table */}
      <div className="bg-white rounded-lg shadow-md p-6">        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Students at Risk</h2>
          <div className="flex gap-2">
            <Link
              to="/dropout-risk/high-risk"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              View High Risk Students
            </Link>
            {hasPermission(PERMISSIONS.DROPOUT_RISK_EDIT) && (
              <Link
                to="/dropout-risk/interventions"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Manage Interventions
              </Link>
            )}
          </div>
        </div>
        <DataTable 
          columns={columns} 
          data={studentsAtRisk} 
          pagination={true} 
          itemsPerPage={10} 
        />
      </div>
    </div>
  );
};

export default DropoutRiskDashboard;