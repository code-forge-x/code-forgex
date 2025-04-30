import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
  Message as MessageIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import axios from 'axios';

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [projectsRes, invoicesRes, messagesRes] = await Promise.all([
        axios.get('/api/projects', {
          headers: { 'x-auth-token': token }
        }),
        axios.get('/api/invoices', {
          headers: { 'x-auth-token': token }
        }),
        axios.get('/api/messages', {
          headers: { 'x-auth-token': token }
        })
      ]);

      setProjects(projectsRes.data);
      setInvoices(invoicesRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Client Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Project Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Project Overview
            </Typography>
            <Grid container spacing={2}>
              {projects.map((project) => (
                <Grid item xs={12} sm={6} key={project._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">
                          {project.name}
                        </Typography>
                        <Chip 
                          label={project.status} 
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {project.description}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Last Updated: {new Date(project.updatedAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">View Details</Button>
                      <Button size="small">Contact Team</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Active Projects" 
                  secondary={projects.length} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <PaymentIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Pending Invoices" 
                  secondary={invoices.filter(i => i.status === 'pending').length} 
                />
              </ListItem>
            </List>
          </Paper>

          {/* Recent Messages */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Messages
            </Typography>
            <List>
              {messages.slice(0, 3).map((message, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <MessageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={message.subject}
                    secondary={message.preview}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Project Timeline
            </Typography>
            <List>
              {projects.map((project) => (
                <ListItem key={project._id}>
                  <ListItemIcon>
                    <TimelineIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.name}
                    secondary={`Status: ${project.status} - Last Update: ${new Date(project.updatedAt).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard; 