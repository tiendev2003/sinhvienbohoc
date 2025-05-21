// Authentication context provider
import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useState } from 'react';

// Create the Auth Context
export const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // For now, just check local storage. In production, verify with an API call
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        setError(err.message);
        console.error('Authentication check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call - in production, this would be a real API call
      // const response = await authService.login(username, password);
      
      // Mock successful login
      const mockUser = {
        id: 1,
        username,
        role: 'student', // Default role for demo
        fullName: 'Demo User',
        email: `${username}@example.com`
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      return mockUser;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call - in production, this would be a real API call
      // const response = await authService.register(userData);
      
      // Mock successful registration
      const mockUser = {
        id: Math.floor(Math.random() * 1000),
        username: userData.username,
        role: userData.role || 'student',
        fullName: userData.fullName,
        email: userData.email
      };
      
      return mockUser;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};  
