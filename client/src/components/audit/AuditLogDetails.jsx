import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import { format } from 'date-fns';

const AuditLogDetails = ({ log, open, onClose }) => {
  if (!log) return null;

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'PPpp');
  };

  const formatMetadata = (metadata) => {
    if (!metadata) return 'No metadata available';
    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Audit Log Details
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Timestamp
                  </Typography>
                  <Typography variant="body1">
                    {formatTimestamp(log.timestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Action
                  </Typography>
                  <Typography variant="body1">
                    {log.action}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">
                    {log.userId}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    IP Address
                  </Typography>
                  <Typography variant="body1">
                    {log.ipAddress || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Entity Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Entity Type
                  </Typography>
                  <Typography variant="body1">
                    {log.entityType}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Entity ID
                  </Typography>
                  <Typography variant="body1">
                    {log.entityId}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Changes
              </Typography>
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                {log.changes ? (
                  <Typography variant="body1">
                    {JSON.stringify(log.changes, null, 2)}
                  </Typography>
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    No changes recorded
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Metadata
              </Typography>
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                <Typography variant="body1">
                  {formatMetadata(log.metadata)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {log.error && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'error.light' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Error Information
                </Typography>
                <Typography variant="body1" color="error">
                  {log.error}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuditLogDetails;