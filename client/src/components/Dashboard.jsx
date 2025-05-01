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
  Tooltip
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
      const response = await api.get('/api/prompts');
      setPrompts(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching prompts', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = () => {
    navigate('/admin/prompts');
  };

  const handleEditPrompt = (prompt) => {
    navigate(`/admin/prompts/${prompt.name}`);
  };

  const handleDeletePrompt = async (prompt) => {
    if (window.confirm(`Are you sure you want to delete prompt "${prompt.name}"?`)) {
      try {
        await api.delete(`/api/prompts/${prompt.name}`);
        enqueueSnackbar('Prompt deleted successfully', { variant: 'success' });
        fetchPrompts();
      } catch (error) {
        enqueueSnackbar('Error deleting prompt', { variant: 'error' });
      }
    }
  };

  const handleRunPrompt = (prompt) => {
    navigate(`/prompts/${prompt.name}/run`);
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
              Welcome back, {user?.username || 'User'}!
            </Typography>
          </Paper>
        </Grid>

        {prompts.map((prompt) => (
          <Grid item xs={12} md={6} lg={4} key={prompt.name}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {prompt.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {prompt.description}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {prompt.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Stack>
                <Typography variant="body2">
                  Variables: {prompt.variables.length}
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
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard; 