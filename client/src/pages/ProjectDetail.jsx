import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Tabs, 
  Tab, 
  TextField, 
  CircularProgress,
  Chip, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert
} from '@mui/material';
import { 
  Save, 
  Build, 
  Code, 
  Chat, 
  Architecture, 
  DeleteOutline,
  UploadFile,
  Download,
  AutoStories
} from '@mui/icons-material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import logger from '../utils/logger';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [editedProject, setEditedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [blueprint, setBlueprint] = useState(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [components, setComponents] = useState([]);
  const [componentsLoading, setComponentsLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchProject();
    fetchFiles();
    fetchBlueprint();
    fetchComponents();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/projects/${projectId}`);
      setProject(response.data);
      setEditedProject(response.data);
    } catch (error) {
      logger.error('Failed to fetch project', error);
      setError('Failed to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await api.get(`/api/files/${projectId}`);
      setFiles(response.data);
    } catch (error) {
      logger.error('Failed to fetch files', error);
    }
  };

  const fetchBlueprint = async () => {
    try {
      setBlueprintLoading(true);
      const response = await api.get(`/api/blueprint/${projectId}`);
      setBlueprint(response.data);
    } catch (error) {
      // Blueprint might not exist yet, that's fine
      logger.debug('No blueprint available yet', error);
    } finally {
      setBlueprintLoading(false);
    }
  };

  const fetchComponents = async () => {
    try {
      setComponentsLoading(true);
      const response = await api.get(`/api/components/${projectId}`);
      setComponents(response.data);
    } catch (error) {
      // Components might not exist yet, that's fine
      logger.debug('No components available yet', error);
    } finally {
      setComponentsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject({
      ...editedProject,
      [name]: value
    });
  };

  const handleTechStackChange = (e) => {
    const techStackArray = e.target.value
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    setEditedProject({
      ...editedProject,
      techStack: techStackArray
    });
  };

  const saveProject = async () => {
    try {
      setSaving(true);
      const response = await api.put(`/api/projects/${projectId}`, editedProject);
      setProject(response.data);
      setEditedProject(response.data);
      alert('Project saved successfully');
    } catch (error) {
      logger.error('Failed to save project', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateBlueprint = async () => {
    if (!window.confirm('Generate a new blueprint for this project? This may overwrite any existing blueprint.')) {
      return;
    }

    try {
      setBlueprintLoading(true);
      const response = await api.post(`/api/blueprint/${projectId}/generate`, {
        requirements: editedProject.requirements
      });
      setBlueprint(response.data);
      alert('Blueprint generated successfully');
    } catch (error) {
      logger.error('Failed to generate blueprint', error);
      alert('Failed to generate blueprint. Please try again.');
    } finally {
      setBlueprintLoading(false);
    }
  };

  const generateComponent = async (componentId) => {
    try {
      setComponentsLoading(true);
      const response = await api.post(`/api/components/${projectId}/generate/${componentId}`);
      // Update components list
      await fetchComponents();
      alert('Component generated successfully');
    } catch (error) {
      logger.error('Failed to generate component', error);
      alert('Failed to generate component. Please try again.');
    } finally {
      setComponentsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setFileUploading(true);
      await api.post(`/api/files/${projectId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Refresh file list
      await fetchFiles();
    } catch (error) {
      logger.error('Failed to upload file', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setFileUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await api.delete(`/api/files/${projectId}/${fileId}`);
      // Refresh file list
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      logger.error('Failed to delete file', error);
      alert('Failed to delete file. Please try again.');
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          component={Link} 
          to="/projects" 
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Project not found</Alert>
        <Button 
          variant="contained" 
          component={Link} 
          to="/projects" 
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">{project.name}</Typography>
          <Box>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/projects" 
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button 
              variant="contained" 
              component={Link} 
              to={`/chat/${projectId}`} 
              startIcon={<Chat />}
            >
              Chat
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<AutoStories />} label="Details" />
          <Tab icon={<UploadFile />} label="Files" />
          <Tab icon={<Architecture />} label="Blueprint" />
          <Tab icon={<Code />} label="Components" />
        </Tabs>

        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Project Name"
                value={editedProject.name}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={editedProject.description || ''}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="techStack"
                label="Tech Stack (comma separated)"
                value={(editedProject.techStack || []).join(', ')}
                onChange={handleTechStackChange}
                helperText="e.g. React, Node.js, MongoDB"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                name="requirements"
                label="Project Requirements"
                multiline
                rows={10}
                value={editedProject.requirements || ''}
                onChange={handleInputChange}
                placeholder="Describe your project requirements in detail to help generate better code..."
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={saveProject}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : 'Save Project'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Files Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Button
              variant="contained"
              startIcon={<UploadFile />}
              onClick={() => fileInputRef.current?.click()}
              disabled={fileUploading}
            >
              {fileUploading ? <CircularProgress size={24} /> : 'Upload File'}
            </Button>
          </Box>

          {files.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No files uploaded yet.
            </Typography>
          ) : (
            <List>
              {files.map((file) => (
                <ListItem
                  key={file.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => deleteFile(file.id)}>
                      <DeleteOutline />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <Download />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB • Uploaded: ${new Date(file.uploadedAt).toLocaleDateString()}`}
                  />
                  <Button
                    size="small"
                    component="a"
                    href={file.url}
                    target="_blank"
                    download
                  >
                    Download
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Blueprint Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">System Architecture</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Architecture />}
              onClick={generateBlueprint}
              disabled={blueprintLoading || !editedProject.requirements}
            >
              {blueprintLoading ? <CircularProgress size={24} /> : 'Generate Blueprint'}
            </Button>
          </Box>

          {!blueprint && !blueprintLoading && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No blueprint generated yet. Add project requirements and click "Generate Blueprint" to create a system architecture.
              </Typography>
            </Box>
          )}

          {blueprintLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {blueprint && !blueprintLoading && (
            <Box>
              <Typography variant="body1" paragraph>
                {blueprint.description || 'System architecture blueprint'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Components:
              </Typography>
              
              <Grid container spacing={2}>
                {blueprint.components && blueprint.components.map((component) => (
                  <Grid item xs={12} md={6} key={component.id}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {component.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {component.description || 'No description provided'}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={component.type} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ mr: 1 }} 
                        />
                        {component.dependencies && component.dependencies.map((dep, index) => (
                          <Chip 
                            key={index} 
                            label={dep} 
                            size="small" 
                            variant="outlined" 
                            sx={{ mr: 1 }} 
                          />
                        ))}
                      </Box>
                      
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Code />}
                        onClick={() => generateComponent(component.id)}
                      >
                        Generate Code
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </TabPanel>

        {/* Components Tab */}
        <TabPanel value={tabValue} index={3}>
          {componentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : components.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                No components have been generated yet.
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to={`/chat/${projectId}`}
                startIcon={<Chat />}
              >
                Start Chat to Generate Components
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {components.map((component) => (
                <Grid item xs={12} key={component.id}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">{component.name}</Typography>
                      <Chip 
                        label={component.type} 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {component.description || 'No description provided'}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      {component.dependencies && component.dependencies.map((dep, index) => (
                        <Chip 
                          key={index} 
                          label={dep} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </Box>
                    
                    <Box 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'grey.100', 
                        borderRadius: 1, 
                        maxHeight: '300px', 
                        overflow: 'auto' 
                      }}
                    >
                      <pre 
                        style={{ 
                          margin: 0, 
                          whiteSpace: 'pre-wrap', 
                          fontSize: '0.875rem' 
                        }}
                      >
                        {component.code || 'No code generated yet'}
                      </pre>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Chat />}
                        component={Link}
                        to={`/chat/${projectId}?component=${component.id}`}
                      >
                        Discuss Component
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProjectDetail;