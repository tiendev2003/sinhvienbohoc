// File: DisciplinaryForm.jsx - Form để thêm/sửa bản ghi kỷ luật
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  createDisciplinaryRecord,
  fetchClasses,
  fetchDisciplinaryById,
  fetchStudentsByClass,
  updateDisciplinaryRecord,
} from "../../services/api";

const DisciplinaryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [formData, setFormData] = useState({
    student_id: "",
    violation_date: new Date().toISOString().split("T")[0],
    violation_description: "",
    severity_level: "minor",
    consequences: "",
    resolution_status: "open",
    resolution_notes: "",
    resolution_date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available classes first
        setLoadingClasses(true);
        const classesResponse = await fetchClasses();
        setClasses(classesResponse?.data || mockClasses);
        setLoadingClasses(false);

        // If editing, fetch disciplinary record details
        if (isEditing) {
          setLoading(true);
          const response = await fetchDisciplinaryById(id);
          const record = response?.data || {};          setFormData({
            student_id: record.student_id || "",
            violation_date:
              record.violation_date || new Date().toISOString().split("T")[0],
            violation_description: record.violation_description || "",
            severity_level: record.severity_level || "minor",
            consequences: record.consequences || "",
            resolution_status: record.resolution_status || "open",
            resolution_notes: record.resolution_notes || "",
            resolution_date: record.resolution_date || "",
          });

          // If there's a class_id in the record, fetch students for that class
          if (record.class_id) {
            await fetchStudentsForClass(record.class_id);
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
        setLoadingClasses(false);

        // For development, use mock data
        setClasses(mockClasses);
        if (isEditing) {
          const mockRecord = mockDisciplinaryRecord;          setFormData({
            student_id: mockRecord.student_id,
            violation_date: mockRecord.violation_date,
            violation_description: mockRecord.violation_description,
            severity_level: mockRecord.severity_level,
            consequences: mockRecord.consequences || "",
            resolution_status: mockRecord.resolution_status || "open",
            resolution_notes: mockRecord.resolution_notes || "",
            resolution_date: mockRecord.resolution_date || "",
          });
        }
      }
    };

    fetchData();
  }, [id, isEditing]);

  const fetchStudentsForClass = async (classId) => {
    try {
      setLoadingStudents(true);
      const response = await fetchStudentsByClass(classId);
      setStudents(response?.data || mockStudents);
      setSelectedClassId(classId);
      setLoadingStudents(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setLoadingStudents(false);
      setStudents(mockStudents); // For development
    }
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    if (classId) {
      await fetchStudentsForClass(classId);
    } else {
      setStudents([]);
      setSelectedClassId("");
      setFormData((prev) => ({ ...prev, student_id: "" }));
    }
  };

  const handleResolutionStatusChange = (e) => {
    const newStatus = e.target.value;
    setFormData((prev) => ({
      ...prev,
      resolution_status: newStatus,
      resolution_date:
        newStatus === "resolved"
          ? new Date().toISOString().split("T")[0]
          : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSubmit = { ...formData };
      // Only include student_id if one was selected
      if (!dataToSubmit.student_id) {
        delete dataToSubmit.student_id;
      }

      if (isEditing) {
        await updateDisciplinaryRecord(id, dataToSubmit);
      } else {
        await createDisciplinaryRecord(dataToSubmit);
      }

      navigate("/disciplinary");
    } catch (err) {
      console.error("Error saving disciplinary record:", err);
      setError("Failed to save disciplinary record");
    }
  };

  // Mock data for development
  const mockStudents = [
    {
      student_id: 43,
      user: { full_name: "Susan Mendoza" },
      student_code: "SV100042",
    },
    {
      student_id: 44,
      user: { full_name: "Trần Thị B" },
      student_code: "SV100043",
    },
  ];

  const mockClasses = [
    { class_id: 1, class_name: "10A1" },
    { class_id: 2, class_name: "10A2" },
    { class_id: 3, class_name: "11A1" },
  ];

  const mockDisciplinaryRecord = {
    record_id: 1,
    student_id: 43,
    violation_description: "Disrupting class",
    violation_date: "2023-12-31",
    severity_level: "moderate",
    consequences: "Write a letter of apology and after-school detention",
    resolution_status: "open",
    resolution_notes: "",
    student: {
      student_code: "SV100042",
      student_id: 43,
      user: {
        full_name: "Susan Mendoza",
        user_id: 64,
      },
    },
  };

  if (loading || loadingClasses) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link
          to="/disciplinary"
          className="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Chỉnh Sửa Vi Phạm Kỷ Luật" : "Thêm Vi Phạm Kỷ Luật Mới"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 p-4 text-red-700 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Selection First */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="class_id"
              >
                Lớp <span className="text-red-500">*</span>
              </label>
              <select
                id="class_id"
                name="class_id"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedClassId}
                onChange={handleClassChange}
              >
                <option value="">-- Chọn Lớp --</option>
                {classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Selection */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="student_id"
              >
                Học Sinh <span className="text-red-500">*</span>
              </label>
              <select
                id="student_id"
                name="student_id"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.student_id}
                onChange={handleChange}
                disabled={loadingStudents}
              >
                <option value="">-- Chọn Học Sinh --</option>
                {students.map((student) => (
                  <option key={student.student.student_id} value={student.student.student_id}>
                    {student.student.user?.full_name || "Unknown"} (
                    {student.student.student_code})
                  </option>
                ))}
              </select>
              {loadingStudents && (
                <p className="mt-1 text-sm text-gray-500">
                  Đang tải danh sách học sinh...
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="violation_date"
              >
                Ngày Vi Phạm <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="violation_date"
                name="violation_date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.violation_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="violation_description"
              >
                Mô Tả Vi Phạm <span className="text-red-500">*</span>
              </label>
              <textarea
                id="violation_description"
                name="violation_description"
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.violation_description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="severity_level"
              >
                Mức Độ Nghiêm Trọng <span className="text-red-500">*</span>
              </label>
              <select
                id="severity_level"
                name="severity_level"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.severity_level}
                onChange={handleChange}
                required
              >
                <option value="minor">Nhẹ</option>
                <option value="moderate">Trung bình</option>
                <option value="severe">Nghiêm trọng</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="consequences"
              >
                Hậu Quả/Biện Pháp
              </label>
              <input
                type="text"
                id="consequences"
                name="consequences"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.consequences}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="resolution_status"
              >
                Trạng Thái Xử Lý
              </label>
              <select
                id="resolution_status"
                name="resolution_status"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.resolution_status}
                onChange={handleResolutionStatusChange}
              >
                <option value="open">Đang xử lý</option>
                <option value="pending">Đang chờ xử lý</option>
                <option value="resolved">Đã giải quyết</option>              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="resolution_date"
              >
                Ngày Giải Quyết
              </label>
              <input
                type="date"
                id="resolution_date"
                name="resolution_date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                value={formData.resolution_date}
                onChange={handleChange}
                disabled={formData.resolution_status !== "resolved"}
              />
            </div>

            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="resolution_notes"
              >
                Ghi Chú Giải Quyết
              </label>
              <textarea
                id="resolution_notes"
                name="resolution_notes"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.resolution_notes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Link
              to="/disciplinary"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Hủy
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {isEditing ? "Cập Nhật" : "Thêm Mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisciplinaryForm;
