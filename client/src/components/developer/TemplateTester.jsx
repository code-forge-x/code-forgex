import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { CodeEditor } from '../common/CodeEditor';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TemplateTester = () => {
  const { api } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [parameters, setParameters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to fetch templates');
      console.error(err);
    }
  };

  const handleTemplateChange = (event) => {
    const template = templates.find(t => t._id === event.target.value);
    setSelectedTemplate(template);
    setParameters({});
    setValidationErrors({});
    setResult(null);
  };

  const handleParameterChange = (name, value) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateParameters = () => {
    if (!selectedTemplate) return false;

    const errors = {};
    let isValid = true;

    selectedTemplate.parameters.forEach(param => {
      const value = parameters[param.name];

      if (param.required && !value) {
        errors[param.name] = 'This parameter is required';
        isValid = false;
      }

      if (value) {
        switch (param.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors[param.name] = 'Must be a number';
              isValid = false;
            }
            if (param.validation?.min !== undefined && Number(value) < param.validation.min) {
              errors[param.name] = `Must be greater than or equal to ${param.validation.min}`;
              isValid = false;
            }
            if (param.validation?.max !== undefined && Number(value) > param.validation.max) {
              errors[param.name] = `Must be less than or equal to ${param.validation.max}`;
              isValid = false;
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors[param.name] = 'Must be a boolean';
              isValid = false;
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors[param.name] = 'Must be an array';
              isValid = false;
            }
            break;
          case 'object':
            if (typeof value !== 'object') {
              errors[param.name] = 'Must be an object';
              isValid = false;
            }
            break;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleTest = async () => {
    if (!validateParameters()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/templates/${selectedTemplate._id}/test`, {
        parameters
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to test template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderParameterInput = (param) => {
    switch (param.type) {
      case 'string':
        return (
          <TextField
            fullWidth
            label={param.name}
            value={parameters[param.name] || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            error={!!validationErrors[param.name]}
            helperText={validationErrors[param.name]}
            required={param.required}
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={param.name}
            value={parameters[param.name] || ''}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
            error={!!validationErrors[param.name]}
            helperText={validationErrors[param.name]}
            required={param.required}
            inputProps={{
              min: param.validation?.min,
              max: param.validation?.max
            }}
          />
        );
      case 'boolean':
        return (
          <FormControl fullWidth>
            <InputLabel>{param.name}</InputLabel>
            <Select
              value={parameters[param.name] || ''}
              onChange={(e) => handleParameterChange(param.name, e.target.value === 'true')}
              error={!!validationErrors[param.name]}
              required={param.required}
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </Select>
          </FormControl>
        );
      case 'array':
        return (
          <TextField
            fullWidth
            label={param.name}
            value={parameters[param.name] || ''}
            onChange={(e) => handleParameterChange(param.name, JSON.parse(e.target.value))}
            error={!!validationErrors[param.name]}
            helperText={validationErrors[param.name] || 'Enter a valid JSON array'}
            required={param.required}
          />
        );
      case 'object':
        return (
          <TextField
            fullWidth
            label={param.name}
            value={parameters[param.name] || ''}
            onChange={(e) => handleParameterChange(param.name, JSON.parse(e.target.value))}
            error={!!validationErrors[param.name]}
            helperText={validationErrors[param.name] || 'Enter a valid JSON object'}
            required={param.required}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Template Tester
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Template</InputLabel>
              <Select
                value={selectedTemplate?._id || ''}
                onChange={handleTemplateChange}
                label="Select Template"
              >
                {templates.map(template => (
                  <MenuItem key={template._id} value={template._id}>
                    {template.name} (v{template.version})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedTemplate && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Parameters
                </Typography>
                <Grid container spacing={2} mb={2}>
                  {selectedTemplate.parameters.map(param => (
                    <Grid item xs={12} md={6} key={param.name}>
                      {renderParameterInput(param)}
                    </Grid>
                  ))}
                </Grid>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleTest}
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Test Template'}
                </Button>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {result && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Tabs
                      value={activeTab}
                      onChange={(_, newValue) => setActiveTab(newValue)}
                      sx={{ mb: 2 }}
                    >
                      <Tab label="Result" />
                      <Tab label="Logs" />
                      <Tab label="Metrics" />
                    </Tabs>

                    {activeTab === 0 && (
                      <CodeEditor
                        value={JSON.stringify(result.output, null, 2)}
                        language="json"
                        readOnly
                      />
                    )}

                    {activeTab === 1 && (
                      <Box>
                        {result.logs.map((log, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                            [{log.timestamp}] {log.level}: {log.message}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {activeTab === 2 && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Paper elevation={1} sx={{ p: 2 }}>
                            <Typography variant="subtitle2">Execution Time</Typography>
                            <Typography variant="h6">
                              {result.metrics.executionTime}ms
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Paper elevation={1} sx={{ p: 2 }}>
                            <Typography variant="subtitle2">Memory Usage</Typography>
                            <Typography variant="h6">
                              {result.metrics.memoryUsage}MB
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Paper elevation={1} sx={{ p: 2 }}>
                            <Typography variant="subtitle2">Success Rate</Typography>
                            <Typography variant="h6">
                              {result.metrics.successRate}%
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    )}
                  </>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TemplateTester;