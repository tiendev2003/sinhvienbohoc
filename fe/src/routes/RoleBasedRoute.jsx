// Role-based route component
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router';

/**
 * RoleBasedRoute component ensures only users with specific roles can access certain routes
 * For example, only admins can access admin routes
 */
const RoleBasedRoute = ({ 
  children, 
  isAuthenticated, 
  userRole = 'admin', // Default role for testing
  allowedRoles, 
  redirectPath = '/dashboard' 
}) => {
  const location = useLocation();

  // First check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Then check if user has the required role
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If authenticated and has the proper role, render the children
  return children;
};

RoleBasedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  userRole: PropTypes.string,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  redirectPath: PropTypes.string
};

export default RoleBasedRoute;
