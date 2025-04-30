// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleProvider, useRole } from './contexts/RoleContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import RoleProtected from './components/auth/RoleProtected';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
// Auth components
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from "./pages/ForgotPassword";

// Chat and support components
import SupportConversation from './components/Support/SupportConversation';

// Project components
import BlueprintViewer from './components/Blueprint/BlueprintViewer';
import ComponentViewer from './components/Component/ComponentViewer';

// Admin components
import AdminDashboard from './pages/AdminDashboard';
import PromptManagement from './components/Admin/PromptManagement';

// Layout and other components
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import UserDashboard from './pages/UserDashboard';
import ClientDashboard from './pages/ClientDashboard';

// Admin Pages
import UserConsole from './pages/admin/UserConsole';
import RoleManager from './pages/admin/RoleManager';
import GlobalSettings from './pages/admin/GlobalSettings';
import IntegrationSettings from './pages/admin/IntegrationSettings';
import TokenManagement from './pages/admin/TokenManagement';
import UsageMetrics from './pages/admin/analytics/UsageMetrics';
import PerformanceMetrics from './pages/admin/analytics/PerformanceMetrics';
import CostAnalytics from './pages/admin/analytics/CostAnalytics';
import PromptEditor from './pages/admin/prompts/PromptEditor';
import VersionControl from './pages/admin/prompts/VersionControl';
import PromptPerformance from './pages/admin/prompts/PromptPerformance';
import CrawlerConfig from './pages/admin/documents/CrawlerConfig';
import IndexManager from './pages/admin/documents/IndexManager';
import DocumentAnalytics from './pages/admin/documents/DocumentAnalytics';

// Import CSS stylesheets
import './styles/auth.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/promptManagement.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007acc',
    },
    secondary: {
      main: '#d4d4d4',
    },
    background: {
      default: '#1e1e1e',
      paper: '#252526',
    },
    text: {
      primary: '#d4d4d4',
      secondary: '#888',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

/**
 * Main App Component
 * Sets up routing with role-based access control
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RoleProvider>
          <Router>
            <div className="app-container">
              <main className="main-content">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  {/* Root redirect based on role */}
                  <Route path="/" element={
                    <PrivateRoute>
                      <RoleBasedRedirect />
                    </PrivateRoute>
                  } />
                  
                  {/* Admin routes - all admin features under /admin */}
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
                    {/* Default admin route */}
                    <Route index element={<UserConsole />} />
                    
                    {/* User Management */}
                    <Route path="users" element={<UserConsole />} />
                    <Route path="roles" element={<RoleManager />} />
                    
                    {/* System Configuration */}
                    <Route path="settings" element={<GlobalSettings />} />
                    <Route path="integrations" element={<IntegrationSettings />} />
                    
                    {/* Token Management */}
                    <Route path="tokens" element={<TokenManagement />} />
                    
                    {/* Analytics */}
                    <Route path="analytics">
                      <Route path="usage" element={<UsageMetrics />} />
                      <Route path="performance" element={<PerformanceMetrics />} />
                      <Route path="costs" element={<CostAnalytics />} />
                    </Route>
                    
                    {/* Prompt Management */}
                    <Route path="prompts">
                      <Route path="editor" element={<PromptEditor />} />
                      <Route path="versions" element={<VersionControl />} />
                      <Route path="performance" element={<PromptPerformance />} />
                    </Route>
                    
                    {/* Document Management */}
                    <Route path="documents">
                      <Route path="crawler" element={<CrawlerConfig />} />
                      <Route path="index" element={<IndexManager />} />
                      <Route path="analytics" element={<DocumentAnalytics />} />
                    </Route>
                  </Route>
                  
                  {/* User routes */}
                  <Route 
                    path="/user/*" 
                    element={
                      <RoleProtected roles={['user']}>
                        <UserDashboard />
                      </RoleProtected>
                    } 
                  />
                  
                  {/* Client routes */}
                  <Route 
                    path="/client/*" 
                    element={
                      <RoleProtected roles={['client']}>
                        <ClientDashboard />
                      </RoleProtected>
                    } 
                  />
                  
                  {/* 404 Not Found */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Component to redirect users to their role-specific dashboard
 */
const RoleBasedRedirect = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Use currentUser.role directly
  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (currentUser.role === 'developer') {
    return <Navigate to="/user" replace />;
  }
  if (currentUser.role === 'client') {
    return <Navigate to="/client" replace />;
  }
  // Default fallback
  return <Navigate to="/dashboard" replace />;
};

export default App;