// File: ClassDetail.jsx - View details of a specific class
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { fetchClassById, fetchStudentsByClass } from '../../services/api';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const { hasPermission } = useAuth();

  useEffect(() => {
    const getClassDetails = async () => {
      try {
        setLoading(true);
        // In production, replace with actual API call
        const response = await fetchClassById(id);
        setClassData(response?.data || mockClass);
        
        // Fetch students in this class
        const studentsResponse = await fetchStudentsByClass(id);
        // Process the returned data to get the expected student structure
        const processedStudents = studentsResponse?.data?.map(enrollment => ({
          student_id: enrollment.student_id,
          student_code: enrollment.student?.student_code,
          date_of_birth: enrollment.student?.date_of_birth,
          gender: enrollment.student?.gender,
          address: enrollment.student?.current_address,
          gpa: enrollment.student?.gpa, // Note: Add this if available in API
          dropout_risk: enrollment.student?.dropout_risk, // Note: Add this if available in API
          attendance_rate: enrollment.student?.attendance_rate,
          academic_status: enrollment.student?.academic_status,
          previous_academic_warning: enrollment.student?.previous_academic_warning,
          enrollment_status: enrollment.status,
          user: enrollment.student?.user
        })) || mockStudents;
        
        setStudents(processedStudents);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching class details:', err);
        setError('Failed to fetch class details');
        setLoading(false);
        // For development, use mock data if API fails
        setClassData(mockClass);
        setStudents(mockStudents);
      }
    };

    getClassDetails();
  }, [id]);
  
  // Define columns for students table  
  const studentColumns = [
    { header: 'Student ID', accessor: 'student_id' },
    { header: 'Name', accessor: row => row.user?.full_name },
    { header: 'Email', accessor: row => row.user?.email },
    { header: 'Student Code', accessor: 'student_code' },
    { header: 'Status', accessor: 'academic_status',
      cell: (row) => {
        const status = row.academic_status || 'active';
        const statusColor = 
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          status === 'probation' ? 'bg-orange-100 text-orange-800' :
          status === 'suspended' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    { header: 'Attendance', accessor: 'attendance_rate',
      cell: (row) => {
        const rate = row.attendance_rate || 0;
        const rateColor = 
          rate >= 90 ? 'bg-green-100 text-green-800' :
          rate >= 80 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${rateColor}`}>
            {rate}%
          </span>
        );
      }
    },
    { header: 'Warnings', accessor: 'previous_academic_warning' },
    { header: 'Enrollment', accessor: 'enrollment_status',
      cell: (row) => {
        const status = row.enrollment_status || 'active';
        const statusColor = 
          status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'active' ? 'bg-blue-100 text-blue-800' :
          status === 'dropped' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
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
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            View
          </Link>
          {hasPermission(PERMISSIONS.ATTENDANCE_EDIT) && (
            <button
              onClick={() => navigate(`/attendance/take?studentId=${row.student_id}&classId=${id}`)}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Điểm Danh
            </button>
          )}
          {hasPermission(PERMISSIONS.DISCIPLINARY_EDIT) && (
            <button
              onClick={() => navigate(`/disciplinary/add?studentId=${row.student_id}`)}
              className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Kỷ Luật
            </button>
          )}
        </div>
      )
    }
  ];

  // Performance data for charts
  const performanceData = {
    labels: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'],
    datasets: [
      {
        label: 'Number of Students',
        data: [5, 10, 15, 7, 3],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const attendanceData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        label: 'Attendance Distribution',
        data: [85, 10, 5],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  // Mock data for development
  const mockClass = {
    class_id: 1,
    class_name: 'HIST101 - 2024-2025 - 2',
    class_description: 'World History - 2024-2025 - Semester 2',
    academic_year: '2024-2025',
    semester: '2',
    department: 'History',
    start_date: '2025-01-15',
    end_date: '2025-05-15',
    schedule: JSON.stringify([
      { day: 'Friday', start_time: '14:00', end_time: '16:00', room: 'C227' },
      { day: 'Tuesday', start_time: '09:00', end_time: '11:00', room: 'D131' }
    ]),
    max_students: 36,
    current_students: 23,
    teacher_id: 4,
    teacher: {
      teacher_id: 4,
      teacher_code: 'TCH1003',
      department: 'History',
      position: 'Associate Professor',
      user: {
        user_id: 5,
        full_name: 'Chad Howell',
        email: 'teacher4@example.com',
        role: 'teacher'
      }
    },
    averageGPA: 3.2,
    averageAttendance: 92
  };
  const mockStudents = [
    { 
      student_id: 1,
      student_code: 'STU1001',
      date_of_birth: '2004-05-15',
      gender: 'female',
      address: '123 Main St',
      gpa: 3.8,
      dropout_risk: 12,
      user: {
        user_id: 10,
        full_name: 'Jane Cooper',
        email: 'jane.cooper@example.com',
        role: 'student'
      }
    },
    { 
      student_id: 2,
      student_code: 'STU1002',
      date_of_birth: '2004-08-22',
      gender: 'male',
      address: '456 Oak Ave',
      gpa: 2.9,
      dropout_risk: 45,
      user: {
        user_id: 11,
        full_name: 'Michael Brown',
        email: 'michael.brown@example.com',
        role: 'student'
      }
    },
    { 
      student_id: 3,
      student_code: 'STU1003',
      date_of_birth: '2004-02-10',
      gender: 'female',
      address: '789 Pine St',
      gpa: 2.4,
      dropout_risk: 78,
      user: {
        user_id: 12,
        full_name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        role: 'student'
      }
    },
  ];

  if (loading) return <div className="flex justify-center p-8">Loading class details...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  if (!classData) return <div className="bg-yellow-100 p-4 text-yellow-700 rounded-md">Class not found</div>;
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">          <Link 
            to="/classes" 
            className="mr-4 text-blue-500 hover:text-blue-700"
          >
            ← Back to Classes
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Class: {classData.class_name}</h1>
        </div>
          <div className="flex gap-2">
          {hasPermission(PERMISSIONS.DROPOUT_RISK_VIEW) && (
            <Link
              to={`/classes/${id}/risk-analysis`}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1"
            >
              <span>Phân tích Nguy cơ Bỏ học</span>
            </Link>
          )}
          
          {hasPermission(PERMISSIONS.ATTENDANCE_EDIT) && (
            <button
              onClick={() => navigate(`/attendance/take?classId=${id}`)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1"
            >
              <span>Điểm Danh Lớp</span>
            </button>
          )}
          
          {hasPermission(PERMISSIONS.CLASSES_EDIT) && (
            <button
              onClick={() => navigate(`/classes/edit/${id}`)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
            >
              <span>Chỉnh Sửa</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">          <div>
            <h2 className="text-xl font-semibold mb-4">Class Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Class Name:</span> {classData.class_name}</p>
              <p><span className="font-medium">Department:</span> {classData.department}</p>
              <p><span className="font-medium">Academic Year:</span> {classData.academic_year}</p>
              <p><span className="font-medium">Semester:</span> {classData.semester}</p>
              <p><span className="font-medium">Teacher:</span> {classData.teacher?.user?.full_name}</p>
              <p><span className="font-medium">Description:</span> {classData.class_description}</p>
              <p><span className="font-medium">Period:</span> {classData.start_date} to {classData.end_date}</p>
              <p><span className="font-medium">Schedule:</span></p>
              <div className="ml-4">
                {typeof classData.schedule === 'string' && JSON.parse(classData.schedule).map((item, index) => (
                  <p key={index}>
                    {item.day}: {item.start_time} - {item.end_time}, Room: {item.room}
                  </p>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Class Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{classData.current_students}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Max Students</p>
                <p className="text-2xl font-bold text-green-600">{classData.max_students}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600">{classData.averageAttendance}%</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-orange-600">83%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 ${activeTab === 'students' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('students')}
            >
              Students
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'performance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('performance')}
            >
              Performance Analysis
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'attendance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('attendance')}
            >
              Attendance Analysis
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'students' && (
            <div>
              <DataTable 
                columns={studentColumns} 
                data={students} 
                pagination={true} 
                itemsPerPage={10} 
              />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Academic Performance Distribution</h3>
                <ChartComponent 
                  type="pie" 
                  data={performanceData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      title: {
                        display: true,
                        text: 'Student Performance Distribution'
                      }
                    }
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Subject Performance</h3>
                <ChartComponent 
                  type="bar" 
                  data={{
                    labels: ['Math', 'Science', 'History', 'Language', 'Arts'],
                    datasets: [
                      {
                        label: 'Average Score',
                        data: [78, 81, 74, 85, 88],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                      }
                    ]
                  }}
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
          )}

          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Attendance Overview</h3>
                <ChartComponent 
                  type="doughnut" 
                  data={attendanceData}
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
              <div>
                <h3 className="text-lg font-medium mb-3">Monthly Attendance</h3>
                <ChartComponent 
                  type="line" 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                      {
                        label: 'Attendance Rate (%)',
                        data: [95, 92, 88, 90, 91, 93, 92, 94, 91, 89, 87, 85],
                        fill: false,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 70,
                        max: 100
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;
