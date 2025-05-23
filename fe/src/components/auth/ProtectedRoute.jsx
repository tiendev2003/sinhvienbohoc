import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ 
  requiredPermission = null, 
  requiredRole = null,
  skipPermissionCheckForRole = null,
  redirectPath = '/login',
  children 
}) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // Show loading indicator if authentication status is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Skip permission check if user has the specified role
  if (skipPermissionCheckForRole && hasRole(skipPermissionCheckForRole)) {
    return children ? children : <Outlet />;
  }

  // Check for required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If there are children, render them, otherwise render the outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
