// client/src/components/auth/PrivateRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust if your auth context is in a different location

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuthStatus } = useAuth();
  const location = useLocation();

  // Check auth status when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // If authentication is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    // Save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute;