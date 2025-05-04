import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import api from '../services/api';

const Dashboard = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      // Add /api prefix to ensure consistency with our API interceptor
      const response = await api.get('/prompts');
      
      // Check if response.data is an object with a data property
      if (response.data && response.data.data) {
        setPrompts(response.data.data);
      } else if (Array.isArray(response.data)) {
        // If response.data is already an array
        setPrompts(response.data);
      } else {
        // Fallback to empty array if data format is unexpected
        console.error('Unexpected response format:', response.data);
        setPrompts([]);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      enqueueSnackbar('Error fetching prompts', { variant: 'error' });
      setPrompts([]); // Set to empty array to avoid map errors
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = () => {
    navigate('/prompts/new');
  };

  const handleEditPrompt = (prompt) => {
    navigate(`/prompts/${prompt._id || prompt.id || prompt.name}`);
  };

  const handleDeletePrompt = async (prompt) => {
    const promptId = prompt._id || prompt.id || prompt.name;
    if (window.confirm(`Are you sure you want to delete this prompt?`)) {
      try {
        await api.delete(`/prompts/${promptId}`);
        enqueueSnackbar('Prompt deleted successfully', { variant: 'success' });
        fetchPrompts();
      } catch (error) {
        enqueueSnackbar('Error deleting prompt', { variant: 'error' });
      }
    }
  };

  const handleRunPrompt = (prompt) => {
    const promptId = prompt._id || prompt.id || prompt.name;
    navigate(`/prompts/${promptId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h1" variant="h4">
                Dashboard
              </Typography>
              {user?.role === 'admin' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreatePrompt}
                >
                  Create Prompt
                </Button>
              )}
            </Box>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back, {user?.name || user?.username || 'User'}!
            </Typography>
          </Paper>
        </Grid>

        {loading ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Grid>
        ) : prompts.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">No prompts found</Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first prompt to get started
              </Typography>
            </Paper>
          </Grid>
        ) : (
          // Only try to map if prompts is an array with items
          prompts.map((prompt) => (
            <Grid item xs={12} md={6} lg={4} key={prompt._id || prompt.id || prompt.name}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {prompt.name || prompt.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {prompt.description || prompt.content?.substring(0, 100)}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {Array.isArray(prompt.tags) && prompt.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                  <Typography variant="body2">
                    Variables: {Array.isArray(prompt.variables) ? prompt.variables.length : '0'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="Run Prompt">
                    <IconButton onClick={() => handleRunPrompt(prompt)}>
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>
                  {user?.role === 'admin' && (
                    <>
                      <Tooltip title="Edit Prompt">
                        <IconButton onClick={() => handleEditPrompt(prompt)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Prompt">
                        <IconButton onClick={() => handleDeletePrompt(prompt)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;