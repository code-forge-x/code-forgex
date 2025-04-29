// client/src/components/auth/ConditionalDisplay.jsx
import React from 'react';
import useRoleAuth from '../../hooks/useRoleAuth';

/**
 * Component for conditionally displaying content based on user role or permission
 * @param {Object} props - Component props
 * @param {string|string[]} [props.roles] - Role(s) that can see this content
 * @param {string|string[]} [props.permissions] - Permission(s) that can see this content
 * @param {boolean} [props.adminOnly] - If true, only admins can see this content
 * @param {boolean} [props.developerOnly] - If true, only developers can see this content
 * @param {boolean} [props.clientOnly] - If true, only clients can see this content
 * @param {React.ReactNode} props.children - Content to display if conditions are met
 * @param {React.ReactNode} [props.fallback] - Content to display if conditions are not met
 * @returns {React.ReactNode}
 */
const ConditionalDisplay = ({ 
  roles, 
  permissions, 
  adminOnly, 
  developerOnly,
  clientOnly,
  children, 
  fallback = null 
}) => {
  const { hasRole, hasPermission, isAdmin, isDeveloper, isClient } = useRoleAuth();
  
  // Check different conditions
  if (roles && !hasRole(roles)) {
    return fallback;
  }
  
  if (permissions && !hasPermission(permissions)) {
    return fallback;
  }
  
  if (adminOnly && !isAdmin()) {
    return fallback;
  }
  
  if (developerOnly && !isDeveloper()) {
    return fallback;
  }
  
  if (clientOnly && !isClient()) {
    return fallback;
  }
  
  return <>{children}</>;
};

export default ConditionalDisplay;