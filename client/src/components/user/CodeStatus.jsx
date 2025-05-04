import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  CloudUpload as DeployIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const CodeStatus = () => {
  const [codeStatus, setCodeStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCodeStatus();
    const interval = setInterval(fetchCodeStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCodeStatus = async () => {
    try {
      const response = await fetch('/api/code/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch code status');
      }
      
      const data = await response.json();
      setCodeStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (status) => {
    setSelectedStatus(status);
    setOpenDialog(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case 'completed':
        return 100;
      case 'failed':
        return 0;
      case 'in_progress':
        return 50;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Code Status Tracking
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchCodeStatus}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {codeStatus.map((status) => (
          <Grid item xs={12} md={6} lg={4} key={status._id}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{status.projectName}</Typography>
                <Chip
                  icon={getStatusIcon(status.status)}
                  label={status.status}
                  color={getStatusColor(status.status)}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Updated: {new Date(status.lastUpdated).toLocaleString()}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(status.status)}
                  color={getStatusColor(status.status)}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Version: {status.version}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleViewDetails(status)}
                >
                  View Details
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedStatus?.projectName}
          <Typography variant="subtitle2" color="text.secondary">
            Version: {selectedStatus?.version}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Code Generation"
                secondary={selectedStatus?.codeGeneration?.status}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText
                primary="Build Status"
                secondary={selectedStatus?.buildStatus?.status}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <DeployIcon />
              </ListItemIcon>
              <ListItemText
                primary="Deployment Status"
                secondary={selectedStatus?.deploymentStatus?.status}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <TimelineIcon />
              </ListItemIcon>
              <ListItemText
                primary="Timeline"
                secondary={
                  <Box>
                    {selectedStatus?.timeline?.map((event, index) => (
                      <Typography key={index} variant="body2">
                        {new Date(event.timestamp).toLocaleString()} - {event.description}
                      </Typography>
                    ))}
                  </Box>
                }
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CodeStatus;