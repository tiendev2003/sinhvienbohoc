// File: DisciplinaryList.jsx - Hiển thị danh sách vi phạm kỷ luật
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import DataTable from "../../components/common/DataTable";
import { PERMISSIONS, useAuth } from "../../context/AuthContext";
import {
  deleteDisciplinaryRecord,
  fetchDisciplinaryRecords,
} from "../../services/api";

const DisciplinaryList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    const getRecords = async () => {
      try {
        setLoading(true);
        const response = await fetchDisciplinaryRecords();
        setRecords(response.data || mockDisciplinaryRecords);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching disciplinary records:", err);
        setError("Failed to load disciplinary records");
        setLoading(false);
        // For development, use mock data if API fails
        setRecords(mockDisciplinaryRecords);
      }
    };

    getRecords();
  }, []);
  const handleDelete = async (recordId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này không?")) {
      try {
        // Gọi API xóa
        await deleteDisciplinaryRecord(recordId);

        // Cập nhật state records sau khi xóa thành công
        setRecords((prevRecords) =>
          prevRecords.filter((record) => record.record_id !== recordId)
        );
        setError(null); // Reset any previous errors
      } catch (err) {
        console.error("Error deleting record:", err);
        if (err.response?.status === 403) {
          setError("Bạn không có quyền xóa bản ghi kỷ luật này.");
        } else {
          setError("Không thể xóa bản ghi. Vui lòng thử lại sau.");
        }
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "severity") {
      setFilterSeverity(value);
    } else if (name === "status") {
      setFilterStatus(value);
    }
  };

  const filteredRecords = records.filter((record) => {
    const studentName = record.student?.user?.full_name || "";
    const violationDesc = record.violation_description || "";

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violationDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      filterSeverity === "all" || record.severity_level === filterSeverity;

    const matchesStatus =
      filterStatus === "all" || record.resolution_status === filterStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const columns = [
    { header: "ID", accessor: "record_id" },
    {
      header: "Mã Sinh Viên",
      accessor: "student.student_code",
      cell: (row) => row.student?.student_code || "N/A",
    },
    {
      header: "Học Sinh",
      accessor: "student.user.full_name",
      cell: (row) => (
        <Link
          to={`/students/${row.student_id}`}
          className="text-blue-600 hover:underline"
        >
          {row.student?.user?.full_name || "N/A"}
        </Link>
      ),
    },
    {
      header: "Ngày Vi Phạm",
      accessor: "violation_date",
      cell: (row) => row.violation_date || "N/A",
    },
    {
      header: "Mô Tả Vi Phạm",
      accessor: "violation_description",
      cell: (row) => row.violation_description || "N/A",
    },
    {
      header: "Mức Độ",
      accessor: "severity_level",
      cell: (row) => {
        const severityColor =
          row.severity_level === "minor"
            ? "bg-yellow-100 text-yellow-800"
            : row.severity_level === "moderate"
            ? "bg-orange-100 text-orange-800"
            : "bg-red-100 text-red-800";

        const severityText =
          row.severity_level === "minor"
            ? "Nhẹ"
            : row.severity_level === "moderate"
            ? "Trung bình"
            : "Nghiêm trọng";

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${severityColor}`}>
            {severityText}
          </span>
        );
      },
    },
    {
      header: "Trạng Thái",
      accessor: "resolution_status",
      cell: (row) => {
        const statusColor =
          row.resolution_status === "resolved"
            ? "bg-green-100 text-green-800"
            : row.resolution_status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-blue-100 text-blue-800";

        const statusText =
          row.resolution_status === "resolved"
            ? "Đã giải quyết"
            : row.resolution_status === "pending"
            ? "Đang chờ xử lý"
            : "Đang xử lý";

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {statusText}
          </span>
        );
      },
    },
    {
      header: "Thao Tác",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Link
            to={`/disciplinary/${row.record_id}`}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Xem
          </Link>

          {hasPermission(PERMISSIONS.DISCIPLINARY_EDIT) && (
            <>
              <Link
                to={`/disciplinary/edit/${row.record_id}`}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                Sửa
              </Link>
              <button
                onClick={() => handleDelete(row.record_id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Xóa
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Mock data for development
  const mockDisciplinaryRecords = [
    {
      record_id: 1,
      student_id: 43,
      violation_description: "Disrupting class",
      violation_date: "2023-12-31",
      severity_level: "moderate",
      resolution_status: "resolved",
      student: {
        student_code: "SV100042",
        student_id: 43,
        user: {
          full_name: "Susan Mendoza",
          user_id: 64,
        },
      },
    },
    {
      record_id: 2,
      student_id: 44,
      violation_description: "Late to class three times",
      violation_date: "2024-01-15",
      severity_level: "minor",
      resolution_status: "pending",
      student: {
        student_code: "SV100043",
        student_id: 44,
        user: {
          full_name: "Trần Thị B",
          user_id: 65,
        },
      },
    },
    {
      record_id: 3,
      student_id: 45,
      violation_description: "Cheating on exam",
      violation_date: "2024-02-10",
      severity_level: "severe",
      resolution_status: "open",
      student: {
        student_code: "SV100044",
        student_id: 45,
        user: {
          full_name: "Lê Văn C",
          user_id: 66,
        },
      },
    },
    {
      record_id: 4,
      student_id: 46,
      violation_description: "Absence without notice",
      violation_date: "2024-03-05",
      severity_level: "minor",
      resolution_status: "pending",
      student: {
        student_code: "SV100045",
        student_id: 46,
        user: {
          full_name: "Phạm Thị D",
          user_id: 67,
        },
      },
    },
    {
      record_id: 5,
      student_id: 44,
      violation_description: "Incomplete homework",
      violation_date: "2024-03-20",
      severity_level: "minor",
      resolution_status: "resolved",
      student: {
        student_code: "SV100043",
        student_id: 44,
        user: {
          full_name: "Trần Thị B",
          user_id: 65,
        },
      },
    },
  ];

  if (loading)
    return (
      <div className="flex justify-center p-8">
        Loading disciplinary records...
      </div>
    );

  if (error)
    return (
      <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Danh Sách Vi Phạm Kỷ Luật
        </h1>

        {hasPermission(PERMISSIONS.DISCIPLINARY_EDIT) && (
          <Link
            to="/disciplinary/add"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Thêm Mới
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tìm Kiếm
            </label>
            <input
              type="text"
              id="search"
              placeholder="Tìm theo tên học sinh hoặc mô tả vi phạm"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="severity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mức Độ
            </label>
            <select
              id="severity"
              name="severity"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filterSeverity}
              onChange={handleFilterChange}
            >
              <option value="all">Tất cả</option>
              <option value="minor">Nhẹ</option>
              <option value="moderate">Trung bình</option>
              <option value="severe">Nghiêm trọng</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Trạng Thái
            </label>
            <select
              id="status"
              name="status"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="all">Tất cả</option>
              <option value="open">Đang xử lý</option>
              <option value="pending">Đang chờ xử lý</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredRecords}
          pagination={true}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
};

export default DisciplinaryList;
