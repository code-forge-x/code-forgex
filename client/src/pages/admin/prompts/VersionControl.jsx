import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Chip,
  Tooltip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Compare as CompareIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Diff, Hunk, parseDiff } from 'react-diff-view';
import 'react-diff-view/style/index.css';

const VersionControl = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareDialog, setCompareDialog] = useState(false);
  const [version1, setVersion1] = useState(null);
  const [version2, setVersion2] = useState(null);
  const [newVersion, setNewVersion] = useState({
    name: '',
    description: '',
    type: 'minor'
  });
  const [comparisonDialog, setComparisonDialog] = useState({ open: false, oldVersion: null, newVersion: null });

  useEffect(() => {
    fetchVersions();
  }, [id]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`//prompts/${id}/versions`);
      setVersions(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching versions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    try {
      setLoading(true);
      await axios.post(`//prompts/${id}/versions`, newVersion);
      setNewVersion({ name: '', description: '', type: 'minor' });
      fetchVersions();
    } catch (err) {
      setError('Error creating version');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (window.confirm('Are you sure you want to restore this version?')) {
      try {
        setLoading(true);
        await axios.post(`//prompts/${id}/versions/${versionId}/restore`);
        fetchVersions();
      } catch (err) {
        setError('Error restoring version');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteVersion = async (versionId) => {
    if (window.confirm('Are you sure you want to delete this version?')) {
      try {
        setLoading(true);
        await axios.delete(`//prompts/${id}/versions/${versionId}`);
        fetchVersions();
      } catch (err) {
        setError('Error deleting version');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCompare = (v1, v2) => {
    setVersion1(v1);
    setVersion2(v2);
    setCompareDialog(true);
  };

  const getVersionTypeColor = (type) => {
    switch (type) {
      case 'major':
        return 'error';
      case 'minor':
        return 'warning';
      case 'patch':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderDiff = (oldContent, newContent) => {
    const diffText = `diff --git a/old b/new
index 0000000..1111111 100644
--- a/old
+++ b/new
${generateDiffHunks(oldContent, newContent)}`;

    const files = parseDiff(diffText);
    const { hunks, oldRevision, newRevision, type } = files[0];

    return (
      <Diff
        viewType="split"
        diffType={type}
        hunks={hunks}
        oldRevision={oldRevision}
        newRevision={newRevision}
      >
        {(hunks) => hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)}
      </Diff>
    );
  };

  const generateDiffHunks = (oldContent, newContent) => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    let result = '';
    let i = 0;
    let j = 0;

    while (i < oldLines.length || j < newLines.length) {
      if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
        result += ` ${oldLines[i]}\n`;
        i++;
        j++;
      } else {
        if (i < oldLines.length) {
          result += `-${oldLines[i]}\n`;
          i++;
        }
        if (j < newLines.length) {
          result += `+${newLines[j]}\n`;
          j++;
        }
      }
    }

    return result;
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
        <Typography variant="h5">Version Control</Typography>
        <Button
          variant="contained"
          startIcon={<HistoryIcon />}
          onClick={() => setSelectedVersion(null)}
        >
          Create New Version
        </Button>
      </Box>

      {selectedVersion === null ? (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create New Version
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Version Name"
                value={newVersion.name}
                onChange={(e) => setNewVersion(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Version Type</InputLabel>
                <Select
                  value={newVersion.type}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, type: e.target.value }))}
                  label="Version Type"
                >
                  <MenuItem value="major">Major</MenuItem>
                  <MenuItem value="minor">Minor</MenuItem>
                  <MenuItem value="patch">Patch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newVersion.description}
                onChange={(e) => setNewVersion(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleCreateVersion}
                disabled={!newVersion.name}
              >
                Create Version
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Version Details
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={() => setSelectedVersion(null)}
            >
              Close
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Name</Typography>
              <Typography>{selectedVersion.name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Type</Typography>
              <Chip
                label={selectedVersion.type}
                color={getVersionTypeColor(selectedVersion.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Description</Typography>
              <Typography>{selectedVersion.description}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Created At</Typography>
              <Typography>
                {new Date(selectedVersion.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Created By</Typography>
              <Typography>{selectedVersion.createdBy}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version._id}>
                <TableCell>{version.name}</TableCell>
                <TableCell>
                  <Chip
                    label={version.type}
                    color={getVersionTypeColor(version.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{version.description}</TableCell>
                <TableCell>
                  {new Date(version.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{version.createdBy}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Compare">
                    <IconButton
                      size="small"
                      onClick={() => handleCompare(version, versions[0])}
                    >
                      <CompareIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Restore">
                    <IconButton
                      size="small"
                      onClick={() => handleRestoreVersion(version._id)}
                    >
                      <RestoreIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteVersion(version._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={compareDialog}
        onClose={() => setCompareDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Compare Versions</DialogTitle>
        <DialogContent>
          {version1 && version2 && (
            <Box sx={{ mt: 2 }}>
              {renderDiff(version1.content, version2.content)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VersionControl; 