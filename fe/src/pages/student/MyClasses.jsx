import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchGrades,
  fetchStudentByUserId,
  getStudentClasses,
} from "../../services/api";

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("classes"); // 'classes' or 'grades'
  const [grades, setGrades] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        if (!user?.user_id) {
          throw new Error("Không tìm thấy thông tin người dùng");
        }

        setLoading(true);
        setError(null);

        // First get the student info for the current user
        const studentResponse = await fetchStudentByUserId(user.user_id);
        if (!studentResponse?.data?.student_id) {
          throw new Error("Không tìm thấy thông tin sinh viên");
        }

        setStudentId(studentResponse.data.student_id);

        // Then get the classes for this student
        const classesResponse = await getStudentClasses(
          studentResponse.data.student_id
        );
        if (!classesResponse?.data) {
          throw new Error("Không thể tải danh sách lớp học");
        }

        setClasses(classesResponse.data);

        // Fetch grades for the student
        const gradesResponse = await fetchGrades({
          student_id: studentResponse.data.student_id,
        });
        console.log("Grades response:", gradesResponse);
        if (gradesResponse?.data) {
          console.log("Grades data:", gradesResponse.data);
          setGrades(gradesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchMyClasses();
    }
  }, [user]);
  const getSemesterStyle = (semester) => {
    if (!semester) return "bg-gray-100 text-gray-800";

    // Kiểm tra format "YYYY-N" (ví dụ: "2023-1")
    const matches = semester.match(/\d{4}-(\d)/);
    if (matches) {
      const semesterNumber = matches[1];
      switch (semesterNumber) {
        case "1":
          return "bg-blue-100 text-blue-800";
        case "2":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }

    // Format cũ
    switch (semester) {
      case "1":
        return "bg-blue-100 text-blue-800";
      case "2":
        return "bg-green-100 text-green-800";
      case "summer":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSemesterText = (semester) => {
    if (!semester) return "Chưa có học kỳ";

    // Kiểm tra format "YYYY-N" (ví dụ: "2023-1")
    const matches = semester.match(/\d{4}-(\d)/);
    if (matches) {
      const year = matches[0].split("-")[0];
      const semesterNumber = matches[1];
      return `Học kỳ ${semesterNumber} (${year}-${parseInt(year) + 1})`;
    }

    // Format cũ
    switch (semester) {
      case "1":
        return "Học kỳ 1";
      case "2":
        return "Học kỳ 2";
      case "summer":
        return "Học kỳ hè";
      default:
        return semester;
    }
  };

  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClasses = classes.slice(startIndex, endIndex);

  const getGradeStatus = (grade) => {
    if (grade >= 8.5) return ["Xuất sắc", "text-green-700 bg-green-100"];
    if (grade >= 7.0) return ["Giỏi", "text-blue-700 bg-blue-100"];
    if (grade >= 5.5) return ["Khá", "text-yellow-700 bg-yellow-100"];
    if (grade >= 4.0) return ["Trung bình", "text-orange-700 bg-orange-100"];
    return ["Không đạt", "text-red-700 bg-red-100"];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="border-b border-gray-200 mb-6">
        <div className="flex mb-2">
          <button
            className={`mr-4 py-2 px-1 font-medium ${
              activeTab === "classes"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("classes")}
          >
            Danh sách lớp học
          </button>
          <button
            className={`py-2 px-1 font-medium ${
              activeTab === "grades"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("grades")}
          >
            Bảng điểm
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-red-700 bg-red-100 rounded-md mb-4">
          {error}
        </div>
      ) : activeTab === "classes" ? (
        classes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Không tìm thấy lớp học nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên lớp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Năm học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Học kỳ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khoa/Bộ môn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giảng viên
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentClasses.map((classItem) => (
                    <tr key={classItem.class_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {classItem.class_name}
                      </td>
                      <td className="px-6 py-4">
                        {classItem.class_description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {classItem.academic_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSemesterStyle(
                            classItem.semester
                          )}`}
                        >
                          {getSemesterText(classItem.semester)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {classItem.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {classItem.teacher?.user?.full_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-medium">{startIndex + 1}</span> đến{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, classes.length)}
                    </span>{" "}
                    trong <span className="font-medium">{classes.length}</span>{" "}
                    lớp học
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border"
                      }`}
                    >
                      Trước
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border"
                      }`}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )
      ) : (
        // Grades tab content
        <div className="overflow-x-auto">
          {grades.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Chưa có điểm nào được cập nhật
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học kỳ
                  </th>{" "}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm bài tập
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xếp loại
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.map((grade) => {
                  const [status, statusClass] = getGradeStatus(
                    grade.final_score
                  );
                  console.log("Grade:", grade);
                  return (
                    <tr key={grade.grade_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {grade.subject?.subject_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSemesterStyle(
                            grade.class_obj.semester
                          )}`}
                        >
                          {getSemesterText(grade.class_obj.semester)}
                        </span>
                      </td>{" "}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {grade.assignment_score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {grade.midterm_score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {grade.final_score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {grade.gpa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "classes" && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex-1 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{" "}
              <span className="font-medium">
                {Math.min(endIndex, classes.length)}
              </span>{" "}
              trong <span className="font-medium">{classes.length}</span> lớp
              học
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                }`}
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClasses;
