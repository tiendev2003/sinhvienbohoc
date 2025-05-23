// File: AddDisciplinaryRecord.jsx - Component for adding disciplinary records
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  createDisciplinaryRecord,
  fetchClassById,
  fetchClasses,
  fetchStudentById,
  fetchStudentsByClass,
} from "../../services/api";

const AddDisciplinaryRecord = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const studentId = queryParams.get("studentId");
  const classId = queryParams.get("classId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [classData, setClassData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);  const [formData, setFormData] = useState({
    violation_description: "",
    violation_date: new Date().toISOString().split("T")[0],
    severity_level: "minor",
    class_id: classId || null,
    consequences: "",
    resolution_status: "open",
    resolution_notes: "",
    resolution_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingClasses(true);

        // Fetch all classes first
        const classesResponse = await fetchClasses();
        setClasses(classesResponse?.data || []);
        setLoadingClasses(false);

        // If we have studentId/classId from URL params, fetch their details
        if (studentId) {
          const studentResponse = await fetchStudentById(studentId);
          if (studentResponse?.data) {
            setStudent(studentResponse.data);
          }
        }

        if (classId) {
          const classResponse = await fetchClassById(classId);
          if (classResponse?.data) {
            setClassData(classResponse.data);
            setSelectedClassId(classId);
            // Fetch students for this class
            await fetchStudentsForClass(classId);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch required data");
        setLoading(false);
        setLoadingClasses(false);
      }
    };

    fetchData();
  }, [studentId, classId]);
  const fetchStudentsForClass = async (classId) => {
    try {
      setLoadingStudents(true);
      const response = await fetchStudentsByClass(classId);
      console.log("Fetched students:", response.data);
      setStudents(response?.data || []);
      setLoadingStudents(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setLoadingStudents(false);
      setStudents([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (!formData.student_id) {
        setError("Please select a student");
        setSubmitting(false);
        return;
      }

      // Create the record data object
      const recordData = {
        ...formData,
        student_id: parseInt(formData.student_id),
        class_id: parseInt(selectedClassId),
        violation_date: new Date(formData.violation_date).toISOString().split('T')[0],
        resolution_date: formData.resolution_date 
          ? new Date(formData.resolution_date).toISOString().split('T')[0]
          : null
      };

      // Submit the disciplinary record
      await createDisciplinaryRecord(recordData);

      // Navigate back
      if (classId) {
        navigate(`/classes/${classId}`);
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("Error submitting disciplinary record:", err);
      setError(err.response?.data?.detail || "Failed to submit disciplinary record");
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setStudent(null);
    setFormData((prev) => ({ ...prev, student_id: "" }));

    if (classId) {
      await fetchStudentsForClass(classId);
    } else {
      setStudents([]);
    }
  };

  const handleStudentChange = async (e) => {
    const selectedStudentId = e.target.value;
    if (selectedStudentId) {
      const selectedStudent = students.find(
        (s) => s.student_id.toString() === selectedStudentId
      );
      setStudent(selectedStudent);
      setFormData((prev) => ({ ...prev, student_id: selectedStudentId }));
    } else {
      setStudent(null);
      setFormData((prev) => ({ ...prev, student_id: "" }));
    }
  };

  const handleResolutionStatusChange = (e) => {
    const newStatus = e.target.value;
    setFormData(prev => ({
      ...prev,
      resolution_status: newStatus,
      resolution_date: newStatus === "resolved" ? new Date().toISOString().split("T")[0] : ""
    }));
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">Loading student details...</div>
    );
  if (error)
    return (
      <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>
    );

  return (
    <div className="container mx-auto p-4">
      {" "}
      <div className="bg-white rounded-lg shadow-md p-6">
        {" "}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thêm Vi Phạm Kỷ Luật Mới
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Class Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Class
                <select
                  name="class_id"
                  value={selectedClassId}
                  onChange={handleClassChange}
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((cls) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </label>
              {loadingClasses && (
                <p className="mt-1 text-sm text-gray-500">Loading classes...</p>
              )}
            </div>

            {/* Student Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Student
                <select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleStudentChange}
                  disabled={!selectedClassId || loadingStudents}
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select Student --</option>
                  {students.map((student) => (
                    <option key={student.student.student_id} value={student.student.student_id}>
                      {student.student.user?.full_name} ({student.student.student_code})
                    </option>
                  ))}
                </select>
              </label>
              {loadingStudents && (
                <p className="mt-1 text-sm text-gray-500">
                  Loading students...
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Violation Description
              <textarea
                name="violation_description"
                value={formData.violation_description}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows="4"
              />
            </label>
          </div>{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Violation Date
                <input
                  type="date"
                  name="violation_date"
                  value={formData.violation_date}
                  onChange={handleChange}
                  required
                  className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>
            </div>

            <div>              <label className="block text-gray-700 font-medium mb-2">
                Mức Độ Nghiêm Trọng
                <select
                  name="severity_level"
                  value={formData.severity_level}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="minor">Nhẹ</option>
                  <option value="moderate">Trung bình</option>
                  <option value="severe">Nghiêm trọng</option>
                </select>
              </label>
            </div>
          </div>          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Hậu Quả/Biện Pháp
                <input
                  type="text"
                  name="consequences"
                  value={formData.consequences}
                  onChange={handleChange}
                  placeholder="VD: Viết bản kiểm điểm, cấm túc..."
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Trạng Thái Xử Lý
                <select
                  name="resolution_status"
                  value={formData.resolution_status}
                  onChange={handleResolutionStatusChange}
                  required
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="open">Đang xử lý</option>
                  <option value="pending">Đang chờ xử lý</option>
                  <option value="resolved">Đã giải quyết</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-1">
              <label className="block text-gray-700 font-medium mb-2">
                Ngày Giải Quyết
                <input
                  type="date"
                  name="resolution_date"
                  value={formData.resolution_date}
                  onChange={handleChange}
                  disabled={formData.resolution_status !== "resolved"}
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Ghi Chú Giải Quyết
              <textarea
                name="resolution_notes"
                value={formData.resolution_notes}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Nhập ghi chú về cách giải quyết vi phạm..."
              />
            </label>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Thêm Mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDisciplinaryRecord;
