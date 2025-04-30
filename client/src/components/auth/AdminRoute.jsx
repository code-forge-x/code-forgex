import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

/**
 * A wrapper around routes that require admin authentication
 */
const AdminRoute = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check if user has admin role
  if (currentUser.role !== 'admin') {
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default AdminRoute;