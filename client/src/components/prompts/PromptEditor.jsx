import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
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
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';

const PromptEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: 'General',
    parameters: [],
    dependencies: [],
    tags: [],
    status: 'active'
  });

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
      const response = await api.get(`/prompts/${id}`);
      // Handle potential field name differences
      const data = response.data;
      setFormData({
        title: data.title || data.name || '',
        content: data.content || '',
        description: data.description || '',
        category: data.category || 'General',
        parameters: data.parameters || [],
        dependencies: data.dependencies || [],
        tags: data.tags || [],
        status: data.status || 'active'
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError(err.response?.data?.message || 'Failed to fetch prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleParameterChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  const addParameter = () => {
    setFormData(prev => ({
      ...prev,
      parameters: [
        ...prev.parameters,
        { name: '', type: 'string', required: false, description: '' }
      ]
    }));
  };

  const removeParameter = (index) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };

  const handleTagChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.content) {
      setError('Title and content are required fields');
      return;
    }
    
    try {
      setSaving(true);
      if (id) {
        await api.put(`/prompts/${id}`, formData);
      } else {
        await api.post('/prompts', formData);
      }
      navigate('/prompts'); // Update to use correct route
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError(err.response?.data?.message || 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const response = await api.post('/prompts/test', {
        promptId: id,
        variables: formData.parameters.reduce((acc, param) => {
          acc[param.name] = param.default || '';
          return acc;
        }, {})
      });
      setPreviewContent(response.data.processedContent);
      setPreviewOpen(true);
    } catch (err) {
      console.error('Error generating preview:', err);
      setError(err.response?.data?.message || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            error={!formData.title}
            helperText={!formData.title ? "Title is required" : ""}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={2}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              label="Category"
            >
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Code">Code</MenuItem>
              <MenuItem value="Documentation">Documentation</MenuItem>
              <MenuItem value="Testing">Testing</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Parameters
          </Typography>
          {formData.parameters.map((param, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={param.name}
                    onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={param.type}
                      onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="string">String</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Boolean</MenuItem>
                      <MenuItem value="array">Array</MenuItem>
                      <MenuItem value="object">Object</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Default Value"
                    value={param.default || ''}
                    onChange={(e) => handleParameterChange(index, 'default', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Required</InputLabel>
                    <Select
                      value={param.required}
                      onChange={(e) => handleParameterChange(index, 'required', e.target.value)}
                      label="Required"
                    >
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton onClick={() => removeParameter(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addParameter}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Parameter
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Content
          </Typography>
          <Paper sx={{ p: 2 }}>
            <ReactQuill
              value={formData.content}
              onChange={handleContentChange}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'code-block'],
                  ['clean']
                ]
              }}
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={formData.tags.join(', ')}
            onChange={handleTagChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
              variant="outlined"
            >
              Preview
            </Button>
            <Button
              type="submit"
              startIcon={<SaveIcon />}
              variant="contained"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Prompt Preview</DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
              {previewContent}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromptEditor;