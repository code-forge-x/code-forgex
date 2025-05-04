// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import PromptList from './components/prompts/PromptList';
import PromptEditor from './components/prompts/PromptEditor';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PromptManagement from './components/Admin/PromptManagement';
import VersionControl from './pages/admin/prompts/VersionControl';
import PromptPerformance from './pages/admin/prompts/PromptPerformance';
import PerformanceDashboard from './pages/admin/analytics/PerformanceDashboard';
import VectorVisualization from './pages/admin/embeddings/VectorVisualization';
import RequirementsDashboard from './components/user/RequirementsDashboard';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider> {/* ✅ moved here */}
          <div className="app-container">
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Layout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="prompts">
                    <Route index element={<PromptList />} />
                    <Route path="new" element={<PromptEditor />} />
                    <Route path=":id" element={<PromptEditor />} />
                    <Route path="management" element={<PromptManagement />} />
                    <Route path="version-control" element={<VersionControl />} />
                    <Route path="performance" element={<PromptPerformance />} />
                  </Route>
                  <Route path="admin">
                    <Route path="analytics" element={<PerformanceDashboard />} />
                    <Route path="embeddings" element={<VectorVisualization />} />
                  </Route>
                  <Route path="requirements" element={<RequirementsDashboard />} />
                </Route>
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};


export default App;