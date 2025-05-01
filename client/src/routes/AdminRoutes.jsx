import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PromptManager from '../components/admin/PromptManager';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../contexts/AuthContext';

const AdminRoutes = () => {
  const { user } = useAuth();

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="prompts" element={<PromptManager />} />
        <Route path="*" element={<Navigate to="prompts" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes; 