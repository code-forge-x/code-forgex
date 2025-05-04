import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';

const RequirementsList = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const response = await fetch('/api/requirements', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requirements');
      }

      const data = await response.json();
      setRequirements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (requirement) => {
    setSelectedRequirement(requirement);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete requirement');
      }

      setRequirements(prev => prev.filter(req => req._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/requirements/${selectedRequirement._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(selectedRequirement)
      });

      if (!response.ok) {
        throw new Error('Failed to update requirement');
      }

      const updatedRequirement = await response.json();
      setRequirements(prev => prev.map(req => 
        req._id === updatedRequirement._id ? updatedRequirement : req
      ));
      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (field, value) => {
    setSelectedRequirement(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Project Requirements
      </Typography>

      <Grid container spacing={3}>
        {requirements.map((requirement) => (
          <Grid item xs={12} key={requirement._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {requirement.project.name}
                  </Typography>
                  <Box>
                    <IconButton onClick={() => handleEdit(requirement)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(requirement._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body1" gutterBottom>
                  {requirement.project.description}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Components:
                  </Typography>
                  <Grid container spacing={2}>
                    {requirement.requirements.components.map((component, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2">
                              {component.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {component.type}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {component.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={requirement.project.type}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={requirement.project.environment}
                    color="secondary"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Requirement' : 'View Requirement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={selectedRequirement?.project.name || ''}
                onChange={(e) => handleChange('project', {
                  ...selectedRequirement?.project,
                  name: e.target.value
                })}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={selectedRequirement?.project.description || ''}
                onChange={(e) => handleChange('project', {
                  ...selectedRequirement?.project,
                  description: e.target.value
                })}
                disabled={!editMode}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project Type"
                value={selectedRequirement?.project.type || ''}
                onChange={(e) => handleChange('project', {
                  ...selectedRequirement?.project,
                  type: e.target.value
                })}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Environment"
                value={selectedRequirement?.project.environment || ''}
                onChange={(e) => handleChange('project', {
                  ...selectedRequirement?.project,
                  environment: e.target.value
                })}
                disabled={!editMode}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Close
          </Button>
          {editMode && (
            <Button onClick={handleSave} variant="contained" color="primary">
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequirementsList;