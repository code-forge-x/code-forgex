// src/components/layout/DashboardLayout.jsx
import React from 'react';
import Navigation from './Navigation';

/**
 * DashboardLayout Component
 * Layout wrapper for authenticated pages
 */
const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-container">
      <Navigation />
      
      <main className="dashboard-content">
        {children}
      </main>
      
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} CodeForegX Financial Technology System</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;