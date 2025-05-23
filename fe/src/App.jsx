import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import "./App.css";

// Layouts
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthLayout from "./components/layouts/AuthLayout";
import MainLayout from "./components/layouts/MainLayout";

// Auth Pages
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/auth/Unauthorized";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Student Pages
import MyClasses from "./pages/student/MyClasses";
import StudentDetail from "./pages/student/StudentDetail";
import StudentForm from "./pages/student/StudentForm";
import StudentList from "./pages/student/StudentList";

// Class Pages
import ClassDetail from "./pages/class/ClassDetail";
import ClassForm from "./pages/class/ClassForm";
import ClassList from "./pages/class/ClassList";

// Subject Pages
import SubjectDetail from "./pages/subject/SubjectDetail";
import SubjectForm from "./pages/subject/SubjectForm";
import SubjectList from "./pages/subject/SubjectList";

// Attendance Pages
import TakeAttendance from "./components/attendance/TakeAttendance";
import AttendanceList from "./pages/attendance/AttendanceList";
import AttendanceReport from "./pages/attendance/AttendanceReport";

// Disciplinary Pages
import AddDisciplinaryRecord from "./components/disciplinary/AddDisciplinaryRecord";
import DisciplinaryDetail from "./pages/disciplinary/DisciplinaryDetail";
import DisciplinaryList from "./pages/disciplinary/DisciplinaryList";

// Dropout Risk Pages
import ClassRiskAnalysis from "./pages/dropout/ClassRiskAnalysis";
import DropoutInterventions from "./pages/dropout/DropoutInterventions";
import DropoutRiskDashboard from "./pages/dropout/DropoutRiskDashboard";
import DropoutRiskDetail from "./pages/dropout/DropoutRiskDetail";
import HighRiskStudentsList from "./pages/dropout/HighRiskStudentsList";
import MLDropoutRiskDashboard from "./pages/dropout/MLDropoutRiskDashboard";

// Reports Pages
import AcademicPerformanceReport from "./pages/reports/AcademicPerformanceReport";
import AttendanceAnalytics from "./pages/reports/AttendanceAnalytics";
import ReportsDashboard from "./pages/reports/ReportsDashboard";

// Grade Management
import GradeManagement from "./pages/grade/GradeManagement";
import StudentGradeDetail from "./pages/grade/StudentGradeDetail";

// User Management
import UserForm from "./pages/user/UserForm";
import UserList from "./pages/user/UserList";

// Context
import { AuthProvider } from "./context/AuthContext";
import StudentClassForm from "./pages/class/StudentClassForm";
import EditDisciplinaryForm from "./pages/disciplinary/EditDisciplinaryForm";

// Profile Pages
import StudentProfile from "./pages/profile/StudentProfile";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Protected Routes with MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout isAuthenticated={true} />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute requiredPermission="dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/students"
            element={
              <ProtectedRoute requiredPermission="student_view">
                <StudentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute requiredPermission="student_view">
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/new"
            element={
              <ProtectedRoute requiredPermission="student_create">
                <StudentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/edit/:id"
            element={
              <ProtectedRoute requiredPermission="student_edit">
                <StudentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/my-classes"
            element={
              <ProtectedRoute requiredPermission="student_view">
                <MyClasses />
              </ProtectedRoute>
            }
          />

          {/* Class Management Routes */}
          <Route
            path="/classes"
            element={
              <ProtectedRoute requiredPermission="class_view">
                <ClassList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/new"
            element={
              <ProtectedRoute requiredPermission="class_create">
                <ClassForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:id"
            element={
              <ProtectedRoute requiredPermission="class_view">
                <ClassDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/edit/:id"
            element={
              <ProtectedRoute requiredPermission="class_edit">
                <ClassForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:id/students/add"
            element={
              <ProtectedRoute requiredPermission="class_edit">
                <StudentClassForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:id/risk-analysis"
            element={
              <ProtectedRoute requiredPermission="dropout_risk_view">
                <ClassRiskAnalysis />
              </ProtectedRoute>
            }
          />

          {/* Attendance Management Routes */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute
                requiredPermission="attendance_view"
                requiredRole="teacher"
              >
                <AttendanceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/take"
            element={
              <ProtectedRoute
                requiredPermission="attendance_edit"
                requiredRole="teacher"
              >
                <TakeAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/report"
            element={
              <ProtectedRoute
                requiredPermission="attendance_view"
                requiredRole="teacher"
              >
                <AttendanceReport />
              </ProtectedRoute>
            }
          />

          {/* Disciplinary Management Routes */}
          <Route
            path="/disciplinary"
            element={
              <ProtectedRoute requiredPermission="disciplinary_view">
                <DisciplinaryList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disciplinary/add"
            element={
              <ProtectedRoute requiredPermission="disciplinary_edit">
                <AddDisciplinaryRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disciplinary/edit/:id"
            element={
              <ProtectedRoute requiredPermission="disciplinary_edit">
                <EditDisciplinaryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disciplinary/:id"
            element={
              <ProtectedRoute requiredPermission="disciplinary_view">
                <DisciplinaryDetail />
              </ProtectedRoute>
            }
          />

          {/* Dropout Risk Routes */}
          <Route
            path="/dropout-risk"
            element={
              <ProtectedRoute requiredPermission="dropout_risk_view">
                <DropoutRiskDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dropout-risk/:id"
            element={
              <ProtectedRoute requiredPermission="dropout_risk_view">
                <DropoutRiskDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dropout-risk/interventions"
            element={
              <ProtectedRoute requiredPermission="dropout_intervention_manage">
                <DropoutInterventions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dropout-risk/high-risk"
            element={
              <ProtectedRoute requiredPermission="dropout_risk_view">
                <HighRiskStudentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dropout-risk/ml-analysis"
            element={
              <ProtectedRoute requiredPermission="dropout_risk_view">
                <MLDropoutRiskDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:id/risk-analysis"
            element={
              <ProtectedRoute requiredPermission="dropout_risk_view">
                <ClassRiskAnalysis />
              </ProtectedRoute>
            }
          />

          {/* Reports Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPermission="reports_view">
                <ReportsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/academic"
            element={
              <ProtectedRoute requiredPermission="reports_view">
                <AcademicPerformanceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/attendance"
            element={
              <ProtectedRoute requiredPermission="reports_view">
                <AttendanceAnalytics />
              </ProtectedRoute>
            }
          />

          {/* User Management Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute
                requiredPermission="user_view"
                requiredRole="admin"
              >
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <ProtectedRoute
                requiredPermission="user_create"
                requiredRole="admin"
              >
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              <ProtectedRoute
                requiredPermission="user_edit"
                requiredRole="admin"
              >
                <UserForm />
              </ProtectedRoute>
            }
          />

          {/* Grade Management Routes */}
          <Route
            path="/grades"
            element={
              <ProtectedRoute
                requiredPermission="grade_view"
                requiredRole="teacher"
              >
                <GradeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:studentId/grades"
            element={
              <ProtectedRoute
                requiredPermission="grade_view"
                requiredRole="teacher"
              >
                <StudentGradeDetail />
              </ProtectedRoute>
            }
          />

          {/* Subject Routes */}
          <Route
            path="/subjects"
            element={
              <ProtectedRoute requiredPermission="subject_view">
                <SubjectList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:id"
            element={
              <ProtectedRoute requiredPermission="subject_view">
                <SubjectDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/new"
            element={
              <ProtectedRoute requiredPermission="subject_create">
                <SubjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/edit/:id"
            element={
              <ProtectedRoute requiredPermission="subject_edit">
                <SubjectForm />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirect to login if no route matches */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
