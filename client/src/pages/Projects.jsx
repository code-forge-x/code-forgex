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
  Divider,
  InputAdornment
} from '@mui/material';
import { 
  Add, 
  Code, 
  Chat, 
  Delete, 
  Edit, 
  MoreVert,
  Search,
  Folder,
  Description,
  Build
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import logger from '../utils/logger';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ 
          color: '#d4d4d4',
          fontWeight: 500,
          mb: 2
        }}>
          Projects
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Search projects..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: '300px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#252526',
                color: '#d4d4d4',
                '& fieldset': {
                  borderColor: '#333',
                },
                '&:hover fieldset': {
                  borderColor: '#3c3c3c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007acc',
                },
              },
              '& .MuiInputBase-input': {
                color: '#d4d4d4',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#d4d4d4' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleDialogOpen}
            sx={{
              backgroundColor: '#007acc',
              '&:hover': {
                backgroundColor: '#006bb3',
              },
            }}
          >
            New Project
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#007acc' }} />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, backgroundColor: '#252526', color: '#d4d4d4' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#252526',
                border: '1px solid #333',
                '&:hover': {
                  borderColor: '#3c3c3c',
                  boxShadow: '0 0 0 1px #3c3c3c',
                },
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Folder sx={{ color: '#007acc', mr: 1 }} />
                    <Typography variant="h6" component="h2" sx={{ 
                      color: '#d4d4d4',
                      fontWeight: 500,
                    }}>
                      {project.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ 
                    color: '#d4d4d4',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <Description sx={{ color: '#d4d4d4', mr: 1, fontSize: '1rem' }} />
                    {project.description}
                  </Typography>

                  <Divider sx={{ borderColor: '#333', my: 2 }} />

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {project.techStack.map((tech, index) => (
                      <Chip
                        key={index}
                        label={tech}
                        size="small"
                        icon={<Build sx={{ color: '#d4d4d4' }} />}
                        sx={{
                          backgroundColor: '#1e1e1e',
                          color: '#d4d4d4',
                          border: '1px solid #333',
                          '& .MuiChip-icon': {
                            color: '#007acc',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>

                <CardActions sx={{ 
                  p: 2,
                  borderTop: '1px solid #333',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <IconButton
                      component={Link}
                      to={`/admin/projects/${project._id}`}
                      sx={{ color: '#d4d4d4' }}
                    >
                      <Code />
                    </IconButton>
                    <IconButton
                      component={Link}
                      to={`/admin/projects/${project._id}/support`}
                      sx={{ color: '#d4d4d4' }}
                    >
                      <Chat />
                    </IconButton>
                  </Box>
                  
                  <Box>
                    <IconButton
                      component={Link}
                      to={`/admin/projects/${project._id}/edit`}
                      sx={{ color: '#d4d4d4' }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteProject(project._id)}
                      sx={{ color: '#d4d4d4' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#252526',
            color: '#d4d4d4',
          },
        }}
      >
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
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                '& fieldset': {
                  borderColor: '#333',
                },
                '&:hover fieldset': {
                  borderColor: '#3c3c3c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007acc',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#d4d4d4',
              },
              '& .MuiInputBase-input': {
                color: '#d4d4d4',
              },
            }}
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
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                '& fieldset': {
                  borderColor: '#333',
                },
                '&:hover fieldset': {
                  borderColor: '#3c3c3c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007acc',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#d4d4d4',
              },
              '& .MuiInputBase-input': {
                color: '#d4d4d4',
              },
            }}
          />
          <TextField
            margin="dense"
            name="techStack"
            label="Tech Stack (comma-separated)"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.techStack.join(', ')}
            onChange={handleTechStackChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                '& fieldset': {
                  borderColor: '#333',
                },
                '&:hover fieldset': {
                  borderColor: '#3c3c3c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007acc',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#d4d4d4',
              },
              '& .MuiInputBase-input': {
                color: '#d4d4d4',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
          <Button onClick={handleDialogClose} sx={{ color: '#d4d4d4' }}>
            Cancel
          </Button>
          <Button
            onClick={createProject}
            variant="contained"
            sx={{
              backgroundColor: '#007acc',
              '&:hover': {
                backgroundColor: '#006bb3',
              },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Projects;
