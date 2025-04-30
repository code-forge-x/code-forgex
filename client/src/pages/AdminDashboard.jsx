import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  IconButton,
  Typography,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  VpnKey as VpnKeyIcon,
  Analytics as AnalyticsIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 280;

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    userManagement: false,
    systemConfig: false,
    analytics: false,
    promptManagement: false,
    documentManagement: false
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Save sidebar state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarOpen');
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuItems = [
    {
      title: 'User Management',
      icon: <PeopleIcon />,
      section: 'userManagement',
      items: [
        { title: 'User Console', path: '/admin/users' },
        { title: 'Role Manager', path: '/admin/roles' }
      ]
    },
    {
      title: 'System Configuration',
      icon: <SettingsIcon />,
      section: 'systemConfig',
      items: [
        { title: 'Global Settings', path: '/admin/settings' },
        { title: 'Integration Settings', path: '/admin/integrations' }
      ]
    },
    {
      title: 'Token Management',
      icon: <VpnKeyIcon />,
      path: '/admin/tokens'
    },
    {
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      section: 'analytics',
      items: [
        { title: 'Usage Metrics', path: '/admin/analytics/usage' },
        { title: 'Performance Metrics', path: '/admin/analytics/performance' },
        { title: 'Cost Analytics', path: '/admin/analytics/costs' }
      ]
    },
    {
      title: 'Prompt Management',
      icon: <CodeIcon />,
      section: 'promptManagement',
      items: [
        { title: 'Template Editor', path: '/admin/prompts/editor' },
        { title: 'Version Control', path: '/admin/prompts/versions' },
        { title: 'Performance Tracking', path: '/admin/prompts/performance' }
      ]
    },
    {
      title: 'Document Management',
      icon: <DescriptionIcon />,
      section: 'documentManagement',
      items: [
        { title: 'Crawler Config', path: '/admin/documents/crawler' },
        { title: 'Index Manager', path: '/admin/documents/index' },
        { title: 'Document Analytics', path: '/admin/documents/analytics' }
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? drawerWidth : 64,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : 64,
            boxSizing: 'border-box',
            backgroundColor: '#252526',
            color: '#d4d4d4',
            transition: 'width 0.3s ease',
            overflowX: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarOpen ? (
            <Typography variant="h6" sx={{ color: '#d4d4d4' }}>
              Admin Dashboard
            </Typography>
          ) : (
            <Typography variant="h6" sx={{ color: '#d4d4d4', textAlign: 'center' }}>
              AD
            </Typography>
          )}
          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ color: '#d4d4d4' }}
          >
            {sidebarOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: '#333' }} />
        
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.title}>
              {item.section ? (
                <>
                  <ListItemButton
                    onClick={() => handleSectionToggle(item.section)}
                    sx={{
                      '&:hover': { backgroundColor: '#2d2d2d' },
                      minHeight: 48,
                      px: 2.5
                    }}
                  >
                    <ListItemIcon sx={{ color: '#d4d4d4', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    {sidebarOpen && (
                      <>
                        <ListItemText primary={item.title} />
                        {expandedSections[item.section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </>
                    )}
                  </ListItemButton>
                  <Collapse in={expandedSections[item.section]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.items.map((subItem) => (
                        <ListItemButton
                          key={subItem.title}
                          selected={location.pathname === subItem.path}
                          onClick={() => navigate(subItem.path)}
                          sx={{
                            pl: 4,
                            '&:hover': { backgroundColor: '#2d2d2d' },
                            '&.Mui-selected': {
                              backgroundColor: '#2d2d2d',
                              '&:hover': { backgroundColor: '#2d2d2d' }
                            }
                          }}
                        >
                          <ListItemText primary={subItem.title} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    '&:hover': { backgroundColor: '#2d2d2d' },
                    '&.Mui-selected': {
                      backgroundColor: '#2d2d2d',
                      '&:hover': { backgroundColor: '#2d2d2d' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: '#d4d4d4', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  {sidebarOpen && <ListItemText primary={item.title} />}
                </ListItemButton>
              )}
            </React.Fragment>
          ))}
        </List>

        <Divider sx={{ borderColor: '#333' }} />
        <Box sx={{ p: 2 }}>
          {sidebarOpen ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#007acc' }}>
                {currentUser?.name?.[0]?.toUpperCase() || 'A'}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                  {currentUser?.name || 'Admin'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#888' }}>
                  {currentUser?.role || 'Administrator'}
                </Typography>
              </Box>
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} sx={{ color: '#d4d4d4' }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} sx={{ color: '#d4d4d4' }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#1e1e1e',
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminDashboard; 