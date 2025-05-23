// File: TakeAttendance.jsx - Component for taking attendance
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { fetchStudentById, fetchStudentsByClass, submitBulkAttendance } from '../../services/api';
import DataTable from '../common/DataTable';

const TakeAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const classId = queryParams.get('classId');
  const studentId = queryParams.get('studentId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {    const fetchStudents = async () => {
      try {
        setLoading(true);
        if (studentId) {
          // Fetch single student if studentId is provided
          const response = await fetchStudentById(studentId);
          setStudents([response.data]);
        } else {
          // Fetch all students in the class
          const response = await fetchStudentsByClass(classId);
          const processedStudents = response?.data?.map(enrollment => ({
            student_id: enrollment.student_id,
            student_code: enrollment.student?.student_code,
            date_of_birth: enrollment.student?.date_of_birth,
            user: enrollment.student?.user
          }));
          setStudents(processedStudents);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to fetch students');
        setLoading(false);
      }
    };

    if (classId) {
      fetchStudents();
    }
  }, [classId, studentId]);

  const handleAttendanceChange = (studentId, status, minutesLate = 0) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { status, minutesLate }
    }));
  };
  const handleSubmit = async () => {
    try {
      if (Object.keys(attendanceData).length === 0) {
        setError('Please mark attendance for at least one student');
        return;
      }

      const attendanceRecords = Object.entries(attendanceData).map(([studentId, data]) => ({
        student_id: parseInt(studentId),
        class_id: parseInt(classId),
        date: selectedDate,
        status: data.status,
        minutes_late: data.status === 'late' ? data.minutesLate : 0
      }));

      await submitBulkAttendance({
        class_id: parseInt(classId),
        date: selectedDate,
        records: attendanceRecords
      });

      navigate(`/classes/${classId}`);
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError('Failed to submit attendance');
    }
  };

  const columns = [
    { header: 'Student ID', accessor: 'student_code' },
    { header: 'Name', accessor: row => row.user?.full_name },
    {
      header: 'Attendance',
      accessor: 'attendance',
      cell: (row) => (
        <div className="flex items-center space-x-4">
          <select
            value={attendanceData[row.student_id]?.status || 'present'}
            onChange={(e) => handleAttendanceChange(row.student_id, e.target.value)}
            className="rounded border p-1"
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
          {attendanceData[row.student_id]?.status === 'late' && (
            <input
              type="number"
              min="0"
              value={attendanceData[row.student_id]?.minutesLate || 0}
              onChange={(e) => handleAttendanceChange(row.student_id, 'late', parseInt(e.target.value))}
              placeholder="Minutes late"
              className="w-20 rounded border p-1"
            />
          )}
        </div>
      )
    }
  ];

  if (loading) return <div className="flex justify-center p-8">Loading students...</div>;
  
  if (error) return <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Take Attendance</h1>
          <div className="flex items-center space-x-4">
            <label className="font-medium">
              Date:
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="ml-2 rounded border p-1"
              />
            </label>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Submit Attendance
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={students}
          pagination={true}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
};

export default TakeAttendance;
