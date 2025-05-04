import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';

const RequirementsForm = () => {
  const { user } = useAuth();
  const [project, setProject] = useState({
    name: '',
    description: '',
    type: '',
    environment: ''
  });
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newComponent, setNewComponent] = useState({
    name: '',
    type: '',
    description: '',
    requirements: {}
  });

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (index, field, value) => {
    setComponents(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddComponent = () => {
    setNewComponent({
      name: '',
      type: '',
      description: '',
      requirements: {}
    });
    setOpenDialog(true);
  };

  const handleSaveComponent = () => {
    setComponents(prev => [...prev, newComponent]);
    setOpenDialog(false);
  };

  const handleDeleteComponent = (index) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/requirements/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          project,
          requirements: { components }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit requirements');
      }

      setSuccess(true);
      setProject({
        name: '',
        description: '',
        type: '',
        environment: ''
      });
      setComponents([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Project Requirements
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Requirements submitted successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={project.name}
                  onChange={handleProjectChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={project.description}
                  onChange={handleProjectChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Type"
                  name="type"
                  value={project.type}
                  onChange={handleProjectChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Environment"
                  name="environment"
                  value={project.environment}
                  onChange={handleProjectChange}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Components
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddComponent}
                variant="contained"
              >
                Add Component
              </Button>
            </Box>

            {components.map((component, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">
                      Component {index + 1}
                    </Typography>
                    <IconButton onClick={() => handleDeleteComponent(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={component.name}
                        onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Type"
                        value={component.type}
                        onChange={(e) => handleComponentChange(index, 'type', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={component.description}
                        onChange={(e) => handleComponentChange(index, 'description', e.target.value)}
                        required
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || components.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Requirements'}
          </Button>
        </Box>
      </form>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Component</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={newComponent.name}
                onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Type"
                value={newComponent.type}
                onChange={(e) => setNewComponent(prev => ({ ...prev, type: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newComponent.description}
                onChange={(e) => setNewComponent(prev => ({ ...prev, description: e.target.value }))}
                required
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveComponent}
            variant="contained"
            disabled={!newComponent.name || !newComponent.type || !newComponent.description}
          >
            Add Component
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequirementsForm;