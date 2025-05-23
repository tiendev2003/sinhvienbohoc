// File: UserList.jsx - List of system users with management capabilities
import { useEffect, useState } from "react";
import { Link } from "react-router";
import DataTable from "../../components/common/DataTable";
import { PERMISSIONS, useAuth } from "../../context/AuthContext";
import { deleteUser, fetchUsers } from "../../services/api";

const UserList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: "all",
    sortBy: "full_name",
  });
  const { hasPermission } = useAuth();

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        const response = await fetchUsers({
          search: searchTerm,
          ...filters,
        });
        setUsers(response?.data || mockUsers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users");
        setLoading(false);
        setUsers(mockUsers);
      }
    };

    fetchUsersData();
  }, [searchTerm, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.user_id !== userId));
      setLoading(false);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Không thể xóa người dùng");
      setLoading(false);
    }
  };

  const columns = [
    { header: "ID", accessor: "user_id" },
    { header: "Họ và Tên", accessor: "full_name" },
    { header: "Email", accessor: "email" },
    {
      header: "Vai trò",
      accessor: "role",
      cell: (row) => {
        const roleColor =
          row.role === "admin"
            ? "bg-purple-100 text-purple-800"
            : row.role === "teacher"
            ? "bg-blue-100 text-blue-800"
            : row.role === "counselor"
            ? "bg-green-100 text-green-800"
            : row.role === "student"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-800";

        const roleLabel =
          {
            admin: "Quản trị viên",
            teacher: "Giáo viên",
            counselor: "Nhân viên tư vấn",
            student: "Sinh viên",
          }[row.role] || row.role;

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${roleColor}`}>
            {roleLabel}
          </span>
        );
      },
    },
    {
      header: "Trạng thái",
      accessor: "account_status",
      cell: (row) => {
        const statusColor =
          row.account_status === "active"
            ? "bg-green-100 text-green-800"
            : row.account_status === "inactive"
            ? "bg-red-100 text-red-800"
            : row.account_status === "suspended"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-800";

        const statusLabel =
          {
            active: "Hoạt động",
            inactive: "Không hoạt động",
            suspended: "Tạm khóa",
          }[row.account_status] || row.account_status;

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {statusLabel}
          </span>
        );
      },
    },
    {
      header: "Đăng nhập cuối",
      accessor: "last_login",
      cell: (row) => {
        return row.last_login
          ? new Date(row.last_login).toLocaleString()
          : "Chưa đăng nhập";
      },
    },
    {
      header: "Thao tác",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Link
            to={`/users/edit/${row.user_id}`}
            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
          >
            Sửa
          </Link>
          {hasPermission(PERMISSIONS.USER_DELETE) && (
            <button
              onClick={() => handleDelete(row.user_id)}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
              Xóa
            </button>
          )}
        </div>
      ),
    },
  ];

  // Mock data for development
  const mockUsers = [
    {
      user_id: 1,
      username: "admin",
      full_name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      account_status: "active",
      last_login: "2023-11-10T10:23:00",
      created_at: "2023-01-01T00:00:00",
      updated_at: "2023-01-01T00:00:00",
    },
    {
      user_id: 2,
      username: "teacher1",
      full_name: "Teacher One",
      email: "teacher1@example.com",
      role: "teacher",
      account_status: "active",
      last_login: "2023-11-09T14:45:00",
      created_at: "2023-01-01T00:00:00",
      updated_at: "2023-01-01T00:00:00",
    },
    {
      user_id: 3,
      username: "staff",
      full_name: "Staff Member",
      email: "staff@example.com",
      role: "counselor",
      account_status: "inactive",
      last_login: "2023-10-25T09:15:00",
      created_at: "2023-01-01T00:00:00",
      updated_at: "2023-01-01T00:00:00",
    },
  ];

  if (loading && !users.length) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  if (error && !users.length) {
    return (
      <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>
    );
  }

  if (!hasPermission(PERMISSIONS.USER_VIEW)) {
    return (
      <div className="bg-yellow-100 p-4 rounded-md">
        <p className="text-yellow-700">Bạn không có quyền xem trang này.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Người Dùng</h1>
        {hasPermission(PERMISSIONS.USER_CREATE) && (
          <Link
            to="/users/new"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Thêm người dùng
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div>
            <select
              name="role"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={filters.role}
              onChange={handleFilterChange}
            >
              {" "}
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="teacher">Giáo viên</option>
              <option value="counselor">Nhân viên tư vấn</option>
              <option value="student">Sinh viên</option>
            </select>
          </div>
          <div>
            <select
              name="status"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="suspended">Tạm khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          pagination={true}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
};

export default UserList;
