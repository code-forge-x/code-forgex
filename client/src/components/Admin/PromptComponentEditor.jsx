import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  Paper
} from '@mui/material';

const categories = [
  'instruction', 
  'example', 
  'format', 
  'system',
  'language_specific'
];

const PromptComponentEditor = ({ component, isEditing, onEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'instruction',
    content: '',
    tags: []
  });
  
  useEffect(() => {
    if (component) {
      setFormData({
        name: component.name || '',
        description: component.description || '',
        category: component.category || 'instruction',
        content: component.content || '',
        tags: component.tags || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'instruction',
        content: '',
        tags: []
      });
    }
  }, [component]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  if (!component && !isEditing) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          Select a component from the list or click + to create a new one
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {isEditing ? (component ? 'Edit Component' : 'New Component') : 'Component Details'}
        </Typography>
        
        {!isEditing && component && (
          <Button variant="outlined" onClick={onEdit}>
            Edit
          </Button>
        )}
      </Box>
      
      {!isEditing && component && (
        <Box>
          <Typography variant="subtitle1">{component.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {component.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip label={component.category} size="small" sx={{ mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Version {component.version}
            </Typography>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>Component Content:</Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', mb: 2, maxHeight: '400px', overflow: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{component.content}</pre>
          </Paper>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {component.tags?.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </Box>
        </Box>
      )}
      
      {isEditing && (
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            name="name"
            label="Component Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={!!component}
          />
          
          <TextField
            fullWidth
            margin="normal"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            name="content"
            label="Component Content"
            value={formData.content}
            onChange={handleChange}
            required
            multiline
            rows={12}
            placeholder="Enter reusable prompt component content"
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Save
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default PromptComponentEditor;