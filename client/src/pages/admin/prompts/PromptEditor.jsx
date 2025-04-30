import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import api from '../../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const PromptEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState({
    name: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    variables: [],
    examples: [],
    status: 'draft'
  });
  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState({ name: '', description: '' });
  const [newExample, setNewExample] = useState({ input: '', output: '' });
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (id) {
      fetchPrompt();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/prompts/${id}`);
      setPrompt(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrompt(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (newTag && !prompt.tags.includes(newTag)) {
      setPrompt(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPrompt(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddVariable = () => {
    if (newVariable.name && newVariable.description) {
      setPrompt(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }]
      }));
      setNewVariable({ name: '', description: '' });
    }
  };

  const handleRemoveVariable = (index) => {
    setPrompt(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleAddExample = () => {
    if (newExample.input && newExample.output) {
      setPrompt(prev => ({
        ...prev,
        examples: [...prev.examples, { ...newExample }]
      }));
      setNewExample({ input: '', output: '' });
    }
  };

  const handleRemoveExample = (index) => {
    setPrompt(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (id) {
        await api.put(`/api/prompts/${id}`, prompt);
      } else {
        await api.post('/api/prompts', prompt);
      }
      navigate('/admin/prompts');
    } catch (err) {
      setError('Error saving prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        setLoading(true);
        await api.delete(`/api/prompts/${id}`);
        navigate('/admin/prompts');
      } catch (err) {
        setError('Error deleting prompt');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreview = () => {
    let content = prompt.content;
    prompt.variables.forEach(variable => {
      content = content.replace(
        new RegExp(`{${variable.name}}`, 'g'),
        `<span style="color: #ff9800">[${variable.name}]</span>`
      );
    });
    setPreviewContent(content);
    setPreviewDialog(true);
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          {id ? 'Edit Prompt' : 'Create New Prompt'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Preview">
            <IconButton onClick={handlePreview}>
              <PreviewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save">
            <IconButton onClick={handleSave} color="primary">
              <SaveIcon />
            </IconButton>
          </Tooltip>
          {id && (
            <Tooltip title="Delete">
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={prompt.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={prompt.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={prompt.content}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={10}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={prompt.category}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="coding">Coding</MenuItem>
                <MenuItem value="writing">Writing</MenuItem>
                <MenuItem value="analysis">Analysis</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={prompt.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} startIcon={<AddIcon />}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {prompt.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Variables
            </Typography>
            <Box sx={{ mb: 2 }}>
              {prompt.variables.map((variable, index) => (
                <Chip
                  key={index}
                  label={`${variable.name}: ${variable.description}`}
                  onDelete={() => handleRemoveVariable(index)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="Name"
                value={newVariable.name}
                onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
              />
              <TextField
                size="small"
                label="Description"
                value={newVariable.description}
                onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
              />
              <Button onClick={handleAddVariable} startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Examples
            </Typography>
            <Box sx={{ mb: 2 }}>
              {prompt.examples.map((example, index) => (
                <Paper key={index} sx={{ p: 1, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Input: {example.input}
                    </Typography>
                    <IconButton size="small" onClick={() => handleRemoveExample(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2">
                    Output: {example.output}
                  </Typography>
                </Paper>
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                size="small"
                label="Input"
                value={newExample.input}
                onChange={(e) => setNewExample(prev => ({ ...prev, input: e.target.value }))}
              />
              <TextField
                size="small"
                label="Output"
                value={newExample.output}
                onChange={(e) => setNewExample(prev => ({ ...prev, output: e.target.value }))}
              />
              <Button onClick={handleAddExample} startIcon={<AddIcon />}>
                Add Example
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Prompt Preview</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: 1,
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace'
            }}
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromptEditor; 