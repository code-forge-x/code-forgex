// client/src/components/layout/Navigation.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ConditionalDisplay from '../auth/ConditionalDisplay';

/**
 * Navigation Component
 * Main navigation bar with role-based menu items
 */
const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if the given path is active
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'nav-link-active' : 'nav-link';
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/dashboard">CodeForegX</Link>
        </div>
        
        <div className="nav-links">
          {/* Links for all authenticated users */}
          <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
          </Link>
          
          <Link to="/projects" className={isActive('/projects')}>
            Projects
          </Link>
          
          {/* Client-specific links */}
          <ConditionalDisplay clientOnly>
            <Link to="/project/support" className={isActive('/project/support')}>
              Support
            </Link>
          </ConditionalDisplay>
          
          {/* Developer and Admin only links */}
          <ConditionalDisplay roles={["developer", "admin"]}>
            <Link to="/developer/repository" className={isActive('/developer/repository')}>
              Code Repository
            </Link>
          </ConditionalDisplay>
          
          <ConditionalDisplay roles={["developer", "admin"]}>
            <Link to="/developer/advanced" className={isActive('/developer/advanced')}>
              Advanced Features
            </Link>
          </ConditionalDisplay>
          
          {/* Admin only links */}
          <ConditionalDisplay adminOnly>
          <Link
            to="/admin/prompts"
            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
          >
            Prompt Management
          </Link>
          </ConditionalDisplay>
          
          <ConditionalDisplay adminOnly>
            <Link to="/admin/users" className={isActive('/admin/users')}>
              User Management
            </Link>
          </ConditionalDisplay>
          
          <ConditionalDisplay adminOnly>
            <Link to="/admin/metrics" className={isActive('/admin/metrics')}>
              System Metrics
            </Link>
          </ConditionalDisplay>
        </div>
        
        <div className="nav-user">
          {currentUser && (
            <>
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role">
                {currentUser.role && currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;