// File: ClassDetail.jsx - View details of a specific class
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ChartComponent from '../../components/common/ChartComponent';
import DataTable from '../../components/common/DataTable';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import {
  fetchAttendanceByFilters,
  fetchClassById,
  fetchStudentsByClass,
  submitAttendance,
  updateAttendance
} from '../../services/api';
import { fetchSubjectsByClass } from '../../services/class_subject_api';
import { formatDate } from '../../utils/formatters';

const ClassDetail = () => {  
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const { hasPermission } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [attendanceError, setAttendanceError] = useState(null);

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
        
        // Fetch subjects for this class
        try {
          const subjectsResponse = await fetchSubjectsByClass(id);
          setSubjects(subjectsResponse?.data || []);
        } catch (err) {
          console.error('Error fetching subjects:', err);
        }
        
        // Get attendance history dates
        try {
          // Fetch all attendance records for this class to get unique dates
          const attendanceHistoryResponse = await fetchAttendanceByFilters({class_id: id});
          const records = attendanceHistoryResponse?.data || [];
          
          // Extract unique dates and sort them in descending order
          const uniqueDates = [...new Set(records.map(record => record.date))];
          uniqueDates.sort((a, b) => new Date(b) - new Date(a));
          
          setAttendanceDates(uniqueDates);
        } catch (err) {
          console.error('Error fetching attendance history:', err);
        }
        
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
    // We're using the fetchAttendanceData function below instead
    // Get attendance data for the selected date
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!id || !selectedDate) return;
      
      try {
        setAttendanceLoading(true);
        setAttendanceError(null);
        
        // Fetch attendance records for the selected date and class
        const response = await fetchAttendanceByFilters({
          class_id: id,
          date: selectedDate
        });
        
        const records = response?.data || [];
        setAttendanceRecords(records);
        
        // If we don't already have attendance dates, fetch them
        if (attendanceDates.length === 0) {
          // Fetch all attendance records for this class to get unique dates
          const historyResponse = await fetchAttendanceByFilters({class_id: id});
          const allRecords = historyResponse?.data || [];
          
          // Extract unique dates and sort them in descending order
          const uniqueDates = [...new Set(allRecords.map(record => record.date))];
          uniqueDates.sort((a, b) => new Date(b) - new Date(a));
          
          setAttendanceDates(uniqueDates);
        }
        
        setAttendanceLoading(false);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setAttendanceError('Failed to fetch attendance data for the selected date');
        setAttendanceLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, [id, selectedDate, attendanceDates.length]);

  // Helper function to get attendance status for a student
  const getStudentAttendanceStatus = (studentId) => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return { status: 'not-taken', displayText: 'Not Taken' };
    }
    
    const record = attendanceRecords.find(record => record.student_id === studentId);
    
    if (!record) {
      return { status: 'not-taken', displayText: 'Not Taken' };
    }
    
    return { 
      status: record.status, 
      displayText: record.status.charAt(0).toUpperCase() + record.status.slice(1),
      notes: record.notes,
      minutes_late: record.minutes_late
    };
  };
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
    // Get attendance toggle button style
  const getAttendanceToggleButtonStyle = (studentId) => {
    const attendance = getStudentAttendanceStatus(studentId);
    switch (attendance.status) {
      case 'present':
        return 'bg-green-500 hover:bg-green-600';
      case 'absent':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Get attendance toggle button text
  const getAttendanceToggleButtonText = (studentId) => {
    const attendance = getStudentAttendanceStatus(studentId);
    switch (attendance.status) {
      case 'present':
        return 'Mark Absent';
      case 'absent':
        return 'Mark Present';
      case 'late':
        return 'Mark Present';
      default:
        return 'Take Attendance';
    }
  };
  // Handle toggle attendance
  const handleToggleAttendance = async (studentId) => {
    if (!selectedDate) return;
    
    const currentStatus = getStudentAttendanceStatus(studentId);
    const newStatus = currentStatus.status === 'present' ? 'absent' : 'present';

    try {
      // Find the attendance record ID
      const record = attendanceRecords.find(r => r.student_id === studentId);
      if (!record?.attendance_id) {
        // If no attendance record exists, we need to create a new one
        const response = await submitAttendance({
          student_id: studentId,
          class_id: id,
          date: selectedDate,
          status: newStatus,
          minutes_late: 0,
          notes: ''
        });
        
        // Add the new record to the local state
        setAttendanceRecords(prev => [...prev, response.data]);
      } else {
        // Update existing attendance record
        await updateAttendance(record.attendance_id, {
          status: newStatus,
          minutes_late: record.minutes_late || 0,
          notes: record.notes || ''
        });
        
        // Update the local state
        const updatedRecords = attendanceRecords.map(r => 
          r.student_id === studentId 
            ? { ...r, status: newStatus }
            : r
        );
        setAttendanceRecords(updatedRecords);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      // Show error message to user
      alert('Failed to update attendance. Please try again.');
    }
  };

  // Define columns for students table  
  const studentColumns = [
    { header: 'Student ID', accessor: 'student_id' },
    { header: 'Name', accessor: row => row.user?.full_name },
    { header: 'Email', accessor: row => row.user?.email },
    { header: 'Student Code', accessor: 'student_code' },
    { header: 'Today\'s Attendance', accessor: 'student_id',
      cell: (row) => {
        const attendance = getStudentAttendanceStatus(row.student_id);
        const statusColor = getStatusBadgeClass(attendance.status);
        
        return (
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
              {attendance.displayText}
            </span>
            {attendance.minutes_late > 0 && (
              <span className="text-xs text-gray-500">
                {attendance.minutes_late} minutes late
              </span>
            )}
            {attendance.notes && (
              <span className="text-xs text-gray-500 italic truncate max-w-[150px]" title={attendance.notes}>
                Note: {attendance.notes}
              </span>
            )}
          </div>
        );
      }
    },
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
    },    {
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
              onClick={() => handleToggleAttendance(row.student_id)}
              className={`px-3 py-1 text-white rounded-md ${getAttendanceToggleButtonStyle(row.student_id)}`}
            >
              {getAttendanceToggleButtonText(row.student_id)}
            </button>
          )}
          {hasPermission(PERMISSIONS.DISCIPLINARY_EDIT) && (
            <button
              onClick={() => navigate(`/disciplinary/add?studentId=${row.student_id}&classId=${id}`)}
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
  // Mock data for development
  const mockClass = {
    class_id: 1,
    class_name: 'HIST101 - 2024-2025 - 2',
    class_description: 'World History - 2024-2025 - Semester 2',
    academic_year: '2024-2025',
    semester: '2',
    department: 'History',
    start_date: '2025-01-15',
    end_date: '2025-05-15',    schedule: JSON.stringify({
      'mon': ['14:00-16:00'],
      'thu': ['09:00-11:00'],
      'fri': ['13:00-15:00']
    }),
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
      attendance_rate: 95,
      academic_status: 'good',
      previous_academic_warning: 0,
      enrollment_status: 'enrolled',
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
      attendance_rate: 82,
      academic_status: 'warning',
      previous_academic_warning: 1,
      enrollment_status: 'enrolled',
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
      attendance_rate: 75,
      academic_status: 'probation',
      previous_academic_warning: 2,
      enrollment_status: 'enrolled',
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
              onClick={() => navigate(`/attendance/new?class_id=${id}`)}
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
              <p><span className="font-medium">Period:</span> {classData.start_date} to {classData.end_date}</p>              <p><span className="font-medium">Schedule:</span></p>
              <div className="ml-4 mt-2">
                {Object.entries(JSON.parse(classData.schedule || '{}')).map(([day, times]) => (
                  <div key={day} className="mb-2 bg-gray-50 p-2 rounded">
                    <p className="text-sm">
                      <span className="font-medium">{day.toUpperCase()}:</span>{' '}
                      {times.map((time, index) => (
                        <span key={index} className="text-gray-600">{time}{index < times.length - 1 ? ', ' : ''}</span>
                      ))}
                    </p>
                  </div>
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
              Sinh viên
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'subjects' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab('subjects')}
            >
              Môn học
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
            <div>              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Danh sách sinh viên</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <label htmlFor="attendanceDate" className="mr-2 text-sm font-medium text-gray-700">
                      Ngày điểm danh:
                    </label>
                    <select
                      id="attendanceDate"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={new Date().toISOString().split('T')[0]}>Hôm nay</option>
                      {attendanceDates.map(date => (
                        <option key={date} value={date}>
                          {formatDate(date)}
                        </option>
                      ))}
                    </select>
                  </div>                  <div className="flex gap-2">
                    {hasPermission(PERMISSIONS.ATTENDANCE_EDIT) && (
                      <button
                        onClick={() => handleMarkAllPresent()}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                      >
                        Điểm danh tất cả
                      </button>
                    )}
                    {hasPermission(PERMISSIONS.CLASS_EDIT) && (
                      <button
                        onClick={() => navigate(`/classes/${id}/students/add`)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        Thêm sinh viên
                      </button>
                    )}
                  </div>
                </div>
              </div>
                {attendanceLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : attendanceError ? (
                <div className="bg-red-100 p-3 rounded-md text-red-700 mb-4">
                  {attendanceError}
                </div>
              ) : (
                <div>
                  <DataTable
                    columns={studentColumns}
                    data={students}
                    pagination={true}
                    itemsPerPage={10}
                  />
                  
                  {/* Attendance Summary */}
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="text-md font-medium mb-2">Attendance Summary for {formatDate(selectedDate)}</h4>
                    <div className="flex flex-wrap gap-3">
                      {attendanceRecords.length === 0 ? (
                        <div className="text-yellow-700">No attendance records for this date.</div>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                            <span className="text-sm">
                              Present: {attendanceRecords.filter(r => r.status === 'present').length} students
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                            <span className="text-sm">
                              Absent: {attendanceRecords.filter(r => r.status === 'absent').length} students
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                            <span className="text-sm">
                              Late: {attendanceRecords.filter(r => r.status === 'late').length} students
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
                            <span className="text-sm">
                              Not recorded: {students.length - attendanceRecords.length} students
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'subjects' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Danh sách môn học trong lớp</h3>
                {hasPermission(PERMISSIONS.CLASS_EDIT) && (
                  <button
                    onClick={() => navigate(`/classes/edit/${id}`)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    Quản lý môn học
                  </button>
                )}
              </div>
              
              {subjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subjects.map(subject => (
                    <div key={subject.subject_id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-lg mb-1">{subject.subject_name}</h4>
                      <p className="text-sm text-gray-500 mb-2">Mã môn: {subject.subject_code}</p>
                      <div className="text-sm">
                        <p><span className="font-medium">Tín chỉ:</span> {subject.credits}</p>
                        {subject.department && <p><span className="font-medium">Khoa:</span> {subject.department}</p>}
                      </div>
                      <div className="mt-3">
                        <Link 
                          to={`/subjects/${subject.subject_id}`}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Xem chi tiết →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
                  Lớp học này chưa có môn học nào. Vui lòng thêm môn học cho lớp.
                </div>
              )}
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
          )}          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              <div>
                <h3 className="text-lg font-medium mb-3">Attendance Overview</h3>
                {attendanceRecords.length === 0 ? (
                  <div className="bg-gray-50 p-8 rounded-lg flex flex-col items-center justify-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    <p className="text-gray-600">No attendance data available for the selected date.</p>
                    <p className="text-sm text-gray-500 mt-1">Take attendance first to see charts.</p>
                  </div>
                ) : (
                  <ChartComponent 
                    type="doughnut" 
                    data={{
                      labels: ['Present', 'Absent', 'Late'],
                      datasets: [
                        {
                          label: 'Attendance Distribution',
                          data: [
                            attendanceRecords.filter(record => record.status === 'present').length,
                            attendanceRecords.filter(record => record.status === 'absent').length,
                            attendanceRecords.filter(record => record.status === 'late').length
                          ],
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
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }}
                  />
                )}
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
      </div>      {activeTab === 'attendance' && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-medium mb-4">Attendance Records</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={new Date().toISOString().split('T')[0]}>Today</option>
                {attendanceDates.map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
              
              {hasPermission(PERMISSIONS.ATTENDANCE_EDIT) && (
                <button
                  onClick={() => navigate(`/attendance/new?class_id=${id}`)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Take Attendance
                </button>
              )}
            </div>
          </div>
          
          {attendanceLoading ? (
            <div className="flex justify-center py-4">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4zm16 0a8 8 0 01-8 8v-8h8z"></path>
              </svg>
            </div>
          ) : attendanceError ? (
            <div className="bg-red-100 p-4 rounded-md text-red-700">
              {attendanceError}
            </div>
          ) : (
            <div>
              {attendanceRecords.length === 0 ? (
                <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 mb-4">
                  No attendance records for the selected date.
                </div>
              ) : (
                <>
                  {/* Attendance Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Present</p>
                      <p className="text-2xl font-bold text-green-600">
                        {attendanceRecords.filter(record => record.status === 'present').length}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(attendanceRecords.filter(record => record.status === 'present').length / attendanceRecords.length * 100)}%
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-red-600">
                        {attendanceRecords.filter(record => record.status === 'absent').length}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(attendanceRecords.filter(record => record.status === 'absent').length / attendanceRecords.length * 100)}%
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Late</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {attendanceRecords.filter(record => record.status === 'late').length}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(attendanceRecords.filter(record => record.status === 'late').length / attendanceRecords.length * 100)}%
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {attendanceRecords.length}
                      </p>
                      <p className="text-xs text-gray-500">
                        Students
                      </p>
                    </div>
                  </div>
                  
                  <DataTable
                    columns={[
                      { header: 'Student ID', accessor: 'student_id' },
                      { header: 'Name', accessor: row => row.student?.user?.full_name || 'Unknown' },
                      { header: 'Status', accessor: 'status',
                        cell: (row) => {
                          const status = row.status || 'absent';
                          const statusColor = 
                            status === 'present' ? 'bg-green-100 text-green-800' :
                            status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800';
                          
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          );
                        }
                      },
                      { header: 'Minutes Late', accessor: 'minutes_late', 
                        cell: (row) => (
                          row.minutes_late ? `${row.minutes_late} minutes` : '-'
                        )
                      },
                      { header: 'Notes', accessor: 'notes' },
                      { header: 'Actions', accessor: 'actions',
                        cell: (row) => (
                          <div className="flex space-x-2">
                            {hasPermission(PERMISSIONS.ATTENDANCE_EDIT) && (
                              <button
                                onClick={() => navigate(`/attendance/edit/${row.attendance_id}`)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )
                      }
                    ]}
                    data={attendanceRecords}
                    pagination={true}
                    itemsPerPage={10}
                  />
                </>
              )}
              
              {hasPermission(PERMISSIONS.ATTENDANCE_EDIT) && attendanceRecords.length === 0 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => navigate(`/attendance/new?class_id=${id}&date=${selectedDate}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Take Attendance for This Date
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassDetail;
