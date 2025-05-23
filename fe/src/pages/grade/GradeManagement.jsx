// File: GradeManagement.jsx - Quản lý điểm số cho sinh viên
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { PERMISSIONS, useAuth } from "../../context/AuthContext";
import {
  createGrade,
  fetchClasses,
  fetchGrades,
  fetchStudentsByClass,
  updateGrade,
} from "../../services/api";
import { fetchSubjectsByClass } from "../../services/class_subject_api";

const GradeManagement = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const classIdFromURL = queryParams.get("classId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    classId: classIdFromURL || "",
    subjectId: "",
    semester: "",
  });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [isFromClassDetail, setIsFromClassDetail] = useState(
    Boolean(classIdFromURL)
  );
  const { hasPermission } = useAuth();

  // Fetch classes for dropdown selection
  useEffect(() => {
    const fetchClassesList = async () => {
      try {
        setLoading(true);
        const response = await fetchClasses();
        setClasses(response?.data || []);

        // If we have a classId from URL
        if (classIdFromURL) {
          const selectedClass = response?.data?.find(
            (c) => c.class_id.toString() === classIdFromURL
          );
          if (selectedClass) {
            setClasses([selectedClass]);
            // Also set the semester filter if it exists in the selected class
            if (selectedClass.semester) {
              setFilters((prev) => ({
                ...prev,
                semester: selectedClass.semester,
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to fetch classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClassesList();
  }, [classIdFromURL, isFromClassDetail]);

  // Fetch subjects when class is selected
  useEffect(() => {
    const fetchSubjectsForClass = async () => {
      if (!filters.classId) {
        setSubjects([]);
        return;
      }

      try {
        const response = await fetchSubjectsByClass(filters.classId);
        if (response?.data) {
          setSubjects(response.data);
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to fetch subjects");
      }
    };

    fetchSubjectsForClass();
  }, [filters.classId]);

  // Fetch students and their grades when class and subject are selected
  useEffect(() => {
    const fetchStudentsAndGrades = async () => {
      if (!filters.classId || !filters.subjectId) {
        setStudents([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // First, get all students in the class
        const studentsResponse = await fetchStudentsByClass(filters.classId);
        const classStudents = studentsResponse?.data || [];

        // Then get their grades for the selected subject
        const gradesResponse = await fetchGrades({
          class_id: filters.classId,
          subject_id: filters.subjectId,
        });
        const gradesData = gradesResponse?.data || [];

        // Map students with their grades
        const studentsWithGrades = classStudents.map((student) => {
          const studentGrade =
            gradesData.find((g) => g.student_id === student.student_id) || null;
           return {
            student_id: student.student.student_id,
            student_code: student?.student?.student_code,
            full_name: student?.student?.user?.full_name || "-",
            grade: studentGrade,
          };
        });

        setStudents(studentsWithGrades);
      } catch (err) {
        console.error("Error fetching students and grades:", err);
        setError("Could not load students data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndGrades();
  }, [filters.classId, filters.subjectId, filters.semester]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGradeChange = (studentId, field, value) => {
    // Update the local state first
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.student_id === studentId
          ? {
              ...student,
              grade: {
                ...student.grade,
                [field]: value === "" ? null : parseFloat(value),
              },
            }
          : student
      )
    );
  };

  const calculateGPA = (assignment, midterm, final) => {
    if (assignment === null || midterm === null || final === null) {
      return null;
    }
    // GPA calculation: 20% assignment + 30% midterm + 50% final
    return (assignment * 0.2 + midterm * 0.3 + final * 0.5).toFixed(1);
  };

  const handleSaveGrades = async () => {
    // Validate inputs first
    let hasError = false;
    const updatedStudents = students.map((student) => {
      const { assignment_score, midterm_score, final_score } =
        student.grade || {};

      // Calculate GPA for display
      const calculatedGPA = calculateGPA(
        assignment_score,
        midterm_score,
        final_score
      );

      return {
        ...student,
        grade: {
          ...student.grade,
          gpa: calculatedGPA,
        },
      };
    });

    setStudents(updatedStudents);

    if (hasError) {
      return;
    }

    try {
      // Update or create grades for all students
      for (const student of updatedStudents) {
        if (!student.grade || !student.grade.grade_id) {
          // Create new grade
          if (
            student.grade?.assignment_score ||
            student.grade?.midterm_score ||
            student.grade?.final_score
          ) {
            await createGrade({
              student_id: student.student_id,
              subject_id: parseInt(filters.subjectId),
              class_id: parseInt(filters.classId),
              assignment_score: student.grade?.assignment_score || null,
              midterm_score: student.grade?.midterm_score || null,
              final_score: student.grade?.final_score || null,
            });
          }
        } else {
          // Update existing grade
          await updateGrade(student.grade.grade_id, {
            assignment_score: student.grade?.assignment_score || null,
            midterm_score: student.grade?.midterm_score || null,
            final_score: student.grade?.final_score || null,
          });
        }
      }

      alert("Lưu điểm thành công!");
    } catch (err) {
      console.error("Error saving grades:", err);
      setError("Không thể lưu điểm. Vui lòng thử lại.");
    }
  };
  // Mock data for development
  const mockClasses = [
    {
      class_id: 1,
      class_name: "CS101 - Lập trình cơ bản",
      semester: "2023-1",
      subjects: [
        { subject_id: 1, subject_name: "Lập trình C/C++" },
        { subject_id: 2, subject_name: "Cấu trúc dữ liệu và giải thuật" },
      ],
    },
    {
      class_id: 2,
      class_name: "MATH201 - Toán cao cấp",
      semester: "2023-1",
      subjects: [
        { subject_id: 3, subject_name: "Đại số tuyến tính" },
        { subject_id: 4, subject_name: "Giải tích" },
      ],
    },
    {
      class_id: 3,
      class_name: "ENG151 - Tiếng Anh giao tiếp",
      semester: "2023-1",
      subjects: [
        { subject_id: 5, subject_name: "Tiếng Anh cơ bản" },
        { subject_id: 6, subject_name: "Ngữ pháp tiếng Anh" },
      ],
    },
  ];

  const mockSubjects = [
    { subject_id: 1, subject_name: "Lập trình C/C++" },
    { subject_id: 2, subject_name: "Cấu trúc dữ liệu và giải thuật" },
    { subject_id: 3, subject_name: "Cơ sở dữ liệu" },
  ];

  const mockStudentsWithGrades = [
    {
      student_id: 1,
      student_code: "SV001",
      full_name: "Nguyễn Văn A",
      grade: {
        grade_id: 1,
        assignment_score: 8.5,
        midterm_score: 7.8,
        final_score: 8.2,
        gpa: 8.2,
      },
    },
    {
      student_id: 2,
      student_code: "SV002",
      full_name: "Trần Thị B",
      grade: {
        grade_id: 2,
        assignment_score: 9.0,
        midterm_score: 8.5,
        final_score: 9.5,
        gpa: 9.1,
      },
    },
    {
      student_id: 3,
      student_code: "SV003",
      full_name: "Phạm Văn C",
      grade: null, // This student doesn't have grades yet
    },
  ];

  if (
    !hasPermission(PERMISSIONS.GRADE_EDIT) &&
    !hasPermission(PERMISSIONS.GRADE_VIEW)
  ) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          Bạn không có quyền truy cập chức năng quản lý điểm.
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link
          to={isFromClassDetail ? `/classes/${classIdFromURL}` : "/dashboard"}
          className="mr-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← {isFromClassDetail ? "Quay lại lớp học" : "Quay lại Dashboard"}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý điểm số</h1>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}{" "}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Lọc theo {!isFromClassDetail ? "lớp và " : ""}môn học
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!isFromClassDetail && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Lớp học
              </label>
              <select
                name="classId"
                value={filters.classId}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">-- Chọn lớp học --</option>
                {classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name} ({cls.semester})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Môn học
            </label>
            <select
              name="subjectId"
              value={filters.subjectId}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={!filters.classId}
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((subject) => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>{" "}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Học kỳ
            </label>
            <select
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">-- Tất cả học kỳ --</option>
              {isFromClassDetail &&
              mockClasses.find((c) => c.class_id.toString() === classIdFromURL)
                ?.semester ? (
                // If we're from class detail, use that class's semester
                <option
                  value={
                    mockClasses.find(
                      (c) => c.class_id.toString() === classIdFromURL
                    ).semester
                  }
                >
                  {mockClasses.find(
                    (c) => c.class_id.toString() === classIdFromURL
                  ).semester === "2022-1"
                    ? "Học kỳ 1 (2022-2023)"
                    : mockClasses.find(
                        (c) => c.class_id.toString() === classIdFromURL
                      ).semester === "2022-2"
                    ? "Học kỳ 2 (2022-2023)"
                    : mockClasses.find(
                        (c) => c.class_id.toString() === classIdFromURL
                      ).semester === "2023-1"
                    ? "Học kỳ 1 (2023-2024)"
                    : mockClasses.find(
                        (c) => c.class_id.toString() === classIdFromURL
                      ).semester === "2023-2"
                    ? "Học kỳ 2 (2023-2024)"
                    : mockClasses.find(
                        (c) => c.class_id.toString() === classIdFromURL
                      ).semester}
                </option>
              ) : (
                <>
                  <option value="2022-1">Học kỳ 1 (2022-2023)</option>
                  <option value="2022-2">Học kỳ 2 (2022-2023)</option>
                  <option value="2023-1">Học kỳ 1 (2023-2024)</option>
                  <option value="2023-2">Học kỳ 2 (2023-2024)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>{" "}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : !filters.classId || !filters.subjectId ? (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
          {!filters.classId
            ? "Vui lòng chọn lớp học và môn học để xem/nhập điểm."
            : "Vui lòng chọn môn học để xem/nhập điểm."}
        </div>
      ) : students.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          Không có sinh viên nào trong lớp học này hoặc chưa có điểm.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Danh sách sinh viên và điểm số
            </h2>
            {hasPermission(PERMISSIONS.GRADE_EDIT) && (
              <button
                onClick={handleSaveGrades}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Lưu điểm
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã sinh viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
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
                {students.map((student) => (
                  <tr key={student.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.student_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasPermission(PERMISSIONS.GRADE_EDIT) ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={student.grade?.assignment_score || ""}
                          onChange={(e) =>
                            handleGradeChange(
                              student.student_id,
                              "assignment_score",
                              e.target.value
                            )
                          }
                          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {student.grade?.assignment_score || "-"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasPermission(PERMISSIONS.GRADE_EDIT) ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={student.grade?.midterm_score || ""}
                          onChange={(e) =>
                            handleGradeChange(
                              student.student_id,
                              "midterm_score",
                              e.target.value
                            )
                          }
                          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {student.grade?.midterm_score || "-"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasPermission(PERMISSIONS.GRADE_EDIT) ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={student.grade?.final_score || ""}
                          onChange={(e) =>
                            handleGradeChange(
                              student.student_id,
                              "final_score",
                              e.target.value
                            )
                          }
                          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {student.grade?.final_score || "-"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.grade?.gpa ||
                          (student.grade?.assignment_score !== undefined &&
                          student.grade?.midterm_score !== undefined &&
                          student.grade?.final_score !== undefined
                            ? calculateGPA(
                                student.grade.assignment_score,
                                student.grade.midterm_score,
                                student.grade.final_score
                              )
                            : "-")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeManagement;
