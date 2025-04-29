// src/hooks/useRoleAuth.js
import { useAuth } from '../contexts/AuthContext';

export function useRoleAuth() {
  const { currentUser } = useAuth();
  
  // Check if user has a specific role
  const hasRole = (roles) => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    
    // Handle array of roles
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    
    // Handle single role
    return userRole === roles;
  };
  
  // Check if user is an admin
  const isAdmin = () => {
    return hasRole('admin');
  };
  
  // Check if user is a developer
  const isDeveloper = () => {
    return hasRole('developer');
  };
  
  // Check if user is a client
  const isClient = () => {
    return hasRole('client');
  };
  
  return {
    hasRole,
    isAdmin,
    isDeveloper,
    isClient
  };
}

export default useRoleAuth;