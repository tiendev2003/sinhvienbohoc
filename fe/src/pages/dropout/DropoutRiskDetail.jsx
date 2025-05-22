// File: DropoutRiskDetail.jsx - Display details of a student's dropout risk
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { fetchDropoutRiskById, fetchInterventionsByStudent, fetchStudentById } from '../../services/api';

const DropoutRiskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const getStudentRiskData = async () => {
      try {
        setLoading(true);
        // In production, replace with actual API calls
        const studentResponse = await fetchStudentById(id);
        const riskResponse = await fetchDropoutRiskById(id);
        const interventionsResponse = await fetchInterventionsByStudent(id);
        
        setStudentData(studentResponse?.data || mockStudentData);
        setRiskData(riskResponse?.data || mockRiskData);
        setInterventions(interventionsResponse?.data || mockInterventions);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student risk data:', err);
        setError('Failed to fetch student risk data');
        setLoading(false);
        // For development, use mock data
        setStudentData(mockStudentData);
        setRiskData(mockRiskData);
        setInterventions(mockInterventions);
      }
    };

    getStudentRiskData();
  }, [id]);

  const interventionColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Type', accessor: 'type' },
    { header: 'Description', accessor: 'description' },
    { header: 'Conducted By', accessor: 'conductedBy' },
    { header: 'Status', accessor: 'status',
      cell: (row) => {
        const statusColor = 
          row.status === 'Completed' ? 'bg-green-100 text-green-800' :
          row.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
          row.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800';
        
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
          {hasPermission(PERMISSIONS.DROPOUT_RISK_EDIT) && (
            <>
              <button 
                onClick={() => navigate(`/dropout-risk/interventions?id=${row.id}&edit=true`)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => alert(`Mark intervention ${row.id} as complete`)}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                disabled={row.status === 'Completed'}
              >
                Mark Complete
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  // Mock data for development
  const mockStudentData = {
    id: 1,
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    className: '10A',
    gradeLevel: 10,
    parentName: 'Robert Cooper',
    parentContact: '0987654321',
    enrollmentDate: '2023-09-01',
  };

  const mockRiskData = {
    riskScore: 82,
    riskLevel: 'High',
    lastUpdated: '2023-11-15',
    riskFactors: [
      {
        factor: 'Poor Attendance',
        impact: 'High',
        details: 'Missed 12 days in the last month (75% attendance rate)'
      },
      {
        factor: 'Low GPA',
        impact: 'Medium',
        details: 'Current GPA: 1.8/4.0, down from 2.5/4.0 in previous semester'
      },
      {
        factor: 'Disciplinary Issues',
        impact: 'Medium',
        details: '3 disciplinary incidents in the last 60 days'
      },
      {
        factor: 'Family Issues',
        impact: 'High',
        details: 'Recently moved homes, parent reported financial difficulties'
      }
    ],
    academicHistory: {
      labels: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Current'],
      datasets: [
        {
          label: 'GPA (out of 4.0)',
          data: [3.2, 2.8, 2.5, 2.1, 1.8],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true
        }
      ]
    },
    attendanceHistory: {
      labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      datasets: [
        {
          label: 'Attendance Rate (%)',
          data: [95, 90, 85, 80, 78, 75],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true
        }
      ]
    },
    behaviorHistory: {
      labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      datasets: [
        {
          label: 'Disciplinary Incidents',
          data: [0, 1, 1, 2, 2, 3],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          type: 'line'
        }
      ]
    }
  };

  const mockInterventions = [
    {
      id: 1,
      date: '2023-10-15',
      type: 'Counseling Session',
      description: 'Initial assessment of academic challenges and family situation',
      conductedBy: 'Dr. Smith (School Counselor)',
      status: 'Completed'
    },
    {
      id: 2,
      date: '2023-10-30',
      type: 'Parent-Teacher Conference',
      description: 'Discussion about academic progress and attendance issues',
      conductedBy: 'Ms. Johnson (Class Teacher)',
      status: 'Completed'
    },
    {
      id: 3,
      date: '2023-11-15',
      type: 'Academic Support',
      description: 'Assignment of peer tutor for math and science subjects',
      conductedBy: 'Mr. Williams (Academic Coordinator)',
      status: 'In Progress'
    },
    {
      id: 4,
      date: '2023-12-01',
      type: 'Counseling Session',
      description: 'Follow-up session to discuss progress and challenges',
      conductedBy: 'Dr. Smith (School Counselor)',
      status: 'Scheduled'
    }
  ];

  if (loading) return <div className="flex justify-center p-8">Loading student risk data...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  if (!studentData || !riskData) return <div className="bg-yellow-100 p-4 text-yellow-700 rounded-md">Student risk data not found</div>;

  const riskScoreColor = 
    riskData.riskScore < 30 ? 'bg-green-100 text-green-800 border-green-200' :
    riskData.riskScore < 70 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
    'bg-red-100 text-red-800 border-red-200';

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link 
          to="/dropout-risk" 
          className="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Back to Risk Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Dropout Risk Analysis: {studentData.name}</h1>
      </div>

      {/* Student Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Student Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Name:</span> {studentData.name}</p>
                <p><span className="font-medium">Email:</span> {studentData.email}</p>
                <p><span className="font-medium">Class:</span> {studentData.className}</p>
                <p><span className="font-medium">Grade Level:</span> {studentData.gradeLevel}</p>
              </div>
              <div>
                <p><span className="font-medium">Parent Name:</span> {studentData.parentName}</p>
                <p><span className="font-medium">Parent Contact:</span> {studentData.parentContact}</p>
                <p><span className="font-medium">Enrollment Date:</span> {studentData.enrollmentDate}</p>
                <p><span className="font-medium">Last Updated:</span> {riskData.lastUpdated}</p>
              </div>
            </div>
          </div>
          <div>
            <div className={`p-6 rounded-lg border-2 ${riskScoreColor} flex flex-col items-center justify-center h-full`}>
              <h3 className="text-lg font-semibold mb-2">Current Risk Score</h3>
              <div className="w-32 h-32 rounded-full flex items-center justify-center border-4 bg-white border-current">
                <span className="text-4xl font-bold">{riskData.riskScore}%</span>
              </div>
              <p className="mt-3 font-semibold">{riskData.riskLevel} Risk Level</p>
              {hasPermission(PERMISSIONS.DROPOUT_RISK_EDIT) && (
                <button
                  onClick={() => navigate(`/dropout-risk/interventions?studentId=${id}`)}
                  className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 w-full"
                >
                  Add Intervention
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Risk Factors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {riskData.riskFactors.map((factor, index) => {
            const impactColor = 
              factor.impact === 'High' ? 'bg-red-100' :
              factor.impact === 'Medium' ? 'bg-yellow-100' :
              'bg-blue-100';

            return (
              <div key={index} className={`p-4 rounded-lg ${impactColor} border border-gray-200`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{factor.factor}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    factor.impact === 'High' ? 'bg-red-200 text-red-800' :
                    factor.impact === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {factor.impact} Impact
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{factor.details}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Trends */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Historical Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Academic Performance</h3>
            <ChartComponent 
              type="line" 
              data={riskData.academicHistory}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 4.0,
                    title: {
                      display: true,
                      text: 'GPA'
                    }
                  }
                }
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Attendance Rate</h3>
            <ChartComponent 
              type="line" 
              data={riskData.attendanceHistory}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: false,
                    min: 70,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Attendance %'
                    }
                  }
                }
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Behavioral Incidents</h3>
            <ChartComponent 
              type="bar" 
              data={riskData.behaviorHistory}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Incidents'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Intervention History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Intervention History</h2>
          {hasPermission(PERMISSIONS.DROPOUT_RISK_EDIT) && (
            <button
              onClick={() => navigate(`/dropout-risk/interventions?studentId=${id}`)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add New Intervention
            </button>
          )}
        </div>
        {interventions.length > 0 ? (
          <DataTable 
            columns={interventionColumns} 
            data={interventions} 
            pagination={true} 
            itemsPerPage={5} 
          />
        ) : (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">No interventions have been recorded for this student yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropoutRiskDetail;
