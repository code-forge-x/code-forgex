// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/privateRoute';

// Auth components
import Login from './components/auth/Login';
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Chat and support components
// import Chat from './components/chat/Chat';
import SupportConversation from './components/Support/SupportConversation';

// Project components
// import ProjectChat from './components/chat/ProjectChat';
import BlueprintViewer from './components/Blueprint/BlueprintViewer';
import ComponentViewer from './components/Component/ComponentViewer';

// Admin components
import PromptManagement from './components/Admin/PromptManagement';

// Layout and other components
import Dashboard from './pages/Dashboard';
// import Navbar from './components/layout/Navbar';
// import Footer from './components/layout/Footer';
import NotFound from './pages/NotFound';

/**
 * Main App Component
 * Sets up routing and authentication
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* <Navbar /> */}
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
              
              {/* Chat routes */}
              {/* <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                } 
              /> */}
              
              {/* Project-specific routes */}
              {/* <Route 
                path="/project/:projectId/chat" 
                element={
                  <PrivateRoute>
                    <ProjectChat />
                  </PrivateRoute>
                } 
              /> */}
              
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
              
              {/* Admin routes */}
              <Route 
                path="/admin/prompts" 
                element={
                  <PrivateRoute>
                    <PromptManagement />
                  </PrivateRoute>
                } 
              />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {/* <Footer /> */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;