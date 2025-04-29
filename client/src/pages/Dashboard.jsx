// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import axios from 'axios';

/**
 * Dashboard Component
 * Main dashboard showing projects and activities
 */
const Dashboard = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [supportThreads, setSupportThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Set up axios config
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        // Get user's projects
        const projectsResponse = await axios.get('/api/projects', config);
        
        // Get user's support conversations
        const supportResponse = await axios.get('/api/support', config);
        
        // Update state with data
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

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1>Welcome, {currentUser?.name || 'User'}</h1>
        <p>Here's an overview of your projects and activities</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {isLoading ? (
        <div className="loading-indicator">Loading dashboard data...</div>
      ) : (
        <div className="dashboard-grid">
          {/* Projects Section */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Your Projects</h2>
              <Link to="/projects" className="view-all-link">View All</Link>
            </div>
            
            <div className="card-content">
              {projects.length > 0 ? (
                <ul className="project-list">
                  {projects.slice(0, 5).map((project) => (
                    <li key={project._id} className="project-item">
                      <Link to={`/project/${project._id}`} className="project-link">
                        <span className="project-name">{project.name}</span>
                        <span className="project-status">{formatStatus(project.status)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <p>You don't have any projects yet.</p>
                  <Link to="/projects/new" className="create-new-button">
                    Create New Project
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Support Section */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Support Conversations</h2>
              <Link to="/support" className="view-all-link">View All</Link>
            </div>
            
            <div className="card-content">
              {supportThreads.length > 0 ? (
                <ul className="support-list">
                  {supportThreads.slice(0, 5).map((thread) => (
                    <li key={thread.supportId} className="support-item">
                      <Link to={`/support/${thread.supportId}`} className="support-link">
                        <span className="support-title">{thread.title}</span>
                        <span className="support-status">{formatStatus(thread.status)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <p>No support conversations found.</p>
                  <Link to="/support/new" className="create-new-button">
                    Create Support Ticket
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Quick Actions</h2>
            </div>
            
            <div className="card-content">
              <div className="quick-actions">
                <Link to="/projects/new" className="action-button">
                  Create New Project
                </Link>
                
                <Link to="/support/new" className="action-button">
                  Open Support Ticket
                </Link>
                
                {currentUser && currentUser.role === 'admin' && (
                  <Link to="/admin/prompts" className="action-button admin-action">
                    Manage Prompts
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

/**
 * Format status string for display
 * @param {string} status - Status string from API
 * @returns {string} - Formatted status
 */
const formatStatus = (status) => {
  if (!status) return 'Unknown';
  
  // Convert status like 'requirements_gathering' to 'Requirements Gathering'
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default Dashboard;