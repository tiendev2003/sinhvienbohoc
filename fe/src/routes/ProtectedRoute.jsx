// Protected route component
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router';

/**
 * ProtectedRoute component for routes that require authentication
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children, isAuthenticated, redirectPath = '/login' }) => {
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with the return URL
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  redirectPath: PropTypes.string
};

export default ProtectedRoute;  
