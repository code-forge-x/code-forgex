// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleProtected from './components/auth/RoleProtected';
import Projects from './pages/Projects'; // Add this import
import ProjectDetail from './pages/ProjectDetail'; // Add this import
// Auth components
import Login from './components/auth/Login';
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Chat and support components
import SupportConversation from './components/Support/SupportConversation';

// Project components
import BlueprintViewer from './components/Blueprint/BlueprintViewer';
import ComponentViewer from './components/Component/ComponentViewer';

// Admin components
import PromptManagement from './components/Admin/PromptManagement';

// Layout and other components
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Import CSS stylesheets
import './styles/auth.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/promptManagement.css'; // Add this new import for prompt management styles

/**
 * Main App Component
 * Sets up routing with role-based access control
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <main className="main-content">
            <Routes>
              {/* Public routes - accessible without authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Redirect root to dashboard or login */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Protected routes - require authentication */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              
              {/* Projects routes */}
              <Route 
                path="/projects" 
                element={
                  <PrivateRoute>
                    <Projects />
                  </PrivateRoute>
                } 
              />
              
              
              
              <Route 
                path="/project/:projectId" 
                element={
                  <PrivateRoute>
                    <ProjectDetail />
                  </PrivateRoute>
                } 
              />
              
              {/* Project-specific routes - accessible to all authenticated users */}
              <Route 
                path="/project/:projectId/support/:supportId?" 
                element={
                  <PrivateRoute>
                    <SupportConversation />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/project/:projectId/blueprint" 
                element={
                  <PrivateRoute>
                    <BlueprintViewer />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/project/:projectId/components" 
                element={
                  <PrivateRoute>
                    <ComponentViewer />
                  </PrivateRoute>
                } 
              />
              
              {/* Admin routes - only accessible by admins */}
              <Route 
                path="/admin/prompts" 
                element={
                  <PrivateRoute>
                    <RoleProtected roles="admin" redirectTo="/dashboard">
                      <PromptManagement />
                    </RoleProtected>
                  </PrivateRoute>
                } 
              />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;