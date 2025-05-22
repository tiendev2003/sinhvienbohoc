// File: AttendanceForm.jsx - Form for taking attendance
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
    fetchClasses,
    fetchStudentsByClass,
    submitAttendance
} from '../../services/api';

const AttendanceForm = () => {
  const navigate = useNavigate();
  
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState('');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    // Set today's date as the default
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
    
    const fetchClassesList = async () => {
      try {
        setLoading(true);
        // In production, replace with actual API call
        const response = await fetchClasses();
        setClasses(response?.data || mockClasses);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to fetch classes');
        setLoading(false);
        // For development, use mock data if API fails
        setClasses(mockClasses);
      }
    };
    
    fetchClassesList();
  }, []);
  
  useEffect(() => {
    if (classId) {
      fetchStudentsForClass(classId);
    } else {
      setStudents([]);
      setAttendanceRecords([]);
    }
  }, [classId]);
  
  const fetchStudentsForClass = async (classId) => {
    try {
      setStudentsLoading(true);
      // In production, replace with actual API call
      const response = await fetchStudentsByClass(classId);
      const studentsList = response?.data || mockStudents;
      setStudents(studentsList);
      
      // Initialize attendance records for all students
      const initialAttendance = studentsList.map(student => ({
        studentId: student.id,
        status: 'Present',  // Default to present
        notes: ''
      }));
      
      setAttendanceRecords(initialAttendance);
      setStudentsLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students in this class');
      setStudentsLoading(false);
      // For development, use mock data if API fails
      setStudents(mockStudents);
      
      // Initialize attendance records for all students
      const initialAttendance = mockStudents.map(student => ({
        studentId: student.id,
        status: 'Present',  // Default to present
        notes: ''
      }));
      
      setAttendanceRecords(initialAttendance);
    }
  };
  
  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => 
        record.studentId === studentId 
          ? { ...record, status } 
          : record
      )
    );
  };
  
  const handleNotesChange = (studentId, notes) => {
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => 
        record.studentId === studentId 
          ? { ...record, notes } 
          : record
      )
    );
  };
  
  const handleAllPresent = () => {
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => ({ ...record, status: 'Present' }))
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!classId || !date) {
      setError('Please select a class and date');
      return;
    }
    
    if (attendanceRecords.length === 0) {
      setError('No students found in this class');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    const attendanceData = {
      classId,
      date,
      records: attendanceRecords
    };
    
    try {
      // In production, replace with actual API call
      await submitAttendance(attendanceData);
      navigate('/attendance');
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError('Failed to submit attendance records');
      setSubmitting(false);
      
      // For development, simulate success
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          navigate('/attendance');
        }, 1000);
      }
    }
  };
  
  // Mock data for development
  const mockClasses = [
    { id: 1, name: '10A1' },
    { id: 2, name: '11B2' },
    { id: 3, name: '12C3' },
  ];
  
  const mockStudents = [
    { id: 1, name: 'Jane Cooper' },
    { id: 2, name: 'Michael Brown' },
    { id: 3, name: 'Sarah Wilson' },
    { id: 4, name: 'David Johnson' },
    { id: 5, name: 'Emily Davis' },
  ];
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link 
          to="/attendance" 
          className="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Back to Attendance
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Take Attendance</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="classId" className="block text-gray-700 font-medium mb-2">
                Class*
              </label>
              <select
                id="classId"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                Date*
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {classId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Students</h2>
                <button
                  type="button"
                  onClick={handleAllPresent}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                >
                  Mark All Present
                </button>
              </div>
              
              {studentsLoading ? (
                <div className="flex justify-center p-8">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No students found in this class</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => {
                        const attendance = attendanceRecords.find(
                          record => record.studentId === student.id
                        ) || { status: 'Present', notes: '' };
                        
                        return (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`status-${student.id}`}
                                    value="Present"
                                    checked={attendance.status === 'Present'}
                                    onChange={() => handleStatusChange(student.id, 'Present')}
                                    className="form-radio h-4 w-4 text-green-600"
                                  />
                                  <span className="ml-2 text-sm text-green-700">Present</span>
                                </label>
                                
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`status-${student.id}`}
                                    value="Absent"
                                    checked={attendance.status === 'Absent'}
                                    onChange={() => handleStatusChange(student.id, 'Absent')}
                                    className="form-radio h-4 w-4 text-red-600"
                                  />
                                  <span className="ml-2 text-sm text-red-700">Absent</span>
                                </label>
                                
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`status-${student.id}`}
                                    value="Late"
                                    checked={attendance.status === 'Late'}
                                    onChange={() => handleStatusChange(student.id, 'Late')}
                                    className="form-radio h-4 w-4 text-yellow-600"
                                  />
                                  <span className="ml-2 text-sm text-yellow-700">Late</span>
                                </label>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={attendance.notes}
                                onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                placeholder="Optional notes"
                                className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <Link
                  to="/attendance"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mr-2"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={submitting || students.length === 0}
                >
                  {submitting ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
