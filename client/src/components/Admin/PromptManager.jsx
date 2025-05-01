import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Science as TestIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const PromptManager = () => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'create', 'edit', 'test', 'versions'
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    description: '',
    category: 'general',
    variables: [],
    tags: []
  });
  const [testVariables, setTestVariables] = useState({});
  const [testResult, setTestResult] = useState(null);
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
    }
  };

  const handleDialogOpen = (type, prompt = null) => {
    setDialogType(type);
    setSelectedPrompt(prompt);
    if (type === 'edit' && prompt) {
      setFormData(prompt);
    } else if (type === 'test' && prompt) {
      const variables = {};
      prompt.variables.forEach(v => {
        variables[v.name] = '';
      });
      setTestVariables(variables);
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPrompt(null);
    setFormData({
      name: '',
      content: '',
      description: '',
      category: 'general',
      variables: [],
      tags: []
    });
    setTestVariables({});
    setTestResult(null);
  };

  const handleSubmit = async () => {
    try {
      if (dialogType === 'create') {
        await api.post('/api/prompts', formData);
        enqueueSnackbar('Prompt created successfully', { variant: 'success' });
      } else if (dialogType === 'edit') {
        await api.put(`/api/prompts/${selectedPrompt.name}`, formData);
        enqueueSnackbar('Prompt updated successfully', { variant: 'success' });
      }
      fetchPrompts();
      handleDialogClose();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error saving prompt', { variant: 'error' });
    }
  };

  const handleDelete = async (prompt) => {
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

  const handleTest = async () => {
    try {
      const response = await api.post(`/api/prompts/${selectedPrompt.name}/test`, {
        variables: testVariables
      });
      setTestResult(response.data);
    } catch (error) {
      enqueueSnackbar('Error testing prompt', { variant: 'error' });
    }
  };

  const renderDialog = () => {
    switch (dialogType) {
      case 'create':
      case 'edit':
        return (
          <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
            <DialogTitle>
              {dialogType === 'create' ? 'Create New Prompt' : 'Edit Prompt'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={dialogType === 'edit'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {dialogType === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogActions>
          </Dialog>
        );

      case 'test':
        return (
          <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
            <DialogTitle>Test Prompt: {selectedPrompt?.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {selectedPrompt?.variables.map((variable) => (
                  <Grid item xs={12} key={variable.name}>
                    <TextField
                      fullWidth
                      label={variable.name}
                      value={testVariables[variable.name]}
                      onChange={(e) =>
                        setTestVariables({
                          ...testVariables,
                          [variable.name]: e.target.value,
                        })
                      }
                      helperText={variable.description}
                    />
                  </Grid>
                ))}
                {testResult && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, mt: 2 }}>
                      <Typography variant="h6">Result:</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {testResult.processedContent}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Close</Button>
              <Button onClick={handleTest} variant="contained" color="primary">
                Test
              </Button>
            </DialogActions>
          </Dialog>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Prompt Manager</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen('create')}
        >
          Create New Prompt
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Variables</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.name}>
                <TableCell>{prompt.name}</TableCell>
                <TableCell>{prompt.description}</TableCell>
                <TableCell>{prompt.category}</TableCell>
                <TableCell>
                  {prompt.variables.map((v) => (
                    <Chip
                      key={v.name}
                      label={v.name}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {prompt.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleDialogOpen('edit', prompt)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDialogOpen('test', prompt)}
                    >
                      <TestIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(prompt)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {renderDialog()}
    </Box>
  );
};

export default PromptManager;