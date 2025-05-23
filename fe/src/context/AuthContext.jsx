import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, login as loginApi } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Define user roles and their permissions
export const USER_ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  COUNSELOR: "counselor",
  STUDENT: "student",
};

// Define permissionsfor each module
export const PERMISSIONS = {
  DASHBOARD: "dashboard",
  // Student related permissions
  STUDENT_VIEW: "student_view",
  STUDENT_CREATE: "student_create",
  STUDENT_EDIT: "student_edit",
  STUDENT_DELETE: "student_delete",

  // Class related permissions
  CLASS_VIEW: "class_view",
  CLASS_CREATE: "class_create",
  CLASS_EDIT: "class_edit",
  CLASS_DELETE: "class_delete",

  // Subject related permissions
  SUBJECT_VIEW: "subject_view",
  SUBJECT_CREATE: "subject_create",
  SUBJECT_EDIT: "subject_edit",
  SUBJECT_DELETE: "subject_delete",

  // Attendance related permissions
  ATTENDANCE_VIEW: "attendance_view",
  ATTENDANCE_CREATE: "attendance_create",
  ATTENDANCE_EDIT: "attendance_edit",

  // Disciplinary related permissions
  DISCIPLINARY_VIEW: "disciplinary_view",
  DISCIPLINARY_CREATE: "disciplinary_create",
  DISCIPLINARY_EDIT: "disciplinary_edit",
  DISCIPLINARY_DELETE: "disciplinary_delete",

  // Dropout risk related permissions
  DROPOUT_RISK_VIEW: "dropout_risk_view",
  DROPOUT_INTERVENTION_MANAGE: "dropout_intervention_manage",

  // Reports related permissions
  REPORTS_VIEW: "reports_view",
  REPORTS_EXPORT: "reports_export",

  // User management related permissions
  USER_VIEW: "user_view",
  USER_CREATE: "user_create",
  USER_EDIT: "user_edit",
  USER_DELETE: "user_delete",
};

// Define role-based permissions
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin has all permissions
  [USER_ROLES.TEACHER]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.CLASS_VIEW,
    PERMISSIONS.SUBJECT_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_EDIT,
    PERMISSIONS.DISCIPLINARY_VIEW,
    PERMISSIONS.DISCIPLINARY_CREATE,
    PERMISSIONS.DISCIPLINARY_EDIT,
    PERMISSIONS.DROPOUT_RISK_VIEW,
  ],
  [USER_ROLES.COUNSELOR]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.DROPOUT_RISK_VIEW,
    PERMISSIONS.DROPOUT_INTERVENTION_MANAGE,
    PERMISSIONS.DISCIPLINARY_VIEW,
    PERMISSIONS.DISCIPLINARY_CREATE,
    PERMISSIONS.DISCIPLINARY_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],
  [USER_ROLES.STUDENT]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.STUDENT_VIEW, // Only their own data
    PERMISSIONS.ATTENDANCE_VIEW, // Only their own data
    PERMISSIONS.DISCIPLINARY_VIEW, // Only their own data
    PERMISSIONS.DROPOUT_RISK_VIEW, // Only their own data
  ],
  [USER_ROLES.PARENT]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.STUDENT_VIEW, // Only their children's data
    PERMISSIONS.ATTENDANCE_VIEW, // Only their children's data
    PERMISSIONS.DISCIPLINARY_VIEW, // Only their children's data
    PERMISSIONS.DROPOUT_RISK_VIEW, // Only their children's data
    PERMISSIONS.PARENT_VIEW, // Only their own data
  ],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Validate token with backend
          try {
            const response = await getProfile();
            const userData = response.data;
            setUser(userData);

            setIsAuthenticated(true);
            // Set permissions based on user role
            setUserPermissions(ROLE_PERMISSIONS[userData.role] || []);
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);
  const login = async (credentials) => {
    try {
      // Call login API
      const response = await loginApi(credentials);
      const { access_token } = response.data;

      localStorage.setItem("token", access_token);

      // Get user profile using the new token
      try {
        const userResponse = await getProfile();
        const userData = userResponse.data;
        setUser(userData);
        setIsAuthenticated(true);
        // Set permissions based on user role
        setUserPermissions(ROLE_PERMISSIONS[userData.role] || []);
      } catch (profileError) {
        console.error("Failed to fetch user profile:", profileError);
        localStorage.removeItem("token");
        return {
          success: false,
          error: "Failed to get user profile after login",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setUserPermissions([]);
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    userPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
