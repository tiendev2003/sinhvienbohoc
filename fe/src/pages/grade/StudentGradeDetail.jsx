// File: StudentGradeDetail.jsx - Chi tiết điểm số của sinh viên
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { PERMISSIONS, useAuth } from '../../context/AuthContext';
import { fetchSubjectsByClass } from '../../services/class_subject_api';
import { formatDate } from '../../utils/formatters';

const StudentGradeDetail = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [subjects, setSubjects] = useState([]); // Add subjects state
  const { hasPermission } = useAuth();

  // Fetch student data and grades
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student data
        const studentResponse = await fetch(`/api/students/${studentId}`);
        const studentData = await studentResponse.json();
        setStudent(studentData || mockStudent);

        // Fetch subjects in student's class
        if (studentData?.class?.class_id) {
          try {
            const subjectsResponse = await fetchSubjectsByClass(studentData.class.class_id);
            setSubjects(subjectsResponse?.data || []);
          } catch (err) {
            console.error('Error fetching class subjects:', err);
          }
        }

        // Fetch grades
        const gradesResponse = await fetch(`/api/grades?student_id=${studentId}`);
        const gradesData = await gradesResponse.json();
        
        // Filter grades for subjects in student's class if subjects are available
        const filteredGrades = subjects.length > 0 
          ? gradesData.filter(grade => subjects.some(subject => subject.subject_id === grade.subject?.subject_id))
          : gradesData;
        
        setGrades(filteredGrades || mockGrades);

        // Extract unique semesters for filtering
        const uniqueSemesters = Array.from(
          new Set((filteredGrades || mockGrades).map((grade) => grade.semester))
        );
        setSemesters(uniqueSemesters);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching student data:', err);
        // Use mock data for development
        setStudent(mockStudent);
        setGrades(mockGrades);
        
        // Extract semesters from mock data
        const uniqueSemesters = Array.from(
          new Set(mockGrades.map((grade) => grade.semester))
        );
        setSemesters(uniqueSemesters);
        
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Filter grades by semester
  const filteredGrades = selectedSemester === 'all'
    ? grades
    : grades.filter(grade => grade.semester === selectedSemester);

  // Calculate GPA for the current filtered grades
  const calculateSemesterGPA = () => {
    if (filteredGrades.length === 0) return 0;
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    filteredGrades.forEach(grade => {
      if (grade.gpa && grade.credits) {
        totalPoints += grade.gpa * grade.credits;
        totalCredits += grade.credits;
      }
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  // Mock data for development
  const mockStudent = {
    student_id: 1,
    student_code: 'SV001',
    user: {
      full_name: 'Nguyễn Văn A',
      email: 'student1@example.com',
    },
    date_of_birth: '2000-01-15',
    gender: 'male',
    entry_year: 2021,
    expected_graduation_year: 2025,
    class: {
      class_id: 1,
      class_name: 'CNTT2021'
    }
  };

  const mockGrades = [
    {
      grade_id: 1,
      subject: {
        subject_id: 1,
        subject_name: 'Lập trình cơ bản',
        credits: 3
      },
      class: {
        class_id: 1,
        class_name: 'CNTT2021-1'
      },
      semester: '2021-1',
      assignment_score: 8.5,
      midterm_score: 7.5,
      final_score: 8.0,
      gpa: 8.0,
      credits: 3
    },
    {
      grade_id: 2,
      subject: {
        subject_id: 2,
        subject_name: 'Toán cao cấp',
        credits: 4
      },
      class: {
        class_id: 1,
        class_name: 'CNTT2021-1'
      },
      semester: '2021-1',
      assignment_score: 7.0,
      midterm_score: 7.5,
      final_score: 8.5,
      gpa: 7.9,
      credits: 4
    },
    {
      grade_id: 3,
      subject: {
        subject_id: 3,
        subject_name: 'Tiếng Anh chuyên ngành',
        credits: 2
      },
      class: {
        class_id: 2,
        class_name: 'CNTT2021-2'
      },
      semester: '2021-2',
      assignment_score: 9.0,
      midterm_score: 8.5,
      final_score: 9.0,
      gpa: 8.9,
      credits: 2
    },
    {
      grade_id: 4,
      subject: {
        subject_id: 4,
        subject_name: 'Cấu trúc dữ liệu và giải thuật',
        credits: 3
      },
      class: {
        class_id: 2,
        class_name: 'CNTT2021-2'
      },
      semester: '2021-2',
      assignment_score: 8.0,
      midterm_score: 8.0,
      final_score: 9.0,
      gpa: 8.5,
      credits: 3
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Không tìm thấy thông tin sinh viên.
        </div>
        <div className="mt-4">
          <Link
            to="/students"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Quay lại danh sách sinh viên
          </Link>
        </div>
      </div>
    );
  }

  if (!hasPermission(PERMISSIONS.GRADE_VIEW) && !hasPermission(PERMISSIONS.GRADE_EDIT)) {
    return (      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          Bạn không có quyền xem điểm của sinh viên.
        </div>
        <div className="mt-4">
          <Link
            to={`/students/${studentId}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Quay lại thông tin sinh viên
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">      <div className="flex items-center mb-6">
        <Link
          to={`/students/${studentId}`}
          className="mr-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Quay lại thông tin sinh viên
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Bảng điểm sinh viên</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin sinh viên</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-2">
              <span className="font-medium text-gray-700">Mã sinh viên:</span>{' '}
              {student.student_code}
            </p>
            <p className="mb-2">
              <span className="font-medium text-gray-700">Họ tên:</span>{' '}
              {student.user?.full_name}
            </p>
            <p className="mb-2">
              <span className="font-medium text-gray-700">Ngày sinh:</span>{' '}
              {formatDate(student.date_of_birth)}
            </p>
            <p className="mb-2">
              <span className="font-medium text-gray-700">Giới tính:</span>{' '}
              {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}
            </p>
          </div>
          <div>
            <p className="mb-2">
              <span className="font-medium text-gray-700">Email:</span>{' '}
              {student.user?.email}
            </p>
            <p className="mb-2">
              <span className="font-medium text-gray-700">Năm nhập học:</span>{' '}
              {student.entry_year}
            </p>
            <p className="mb-2">
              <span className="font-medium text-gray-700">Năm tốt nghiệp dự kiến:</span>{' '}
              {student.expected_graduation_year}
            </p>
            <p className="mb-2">
              <span className="font-medium text-gray-700">Lớp:</span>{' '}
              {student.class?.class_name || 'Chưa có lớp'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bảng điểm</h2>
          <div className="flex items-center space-x-2">
            <label className="font-medium text-gray-700">Học kỳ:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tất cả</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester.startsWith('20') 
                    ? `Học kỳ ${semester.split('-')[1]} (${semester.split('-')[0]}-${parseInt(semester.split('-')[0])+1})` 
                    : semester}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredGrades.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
            Không có dữ liệu điểm cho học kỳ đã chọn.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Học kỳ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tín chỉ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm quá trình
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm giữa kỳ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm cuối kỳ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm tổng kết
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrades.map((grade) => (
                    <tr key={grade.grade_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.semester.startsWith('20') 
                          ? `Học kỳ ${grade.semester.split('-')[1]} (${grade.semester.split('-')[0]}-${parseInt(grade.semester.split('-')[0])+1})` 
                          : grade.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.subject?.subject_name || 'Không xác định'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.credits || grade.subject?.credits || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.assignment_score?.toFixed(1) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.midterm_score?.toFixed(1) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.final_score?.toFixed(1) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grade.gpa?.toFixed(1) || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">Tổng số tín chỉ:</p>
                  <p className="text-lg font-bold text-gray-900">
                    {filteredGrades.reduce((total, grade) => total + (grade.credits || grade.subject?.credits || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Điểm trung bình:</p>
                  <p className="text-lg font-bold text-gray-900">
                    {calculateSemesterGPA()}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Xếp loại:</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(() => {
                      const gpa = parseFloat(calculateSemesterGPA());
                      if (gpa >= 9.0) return 'Xuất sắc';
                      if (gpa >= 8.0) return 'Giỏi';
                      if (gpa >= 7.0) return 'Khá';
                      if (gpa >= 5.0) return 'Trung bình';
                      return 'Yếu';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentGradeDetail;
