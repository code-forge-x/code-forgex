// src/components/auth/RoleProtected.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useRoleAuth from '../../hooks/useRoleAuth';

/**
 * Component that only renders children if user has the required role
 * @param {Object} props - Component props
 * @param {string|string[]} props.roles - Required role(s)
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.redirectTo] - Path to redirect to if unauthorized (defaults to /dashboard)
 * @returns {React.ReactNode} The children or a redirect
 */
const RoleProtected = ({ roles, children, redirectTo = '/dashboard' }) => {
  const { hasRole } = useRoleAuth();
  
  if (!hasRole(roles)) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export default RoleProtected;