import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import './App.css';

// Layouts
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthLayout from './components/layouts/AuthLayout';
import MainLayout from './components/layouts/MainLayout';

// Auth Pages
import ForgotPassword from './pages/auth/ForgotPassword';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/auth/Unauthorized';

// Dashboard
import Dashboard from './pages/Dashboard';

// Student Pages
import StudentDetail from './pages/student/StudentDetail';
import StudentForm from './pages/student/StudentForm';
import StudentList from './pages/student/StudentList';

// Class Pages
import ClassDetail from './pages/class/ClassDetail';
import ClassForm from './pages/class/ClassForm';
import ClassList from './pages/class/ClassList';

// Subject Pages
import SubjectDetail from './pages/subject/SubjectDetail';
import SubjectForm from './pages/subject/SubjectForm';
import SubjectList from './pages/subject/SubjectList';

// Attendance Pages
import AttendanceForm from './pages/attendance/AttendanceForm';
import AttendanceList from './pages/attendance/AttendanceList';
import AttendanceReport from './pages/attendance/AttendanceReport';

// Disciplinary Pages
 import DisciplinaryDetail from './pages/disciplinary/DisciplinaryDetail';
import DisciplinaryForm from './pages/disciplinary/DisciplinaryForm';
import DisciplinaryList from './pages/disciplinary/DisciplinaryList';

// Dropout Risk Pages
import ClassRiskAnalysis from './pages/dropout/ClassRiskAnalysis';
import DropoutInterventions from './pages/dropout/DropoutInterventions';
import DropoutRiskDashboard from './pages/dropout/DropoutRiskDashboard';
import DropoutRiskDetail from './pages/dropout/DropoutRiskDetail';
import HighRiskStudentsList from './pages/dropout/HighRiskStudentsList';

// Reports Pages
import AcademicPerformanceReport from './pages/reports/AcademicPerformanceReport';
import AttendanceAnalytics from './pages/reports/AttendanceAnalytics';
import ReportsDashboard from './pages/reports/ReportsDashboard';

// User Management
import UserForm from './pages/user/UserForm';
import UserList from './pages/user/UserList';

// Parent Pages
import ParentDetail from './pages/parent/ParentDetail';
import ParentForm from './pages/parent/ParentForm';
import ParentList from './pages/parent/ParentList';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
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
        <Route element={<ProtectedRoute><MainLayout isAuthenticated={true} /></ProtectedRoute>}>
          {/* Dashboard */}
          <Route path="/" element={<ProtectedRoute requiredPermission="dashboard"><Dashboard /></ProtectedRoute>} />
          
          {/* Student Routes */}
          <Route path="/students" element={<ProtectedRoute requiredPermission="student_view"><StudentList /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute requiredPermission="student_view"><StudentDetail /></ProtectedRoute>} />
          <Route path="/students/new" element={<ProtectedRoute requiredPermission="student_create"><StudentForm /></ProtectedRoute>} />
          <Route path="/students/edit/:id" element={<ProtectedRoute requiredPermission="student_edit"><StudentForm /></ProtectedRoute>} />
          
          {/* Class Routes */}
          <Route path="/classes" element={<ProtectedRoute requiredPermission="class_view"><ClassList /></ProtectedRoute>} />
          <Route path="/classes/:id" element={<ProtectedRoute requiredPermission="class_view"><ClassDetail /></ProtectedRoute>} />
          <Route path="/classes/new" element={<ProtectedRoute requiredPermission="class_create"><ClassForm /></ProtectedRoute>} />
          <Route path="/classes/edit/:id" element={<ProtectedRoute requiredPermission="class_edit"><ClassForm /></ProtectedRoute>} />
          
          {/* Subject Routes */}
          <Route path="/subjects" element={<ProtectedRoute requiredPermission="subject_view"><SubjectList /></ProtectedRoute>} />
          <Route path="/subjects/:id" element={<ProtectedRoute requiredPermission="subject_view"><SubjectDetail /></ProtectedRoute>} />
          <Route path="/subjects/new" element={<ProtectedRoute requiredPermission="subject_create"><SubjectForm /></ProtectedRoute>} />
          <Route path="/subjects/edit/:id" element={<ProtectedRoute requiredPermission="subject_edit"><SubjectForm /></ProtectedRoute>} />
          
          {/* Attendance Routes */}
          <Route path="/attendance" element={<ProtectedRoute requiredPermission="attendance_view"><AttendanceList /></ProtectedRoute>} />
          <Route path="/attendance/new" element={<ProtectedRoute requiredPermission="attendance_create"><AttendanceForm /></ProtectedRoute>} />
          <Route path="/attendance/report" element={<ProtectedRoute requiredPermission="attendance_view"><AttendanceReport /></ProtectedRoute>} />
          
          {/* Disciplinary Routes */}
          <Route path="/disciplinary" element={<ProtectedRoute requiredPermission="disciplinary_view"><DisciplinaryList /></ProtectedRoute>} />
          <Route path="/disciplinary/:id" element={<ProtectedRoute requiredPermission="disciplinary_view"><DisciplinaryDetail /></ProtectedRoute>} />
          <Route path="/disciplinary/new" element={<ProtectedRoute requiredPermission="disciplinary_create"><DisciplinaryForm /></ProtectedRoute>} />
          <Route path="/disciplinary/edit/:id" element={<ProtectedRoute requiredPermission="disciplinary_edit"><DisciplinaryForm /></ProtectedRoute>} />
          
          {/* Dropout Risk Routes */}
          <Route path="/dropout-risk" element={<ProtectedRoute requiredPermission="dropout_risk_view"><DropoutRiskDashboard /></ProtectedRoute>} />
          <Route path="/dropout-risk/:id" element={<ProtectedRoute requiredPermission="dropout_risk_view"><DropoutRiskDetail /></ProtectedRoute>} />
          <Route path="/dropout-risk/interventions" element={<ProtectedRoute requiredPermission="dropout_intervention_manage"><DropoutInterventions /></ProtectedRoute>} />
          <Route path="/dropout-risk/high-risk" element={<ProtectedRoute requiredPermission="dropout_risk_view"><HighRiskStudentsList /></ProtectedRoute>} />
          <Route path="/classes/:id/risk-analysis" element={<ProtectedRoute requiredPermission="dropout_risk_view"><ClassRiskAnalysis /></ProtectedRoute>} />
          
          {/* Reports Routes */}
          <Route path="/reports" element={<ProtectedRoute requiredPermission="reports_view"><ReportsDashboard /></ProtectedRoute>} />
          <Route path="/reports/academic" element={<ProtectedRoute requiredPermission="reports_view"><AcademicPerformanceReport /></ProtectedRoute>} />
          <Route path="/reports/attendance" element={<ProtectedRoute requiredPermission="reports_view"><AttendanceAnalytics /></ProtectedRoute>} />
          
          {/* User Management Routes */}
          <Route path="/users" element={<ProtectedRoute requiredPermission="user_view" requiredRole="admin"><UserList /></ProtectedRoute>} />
          <Route path="/users/new" element={<ProtectedRoute requiredPermission="user_create" requiredRole="admin"><UserForm /></ProtectedRoute>} />
          <Route path="/users/edit/:id" element={<ProtectedRoute requiredPermission="user_edit" requiredRole="admin"><UserForm /></ProtectedRoute>} />
          
          {/* Parent Routes */}
          <Route path="/parents" element={<ProtectedRoute requiredPermission="parent_view"><ParentList /></ProtectedRoute>} />
          <Route path="/parents/:id" element={<ProtectedRoute requiredPermission="parent_view"><ParentDetail /></ProtectedRoute>} />
          <Route path="/parents/new" element={<ProtectedRoute requiredPermission="parent_create"><ParentForm /></ProtectedRoute>} />
          <Route path="/parents/edit/:id" element={<ProtectedRoute requiredPermission="parent_edit"><ParentForm /></ProtectedRoute>} />
        </Route>

        {/* Redirect to login if no route matches */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
