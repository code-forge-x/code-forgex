import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { Add, Code, Chat, Delete, Edit, MoreVert } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import logger from '../utils/logger';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    techStack: []
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects');
      setProjects(response.data);
      setError(null);
    } catch (error) {
      logger.error('Failed to fetch projects', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Reset form data
    setNewProject({
      name: '',
      description: '',
      techStack: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({
      ...newProject,
      [name]: value
    });
  };

  const handleTechStackChange = (e) => {
    const techStackArray = e.target.value
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    setNewProject({
      ...newProject,
      techStack: techStackArray
    });
  };

  const createProject = async () => {
    try {
      if (!newProject.name.trim()) {
        alert('Project name is required');
        return;
      }

      const response = await api.post('/api/projects', newProject);
      setProjects([...projects, response.data]);
      handleDialogClose();
      
      // Navigate to the new project
      navigate(`/projects/${response.data._id}`);
    } catch (error) {
      logger.error('Failed to create project', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await api.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter(project => project._id !== projectId));
    } catch (error) {
      logger.error('Failed to delete project', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Projects</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleDialogOpen}
        >
          New Project
        </Button>
      </Box>

      {error && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'error.light', 
            color: 'error.contrastText' 
          }}
        >
          {error}
        </Paper>
      )}

      {projects.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start by creating a new project to begin developing with AI assistance.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleDialogOpen}
          >
            Create First Project
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map(project => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                      {project.name}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project._id);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {project.description || 'No description provided'}
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    {project.techStack && project.techStack.map((tech, index) => (
                      <Chip 
                        key={index} 
                        label={tech} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<Edit />} 
                    component={Link} 
                    to={`/projects/${project._id}`}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<Chat />} 
                    component={Link} 
                    to={`/chat/${project._id}`}
                  >
                    Chat
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* New Project Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newProject.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="techStack"
            label="Tech Stack (comma separated)"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.techStack.join(', ')}
            onChange={handleTechStackChange}
            helperText="e.g. React, Node.js, MongoDB"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={createProject} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Projects;
