// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Authentication Context
 * Manages authentication state across the application
 */
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  /**
   * Check if the user is already authenticated
   * Verifies the token with the backend
   */
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    
    try {
      // Add your API endpoint to verify token
      const response = await axios.get('/api/auth/verify', {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.data.valid) {
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Check authentication status when the component mounts
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  /**
   * Log in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - User data
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - User data
   */
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };
  
  /**
   * Log out the current user
   */
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register, // New register function
    logout,
    checkAuthStatus
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;