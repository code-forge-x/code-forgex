import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export function useRoles() {
  return useContext(RoleContext);
}

export function RoleProvider({ children }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      api.get('/api/roles')
        .then(response => {
          setRoles(response.data);
          setError(null);
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Error fetching roles');
          setRoles([]);
        })
        .finally(() => setLoading(false));
    } else {
      setRoles([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createRole = async (roleData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/roles', roleData);
      setRoles(prevRoles => [...prevRoles, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error creating role:', err);
      setError(err.response?.data?.message || 'Error creating role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, roleData) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/roles/${id}`, roleData);
      setRoles(prevRoles => 
        prevRoles.map(role => role._id === id ? response.data : role)
      );
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.response?.data?.message || 'Error updating role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/roles/${id}`);
      setRoles(prevRoles => prevRoles.filter(role => role._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting role:', err);
      setError(err.response?.data?.message || 'Error deleting role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRoleById = (id) => {
    return roles.find(role => role._id === id);
  };

  const getDefaultRole = () => {
    return roles.find(role => role.isDefault);
  };

  const value = {
    roles,
    loading,
    error,
    fetchRoles: () => {}, // no-op, for compatibility
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    getDefaultRole
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export default RoleContext; 