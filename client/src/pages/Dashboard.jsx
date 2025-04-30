// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Home as HomeIcon,
  AccountTree as ProjectIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';

/**
 * Dashboard Component
 * Admin panel with sidebar navigation
 */
const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [supportThreads, setSupportThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        const config = { headers: { 'x-auth-token': token } };
        const [projectsResponse, supportResponse] = await Promise.all([
          axios.get('/api/projects', config),
          axios.get('/api/support', config)
        ]);
        
        setProjects(projectsResponse.data || []);
        setSupportThreads(supportResponse.data || []);
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: <HomeIcon />, label: 'Dashboard' },
    { path: '/projects', icon: <ProjectIcon />, label: 'Projects' },
    { path: '/support', icon: <ChatIcon />, label: 'Support' },
    { path: '/admin/prompts', icon: <SettingsIcon />, label: 'Admin Settings' },
    { path: '/profile', icon: <PersonIcon />, label: 'Profile' }
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>CodeForegX</h2>
          <button 
            className="toggle-sidebar" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogoutIcon />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1>Welcome, {currentUser?.name}</h1>
        </div>

        <div className="dashboard-content">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              {/* Projects Section */}
              <section className="dashboard-section">
                <h2>Recent Projects</h2>
                <div className="projects-grid">
                  {projects.slice(0, 4).map((project) => (
                    <Link 
                      key={project._id} 
                      to={`/project/${project._id}`}
                      className="project-card"
                    >
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      <span className={`status ${project.status}`}>
                        {formatStatus(project.status)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Support Threads Section */}
              <section className="dashboard-section">
                <h2>Recent Support Threads</h2>
                <div className="support-list">
                  {supportThreads.slice(0, 5).map((thread) => (
                    <Link 
                      key={thread._id} 
                      to={`/project/${thread.projectId}/support/${thread._id}`}
                      className="support-item"
                    >
                      <div className="thread-info">
                        <h3>{thread.subject}</h3>
                        <p>{thread.lastMessage}</p>
                      </div>
                      <span className={`status ${thread.status}`}>
                        {formatStatus(thread.status)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const formatStatus = (status) => {
  const statusMap = {
    active: 'Active',
    completed: 'Completed',
    pending: 'Pending',
    open: 'Open',
    closed: 'Closed'
  };
  return statusMap[status] || status;
};

export default Dashboard;