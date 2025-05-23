// File: StudentDetail.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { deleteStudent, fetchStudentById } from '../../services/api';
import { getStudentClasses } from '../../services/class_subject_api';
import { formatDate } from '../../utils/formatters';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();  const [student, setStudent] = useState(null);
  const [studentClasses, setStudentClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchStudentById(id);
        setStudent(response?.data || mockStudent);
        
        // Fetch student's classes
        try {
          const classesResponse = await getStudentClasses(id);
          setStudentClasses(classesResponse?.data || []);
        } catch (classErr) {
          console.error('Error fetching student classes:', classErr);
          setStudentClasses([]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student details');
        setIsLoading(false);
        setStudent(mockStudent); // Fallback to mock data
      }
    };

    fetchStudentData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id);
        navigate('/students', { state: { message: 'Student deleted successfully' } });
      } catch (err) {
        console.error('Error deleting student:', err);
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'expelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock student data for development
  const mockStudent = {
    student_code: 'SV100000',
    date_of_birth: '2023-12-31',
    gender: 'other',
    hometown: 'East Melissaborough',
    current_address: '7271 Osborn Road Apt. 269\nEast Danielbury, IL 15136-9995',
    family_income_level: 'high',
    family_background:
      'Accusantium architecto saepe necessitatibus praesentium. Harum porro eum quos assumenda dolorem asperiores dolorum.',
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
      updated_at: '2025-05-22T11:32:57',
    },
    attendance_rate: 99.52,
    previous_academic_warning: 1,
    academic_status: 'suspended',
    grades: [
      { subject: 'Mathematics', semester: '2023-1', value: 8.5, credits: 3 },
      { subject: 'Programming', semester: '2023-1', value: 7.8, credits: 4 },
      { subject: 'Database', semester: '2023-1', value: 8.0, credits: 3 },
      { subject: 'English', semester: '2023-1', value: 7.5, credits: 2 },
    ],
    attendance: [
      { date: '2023-10-05', status: 'present', subject: 'Mathematics' },
      { date: '2023-10-06', status: 'present', subject: 'Programming' },
      { date: '2023-10-07', status: 'absent', subject: 'Database' },
      { date: '2023-10-09', status: 'present', subject: 'English' },
    ],
    disciplinary_records: [
      { date: '2023-11-15', description: 'Late for class', severity: 'minor' },
    ],
    counseling_records: [
      {
        date: '2023-12-01',
        notes: 'Discussed performance in Programming class',
        counselor: 'Ms. Lan',
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Student not found.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.user.full_name}</h1>
          <p className="text-gray-600">
            Student Code: {student.student_code} | Entry Year: {student.entry_year}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          {hasPermission(PERMISSIONS.STUDENT_EDIT) && (
            <Link
              to={`/students/edit/${student.student_id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </Link>
          )}
          {hasPermission(PERMISSIONS.STUDENT_DELETE) && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Academic Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(
            student.academic_status
          )}`}
        >
          Academic Status:{' '}
          {student.academic_status.charAt(0).toUpperCase() + student.academic_status.slice(1)}
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          {['overview', 'classes', 'academic', 'attendance', 'disciplinary', 'counseling'].map((tab) => (
            <li key={tab} className="mr-2">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Personal Information
              </h2>
              <div className="space-y-3">
                <p>
                  <span className="font-medium text-gray-700">Full Name:</span>{' '}
                  {student.user.full_name}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Date of Birth:</span>{' '}
                  {formatDate(student.date_of_birth)}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Gender:</span> {student.gender}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Email:</span>{' '}
                  {student.user.email}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Phone:</span>{' '}
                  {student.user.phone}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Hometown:</span>{' '}
                  {student.hometown}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Current Address:</span>{' '}
                  {student.current_address}
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Academic Information
              </h2>
              <div className="space-y-3">
                <p>
                  <span className="font-medium text-gray-700">Student Code:</span>{' '}
                  {student.student_code}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Entry Year:</span>{' '}
                  {student.entry_year}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Expected Graduation:</span>{' '}
                  {student.expected_graduation_year}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Attendance Rate:</span>{' '}
                  {student.attendance_rate}%
                </p>
                <p>
                  <span className="font-medium text-gray-700">Previous Academic Warnings:</span>{' '}
                  {student.previous_academic_warning}
                </p>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Financial Information
              </h2>
              <div className="space-y-3">
                <p>
                  <span className="font-medium text-gray-700">Family Income Level:</span>{' '}
                  {student.family_income_level}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Scholarship Status:</span>{' '}
                  {student.scholarship_status}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Scholarship Amount:</span>{' '}
                  ${student?.scholarship_amount?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Class Information</h2>
            {studentClasses?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentClasses.map((classInfo, index) => (                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {classInfo.class_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {classInfo.teacher?.user?.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {JSON.parse(classInfo.schedule ? classInfo.schedule : '{}').wed?.[0] || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No class records found.</p>
            )}
          </div>
        )}        {/* Academic Tab */}
        {activeTab === 'academic' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Grade Information</h2>
              {hasPermission(PERMISSIONS.GRADE_VIEW) && (
                <Link 
                  to={`/students/${id}/grades`}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  View Detailed Grades
                </Link>
              )}
            </div>
            {student.grades?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {student.grades.map((grade, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {grade.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {grade.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {grade.credits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {grade.value.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No grade records found.</p>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Records</h2>
            {student.attendance?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {student.attendance.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'present'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No attendance records found.</p>
            )}
            <div className="mt-6">
              <p className="text-lg font-medium text-gray-800">
                Attendance Rate: {student.attendance_rate}%
              </p>
            </div>
          </div>
        )}

        {/* Disciplinary Tab */}
        {activeTab === 'disciplinary' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Disciplinary Records</h2>
            {student.disciplinary_records?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {student.disciplinary_records.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {record.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.severity === 'minor'
                                ? 'bg-yellow-100 text-yellow-800'
                                : record.severity === 'major'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No disciplinary records found.</p>
            )}
          </div>
        )}

        {/* Counseling Tab */}
        {activeTab === 'counseling' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Counseling Records</h2>
            {student.counseling_records?.length > 0 ? (
              <div className="space-y-4">
                {student.counseling_records.map((record, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-800">{formatDate(record.date)}</p>
                      <p className="text-gray-600">Counselor: {record.counselor}</p>
                    </div>
                    <p className="mt-2 text-gray-600">{record.notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No counseling records found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;