import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import axios from 'axios';

const IntegrationSettings = () => {
  const [integrations, setIntegrations] = useState({
    github: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      callbackUrl: ''
    },
    gitlab: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      callbackUrl: ''
    },
    slack: {
      enabled: false,
      botToken: '',
      signingSecret: '',
      channelId: ''
    }
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Fetch current integration settings
    const fetchIntegrations = async () => {
      try {
        const response = await axios.get('/api/integrations');
        setIntegrations(response.data);
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error fetching integration settings',
          severity: 'error'
        });
      }
    };
    fetchIntegrations();
  }, []);

  const handleChange = (integration, field) => (e) => {
    const { value, type, checked } = e.target;
    setIntegrations(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration],
        [field]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/integrations', integrations);
      setSnackbar({
        open: true,
        message: 'Integration settings updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error updating integration settings',
        severity: 'error'
      });
    }
  };

  const renderIntegrationForm = (name, integration) => (
    <Box key={name} sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {name.charAt(0).toUpperCase() + name.slice(1)} Integration
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={integration.enabled}
            onChange={handleChange(name, 'enabled')}
          />
        }
        label="Enable Integration"
      />
      {integration.enabled && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {Object.entries(integration)
            .filter(([key]) => key !== 'enabled')
            .map(([key, value]) => (
              <Grid item xs={12} key={key}>
                <TextField
                  fullWidth
                  label={key.split(/(?=[A-Z])/).join(' ').toLowerCase()}
                  value={value}
                  onChange={handleChange(name, key)}
                  type={key.includes('Secret') ? 'password' : 'text'}
                />
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Integration Settings
        </Typography>
        <form onSubmit={handleSubmit}>
          {Object.entries(integrations).map(([name, integration]) => (
            <React.Fragment key={name}>
              {renderIntegrationForm(name, integration)}
              <Divider sx={{ my: 3 }} />
            </React.Fragment>
          ))}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Save Integration Settings
          </Button>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IntegrationSettings; 