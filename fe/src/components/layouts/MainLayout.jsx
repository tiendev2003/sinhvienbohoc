import {
  AcademicCapIcon,
  Bars3Icon,
  BookOpenIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  Cog6ToothIcon as CogIcon,
  CpuChipIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  UserGroupIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { PERMISSIONS, useAuth } from "../../context/AuthContext";

const MainLayout = ({ isAuthenticated }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Đọc trạng thái từ localStorage, mặc định là true
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, hasRole } = useAuth();

  // Use useEffect for navigation instead of during render
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, render nothing until useEffect triggers navigation
  if (!isAuthenticated) {
    return null;
  }

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    // Lưu trạng thái vào localStorage
    localStorage.setItem("sidebarOpen", JSON.stringify(newState));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // Menu items grouped by categories with required permissions
  const menuGroups = [
    {
      title: "Tổng quan",
      items: [
        {
          path: "/",
          label: "Dashboard",
          permission: PERMISSIONS.DASHBOARD,
          icon: HomeIcon,
        },
        {
          path: "/profile",
          label: "Thông tin cá nhân",
          permission: PERMISSIONS.DASHBOARD,
          icon: UserIcon,
          roles: ["student"], // Only visible to these roles
        },
      ],
    },
    {
      title: "Quản lý học tập",
      items: [
        {
          path: "/students",
          label: "Học Sinh",
          permission: PERMISSIONS.STUDENT_VIEW,
          icon: UserGroupIcon,
          roles: ["admin"], // Chỉ admin mới có thể xem danh sách học sinh
        },
        {
          path: "/students/my-classes",
          label: "Lớp Học Của Tôi",
          permission: PERMISSIONS.DASHBOARD,
          icon: AcademicCapIcon,
          roles: ["student"], // Only visible to these roles
        },
        {
          path: "/classes",
          label: "Quản Lý Lớp Học",
          permission: PERMISSIONS.CLASS_VIEW,
          icon: AcademicCapIcon,
          roles: ["admin", "teacher"], // Chỉ admin và giáo viên mới thấy menu này
        },
        {
          path: "/teachers",
          label: "Giáo Viên",
          permission: PERMISSIONS.TEACHER_VIEW,
          icon: UserIcon,
          roles: ["admin", "teacher", "counselor"], // Only visible to these roles
        },
        {
          path: "/subjects",
          label: "Môn Học",
          permission: PERMISSIONS.SUBJECT_VIEW,
          icon: BookOpenIcon,
          roles: ["admin"], // Chỉ admin mới có thể xem danh sách môn học
        },
        {
          path: "/grades",
          label: "Quản lý Điểm",
          permission: PERMISSIONS.GRADE_VIEW,
          icon: DocumentIcon,
          roles: ["teacher"], // Only teachers can see grades management
        },
      ],
    },
    {
      title: "Theo dõi & Phân tích",
      items: [
        {
          path: "/disciplinary",
          label: "Kỷ Luật",
          permission: PERMISSIONS.DISCIPLINARY_VIEW,
          icon: ExclamationCircleIcon,
        },
        
        {
          path: "/dropout-risk/ml-analysis",
          label: "Phân Tích ML",
          permission: PERMISSIONS.DROPOUT_RISK_VIEW,
          icon: CpuChipIcon,
          roles: ["admin"], // Only admin and teachers can see ML analysis
        },
      ],
    },
    {
      title: "Báo cáo & Quản lý",
      items: [
        {
          path: "/reports",
          label: "Báo Cáo",
          permission: PERMISSIONS.REPORTS_VIEW,
          icon: DocumentIcon,
        },
        {
          path: "/users",
          label: "Người Dùng",
          permission: PERMISSIONS.USER_VIEW,
          icon: CogIcon,
          roles: ["admin"], // Only admins can see user management
        },
      ],
    },
  ];
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white ${
          isSidebarOpen ? "w-72" : "w-20"
        } space-y-6 py-4 px-2 absolute inset-y-0 left-0 transform transition-all duration-300 ease-in-out overflow-y-auto z-10 md:relative`}
      >
        <div className="flex items-center justify-between px-4 border-b border-gray-700 pb-4">
          {isSidebarOpen ? (
            <>
              <h2 className="text-xl font-bold">PredictAI</h2>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-700"
              >
                <ChevronDoubleLeftIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-2 mx-auto rounded-md hover:bg-gray-700"
            >
              <ChevronDoubleRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="space-y-3">
          {menuGroups.map((group, groupIndex) => {
            // Check if group has at least one visible item
            const visibleItems = group.items.filter(
              (item) =>
                hasPermission(item.permission) &&
                (!item.roles || item.roles.includes(user?.role))
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIndex} className="px-2">
                {isSidebarOpen && (
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold pl-4 mb-2">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center ${
                          isSidebarOpen ? "gap-3" : "justify-center"
                        } py-2 px-4 rounded-lg transition duration-200 ${
                          isActive
                            ? "bg-indigo-700 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                        title={!isSidebarOpen ? item.label : undefined}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        {isSidebarOpen && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div
            className={`px-${
              isSidebarOpen ? "6" : "2"
            } pt-4 border-t border-gray-700`}
          >
            <button
              onClick={handleLogout}
              className={`flex items-center ${
                isSidebarOpen ? "gap-3" : "justify-center"
              } w-full text-left py-2 px-4 rounded-lg transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white`}
              title={!isSidebarOpen ? "Đăng Xuất" : undefined}
            >
              <LogoutIcon className="h-5 w-5" />
              {isSidebarOpen && <span>Đăng Xuất</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between">
          <div className="flex items-center px-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="ml-2 text-xl font-semibold text-gray-800">
              {location.pathname === "/"
                ? "Dashboard"
                : menuGroups
                    .flatMap((g) => g.items)
                    .find((item) => item.path === location.pathname)?.label ||
                  "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center pr-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-full py-1 px-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user?.role || "User"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
