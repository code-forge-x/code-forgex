import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import CompareIcon from '@mui/icons-material/Compare';
import { api } from '../../utils/api';

export const VersionHistory = ({ templateId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareDialog, setCompareDialog] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [diff, setDiff] = useState(null);

  useEffect(() => {
    fetchVersions();
  }, [templateId]);

  const fetchVersions = async () => {
    try {
      const response = await api.get(`/templates/${templateId}/versions`);
      setVersions(response.data);
    } catch (err) {
      setError('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version) => {
    try {
      await api.post(`/templates/${templateId}/restore`, { version });
      window.location.reload();
    } catch (err) {
      setError('Failed to restore version');
    }
  };

  const handleCompare = async () => {
    if (selectedVersions.length !== 2) return;

    try {
      const response = await api.get(
        `/templates/${templateId}/compare?version1=${selectedVersions[0]}&version2=${selectedVersions[1]}`
      );
      setDiff(response.data);
      setCompareDialog(true);
    } catch (err) {
      setError('Failed to compare versions');
    }
  };

  const handleVersionSelect = (version) => {
    if (selectedVersions.includes(version)) {
      setSelectedVersions(selectedVersions.filter(v => v !== version));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, version]);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Version History
        </Typography>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        <List>
          {versions.map((version) => (
            <React.Fragment key={version.version}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        v{version.version}
                      </Typography>
                      <Chip
                        label={version.branch}
                        size="small"
                        color={version.branch === 'main' ? 'primary' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {version.changes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(version.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleVersionSelect(version.version)}
                    color={selectedVersions.includes(version.version) ? 'primary' : 'default'}
                  >
                    <CompareIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleRestore(version.version)}
                  >
                    <RestoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        {selectedVersions.length === 2 && (
          <Button
            variant="contained"
            onClick={handleCompare}
            fullWidth
            sx={{ mt: 2 }}
          >
            Compare Selected Versions
          </Button>
        )}

        <Dialog
          open={compareDialog}
          onClose={() => setCompareDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Version Comparison</DialogTitle>
          <DialogContent>
            {diff && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Changes
                </Typography>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {diff}
                </pre>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompareDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}; 