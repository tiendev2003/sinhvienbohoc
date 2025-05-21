// Authentication hook
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to use the authentication context
 * @returns {Object} Auth context with user, isAuthenticated, login, logout, etc.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};  
