import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { CodeEditor } from '../common/CodeEditor';
import { ParameterEditor } from './ParameterEditor';
import { VersionHistory } from './VersionHistory';
import { PerformanceMetrics } from './PerformanceMetrics';
import { api } from '../../utils/api';

export const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [version, setVersion] = useState('1.0.0');
  const [changes, setChanges] = useState('');
  const [branch, setBranch] = useState('main');

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const response = await api.get(`/templates/${id}`);
      setTemplate(response.data);
      setVersion(response.data.version);
    } catch (err) {
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/templates/${id}`, {
        ...template,
        version,
        changes,
        branch
      });
      setTemplate(response.data);
      setSuccess('Template updated successfully');
    } catch (err) {
      setError('Failed to update template');
    }
  };

  const handleParameterChange = (parameters) => {
    setTemplate({ ...template, parameters });
  };

  const handleContentChange = (content) => {
    setTemplate({ ...template, content });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!template) {
    return <Alert severity="error">Template not found</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Template Editor
                </Typography>

                <TextField
                  fullWidth
                  label="Template ID"
                  value={template.templateId}
                  disabled
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Name"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={template.description}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                  multiline
                  rows={3}
                  margin="normal"
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Categories</InputLabel>
                  <Select
                    multiple
                    value={template.category}
                    onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {[
                      'strategy', 'indicator', 'utility', 'test', 'other',
                      'blueprint', 'code-generation', 'quickfix', 'document-fingerprinting',
                      'ai-integration', 'project-init', 'development-workflow', 'testing-deployment'
                    ].map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Roles</InputLabel>
                  <Select
                    multiple
                    value={template.roles}
                    onChange={(e) => setTemplate({ ...template, roles: e.target.value })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {['admin', 'developer', 'user'].map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Parameters
                </Typography>
                <ParameterEditor
                  parameters={template.parameters}
                  onChange={handleParameterChange}
                />

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Content
                </Typography>
                <CodeEditor
                  value={template.content}
                  onChange={handleContentChange}
                  language="javascript"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Version Control
                </Typography>

                <TextField
                  fullWidth
                  label="Version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Changes"
                  value={changes}
                  onChange={(e) => setChanges(e.target.value)}
                  multiline
                  rows={3}
                  margin="normal"
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Branch</InputLabel>
                  <Select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    <MenuItem value="main">main</MenuItem>
                    <MenuItem value="development">development</MenuItem>
                    <MenuItem value="feature">feature</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <VersionHistory templateId={id} />
            <PerformanceMetrics templateId={id} />
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
}; 