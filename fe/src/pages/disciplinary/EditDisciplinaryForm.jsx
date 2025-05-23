// File: EditDisciplinaryForm.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
    fetchClasses,
    fetchDisciplinaryById,
    fetchStudentsByClass,
    updateDisciplinaryRecord,
} from "../../services/api";

const EditDisciplinaryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    student_id: "",
    violation_date: "",
    violation_description: "",
    severity_level: "minor",
    consequences: "",
    resolution_status: "open",
    resolution_notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingClasses(true);

        // Fetch record data
        const recordResponse = await fetchDisciplinaryById(id);
        const record = recordResponse?.data;

        if (record) {
          setFormData({
            student_id: record.student_id || "",
            class_id: record.student?.class_id || "",
            violation_date: record.violation_date || "",
            violation_description: record.violation_description || "",
            severity_level: record.severity_level || "minor",
            consequences: record.consequences || "",
            resolution_status: record.resolution_status || "open",
            resolution_notes: record.resolution_notes || "",
          });

          // Nếu có class_id từ thông tin học sinh
          if (record.student?.class_id) {
            setSelectedClassId(record.student.class_id.toString());
            await fetchStudentsForClass(record.student.class_id.toString());
          }

          // Fetch all classes
          const classesResponse = await fetchClasses();
          setClasses(classesResponse?.data || []);
          setLoadingClasses(false);

          // If record has a class_id, fetch its students
          if (record.class_id) {
            setSelectedClassId(record.class_id);
            await fetchStudentsForClass(record.class_id);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch record data");
        setLoading(false);
        setLoadingClasses(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchStudentsForClass = async (classId) => {
    try {
      setLoadingStudents(true);
      const response = await fetchStudentsByClass(classId);
      setStudents(response?.data || []);
      setLoadingStudents(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setLoadingStudents(false);
      setStudents([]);
    }
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setFormData((prev) => ({ ...prev, student_id: "" }));

    if (classId) {
      await fetchStudentsForClass(classId);
    } else {
      setStudents([]);
    }
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
      setSubmitting(true);
      setError(null); // Tạo object chứa dữ liệu cần cập nhật
      const updateData = {
        student_id: formData.student_id || null,
        class_id: selectedClassId || null,
        violation_date: formData.violation_date,
        violation_description: formData.violation_description,
        severity_level: formData.severity_level,
        consequences: formData.consequences,
        resolution_status: formData.resolution_status,
        resolution_notes: formData.resolution_notes,
      };

      await updateDisciplinaryRecord(id, updateData);
      navigate(`/disciplinary/${id}`);
    } catch (err) {
      console.error("Error updating record:", err);
      setError("Failed to update record");
      setSubmitting(false);
    }
  };

  if (loading || loadingClasses) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link
          to={`/disciplinary/${id}`}
          className="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          Chỉnh Sửa Vi Phạm Kỷ Luật
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Selection */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="class_id"
              >
                Lớp
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
                Học Sinh
              </label>
              <select
                id="student_id"
                name="student_id"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.student_id}
                onChange={handleChange}
                disabled={!selectedClassId || loadingStudents}
              >
                <option value="">-- Chọn Học Sinh --</option>
                {students.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.user?.full_name} ({student.student_code})
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
                onChange={handleChange}
              >
                <option value="open">Đang xử lý</option>
                <option value="pending">Đang chờ xử lý</option>
                <option value="resolved">Đã giải quyết</option>
              </select>
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
              to={`/disciplinary/${id}`}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Hủy
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={submitting}
            >
              {submitting ? "Đang Cập Nhật..." : "Cập Nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDisciplinaryForm;
