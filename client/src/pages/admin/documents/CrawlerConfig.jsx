import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';

const CrawlerConfig = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [newConfig, setNewConfig] = useState({
    name: '',
    url: '',
    type: 'web',
    schedule: 'daily',
    active: true,
    maxDepth: 3,
    maxPages: 100,
    allowedDomains: [],
    excludedPaths: [],
    filters: {
      fileTypes: [],
      minSize: 0,
      maxSize: 10485760 // 10MB
    }
  });
  const [newDomain, setNewDomain] = useState('');
  const [newPath, setNewPath] = useState('');
  const [newFileType, setNewFileType] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/crawlers');
      setConfigs(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching crawler configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async () => {
    try {
      setLoading(true);
      await axios.post('/api/crawlers', newConfig);
      setNewConfig({
        name: '',
        url: '',
        type: 'web',
        schedule: 'daily',
        active: true,
        maxDepth: 3,
        maxPages: 100,
        allowedDomains: [],
        excludedPaths: [],
        filters: {
          fileTypes: [],
          minSize: 0,
          maxSize: 10485760
        }
      });
      fetchConfigs();
      setDialogOpen(false);
    } catch (err) {
      setError('Error creating crawler configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (id, updates) => {
    try {
      setLoading(true);
      await axios.put(`/api/crawlers/${id}`, updates);
      fetchConfigs();
    } catch (err) {
      setError('Error updating crawler configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/crawlers/${id}`);
        fetchConfigs();
      } catch (err) {
        setError('Error deleting crawler configuration');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartCrawler = async (id) => {
    try {
      setLoading(true);
      await axios.post(`/api/crawlers/${id}/start`);
      setStatus(prev => ({ ...prev, [id]: 'running' }));
    } catch (err) {
      setError('Error starting crawler');
    } finally {
      setLoading(false);
    }
  };

  const handleStopCrawler = async (id) => {
    try {
      setLoading(true);
      await axios.post(`/api/crawlers/${id}/stop`);
      setStatus(prev => ({ ...prev, [id]: 'stopped' }));
    } catch (err) {
      setError('Error stopping crawler');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = () => {
    if (newDomain && !newConfig.allowedDomains.includes(newDomain)) {
      setNewConfig(prev => ({
        ...prev,
        allowedDomains: [...prev.allowedDomains, newDomain]
      }));
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (domain) => {
    setNewConfig(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter(d => d !== domain)
    }));
  };

  const handleAddPath = () => {
    if (newPath && !newConfig.excludedPaths.includes(newPath)) {
      setNewConfig(prev => ({
        ...prev,
        excludedPaths: [...prev.excludedPaths, newPath]
      }));
      setNewPath('');
    }
  };

  const handleRemovePath = (path) => {
    setNewConfig(prev => ({
      ...prev,
      excludedPaths: prev.excludedPaths.filter(p => p !== path)
    }));
  };

  const handleAddFileType = () => {
    if (newFileType && !newConfig.filters.fileTypes.includes(newFileType)) {
      setNewConfig(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          fileTypes: [...prev.filters.fileTypes, newFileType]
        }
      }));
      setNewFileType('');
    }
  };

  const handleRemoveFileType = (fileType) => {
    setNewConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        fileTypes: prev.filters.fileTypes.filter(ft => ft !== fileType)
      }
    }));
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
        <Typography variant="h5">Crawler Configurations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          New Configuration
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config._id}>
                <TableCell>{config.name}</TableCell>
                <TableCell>{config.url}</TableCell>
                <TableCell>
                  <Chip
                    label={config.type}
                    color={config.type === 'web' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={config.schedule}
                    icon={<ScheduleIcon />}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={status[config._id] || 'idle'}
                    color={status[config._id] === 'running' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedConfig(config);
                        setDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={status[config._id] === 'running' ? 'Stop' : 'Start'}>
                    <IconButton
                      size="small"
                      onClick={() => status[config._id] === 'running' ? handleStopCrawler(config._id) : handleStartCrawler(config._id)}
                    >
                      {status[config._id] === 'running' ? <StopIcon /> : <PlayIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteConfig(config._id)}
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
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedConfig(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedConfig ? 'Edit Configuration' : 'New Configuration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedConfig ? selectedConfig.name : newConfig.name}
                  onChange={(e) => selectedConfig
                    ? setSelectedConfig({ ...selectedConfig, name: e.target.value })
                    : setNewConfig({ ...newConfig, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="URL"
                  value={selectedConfig ? selectedConfig.url : newConfig.url}
                  onChange={(e) => selectedConfig
                    ? setSelectedConfig({ ...selectedConfig, url: e.target.value })
                    : setNewConfig({ ...newConfig, url: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedConfig ? selectedConfig.type : newConfig.type}
                    onChange={(e) => selectedConfig
                      ? setSelectedConfig({ ...selectedConfig, type: e.target.value })
                      : setNewConfig({ ...newConfig, type: e.target.value })
                    }
                    label="Type"
                  >
                    <MenuItem value="web">Web</MenuItem>
                    <MenuItem value="document">Document</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Schedule</InputLabel>
                  <Select
                    value={selectedConfig ? selectedConfig.schedule : newConfig.schedule}
                    onChange={(e) => selectedConfig
                      ? setSelectedConfig({ ...selectedConfig, schedule: e.target.value })
                      : setNewConfig({ ...newConfig, schedule: e.target.value })
                    }
                    label="Schedule"
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedConfig ? selectedConfig.active : newConfig.active}
                      onChange={(e) => selectedConfig
                        ? setSelectedConfig({ ...selectedConfig, active: e.target.checked })
                        : setNewConfig({ ...newConfig, active: e.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Depth"
                  value={selectedConfig ? selectedConfig.maxDepth : newConfig.maxDepth}
                  onChange={(e) => selectedConfig
                    ? setSelectedConfig({ ...selectedConfig, maxDepth: parseInt(e.target.value) })
                    : setNewConfig({ ...newConfig, maxDepth: parseInt(e.target.value) })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Pages"
                  value={selectedConfig ? selectedConfig.maxPages : newConfig.maxPages}
                  onChange={(e) => selectedConfig
                    ? setSelectedConfig({ ...selectedConfig, maxPages: parseInt(e.target.value) })
                    : setNewConfig({ ...newConfig, maxPages: parseInt(e.target.value) })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Allowed Domains
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Domain"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddDomain}
                    disabled={!newDomain}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(selectedConfig ? selectedConfig.allowedDomains : newConfig.allowedDomains).map((domain) => (
                    <Chip
                      key={domain}
                      label={domain}
                      onDelete={() => handleRemoveDomain(domain)}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Excluded Paths
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Path"
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddPath}
                    disabled={!newPath}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(selectedConfig ? selectedConfig.excludedPaths : newConfig.excludedPaths).map((path) => (
                    <Chip
                      key={path}
                      label={path}
                      onDelete={() => handleRemovePath(path)}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  File Filters
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add File Type"
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddFileType}
                    disabled={!newFileType}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {(selectedConfig ? selectedConfig.filters.fileTypes : newConfig.filters.fileTypes).map((fileType) => (
                    <Chip
                      key={fileType}
                      label={fileType}
                      onDelete={() => handleRemoveFileType(fileType)}
                    />
                  ))}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Min Size (bytes)"
                      value={selectedConfig ? selectedConfig.filters.minSize : newConfig.filters.minSize}
                      onChange={(e) => selectedConfig
                        ? setSelectedConfig({
                            ...selectedConfig,
                            filters: { ...selectedConfig.filters, minSize: parseInt(e.target.value) }
                          })
                        : setNewConfig({
                            ...newConfig,
                            filters: { ...newConfig.filters, minSize: parseInt(e.target.value) }
                          })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Size (bytes)"
                      value={selectedConfig ? selectedConfig.filters.maxSize : newConfig.filters.maxSize}
                      onChange={(e) => selectedConfig
                        ? setSelectedConfig({
                            ...selectedConfig,
                            filters: { ...selectedConfig.filters, maxSize: parseInt(e.target.value) }
                          })
                        : setNewConfig({
                            ...newConfig,
                            filters: { ...newConfig.filters, maxSize: parseInt(e.target.value) }
                          })
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setSelectedConfig(null);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => selectedConfig
              ? handleUpdateConfig(selectedConfig._id, selectedConfig)
              : handleCreateConfig()
            }
          >
            {selectedConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CrawlerConfig; 