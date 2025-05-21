// Main routing configuration
import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Layouts
const MainLayout = lazy(() => import('../layouts/main/MainLayout'));
const AdminLayout = lazy(() => import('../layouts/admin/AdminLayout'));

// Lazy-loaded page components
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const PasswordReset = lazy(() => import('../pages/auth/ResetPassword'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const RiskAnalytics = lazy(() => import('../pages/admin/RiskAnalytics'));
const SystemSettings = lazy(() => import('../pages/admin/SystemSettings'));
const Reports = lazy(() => import('../pages/admin/Reports'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const AppRoutes = () => {
  // This is a placeholder for authentication logic
  const isAuthenticated = false;
  const userRole = 'admin'; // For testing admin routes

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <RoleBasedRoute isAuthenticated={isAuthenticated} allowedRoles={['admin']}>
            <AdminLayout />
          </RoleBasedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="risk-analytics" element={<RiskAnalytics />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        
        {/* 404 route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
