// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
  const verifyAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setCurrentUser(null);
      setIsAuthenticated(false);
      return;
    }
    try {
      const response = await api.get('/api/auth/verify');
      if (response.data.valid) {
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    verifyAuth();
  }, []);
  
  /**
   * Log in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - User data
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      // Immediately verify token and update state
      await verifyAuth();
      return response.data.user;
    } catch (error) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - User data
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      // Immediately verify token and update state
      await verifyAuth();
      return response.data.user;
    } catch (error) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
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
    register,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;