import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import { TemplateManagement } from './TemplateManagement';
import { UserManagement } from './UserManagement';
import { SystemMetrics } from './SystemMetrics';
import { DocumentFingerprinting } from './DocumentFingerprinting';
import { BlueprintVisualization } from './BlueprintVisualization';
import { api } from '../../utils/api';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    templates: 0,
    users: 0,
    activeSessions: 0,
    systemHealth: 'healthy'
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Templates
              </Typography>
              <Typography variant="h4">
                {stats.templates}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Users
              </Typography>
              <Typography variant="h4">
                {stats.users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Sessions
              </Typography>
              <Typography variant="h4">
                {stats.activeSessions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                System Health
              </Typography>
              <Typography
                variant="h4"
                color={stats.systemHealth === 'healthy' ? 'success.main' : 'error.main'}
              >
                {stats.systemHealth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ mb: 3 }}
          >
            <Tab label="Template Management" />
            <Tab label="User Management" />
            <Tab label="System Metrics" />
            <Tab label="Document Fingerprinting" />
            <Tab label="Blueprint Visualization" />
          </Tabs>

          {activeTab === 0 && <TemplateManagement />}
          {activeTab === 1 && <UserManagement />}
          {activeTab === 2 && <SystemMetrics />}
          {activeTab === 3 && <DocumentFingerprinting />}
          {activeTab === 4 && <BlueprintVisualization />}
        </CardContent>
      </Card>
    </Box>
  );
}; 