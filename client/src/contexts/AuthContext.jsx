// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define role permissions
const ROLE_PERMISSIONS = {
  admin: {
    templates: {
      create: true,
      read: true,
      update: true,
      delete: true,
      publish: true,
      archive: true
    },
    users: {
      create: true,
      read: true,
      update: true,
      delete: true,
      manageRoles: true
    },
    analytics: {
      view: true,
      export: true,
      manage: true
    },
    settings: {
      view: true,
      update: true
    }
  },
  developer: {
    templates: {
      create: true,
      read: true,
      update: true,
      delete: false,
      publish: true,
      archive: false
    },
    users: {
      create: false,
      read: true,
      update: false,
      delete: false,
      manageRoles: false
    },
    analytics: {
      view: true,
      export: false,
      manage: false
    },
    settings: {
      view: true,
      update: false
    }
  },
  user: {
    templates: {
      create: false,
      read: true,
      update: false,
      delete: false,
      publish: false,
      archive: false
    },
    users: {
      create: false,
      read: false,
      update: false,
      delete: false,
      manageRoles: false
    },
    analytics: {
      view: false,
      export: false,
      manage: false
    },
    settings: {
      view: false,
      update: false
    }
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize axios with base URL and interceptors
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor for authentication
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  // Check if user has permission for a specific action
  const hasPermission = (resource, action) => {
    if (!user || !user.role) return false;
    return ROLE_PERMISSIONS[user.role]?.[resource]?.[action] || false;
  };

  // Check if user has any of the required permissions
  const hasAnyPermission = (resource, actions) => {
    return actions.some(action => hasPermission(resource, action));
  };

  // Check if user has all of the required permissions
  const hasAllPermissions = (resource, actions) => {
    return actions.every(action => hasPermission(resource, action));
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    navigate('/login');
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify token and get user data
  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setError(err.response?.data?.message || 'Session expired');
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    verifyToken();
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;