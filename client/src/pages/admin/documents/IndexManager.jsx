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
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import axios from 'axios';

const IndexManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indices, setIndices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [newIndex, setNewIndex] = useState({
    name: '',
    type: 'elasticsearch',
    settings: {
      shards: 1,
      replicas: 1,
      refreshInterval: '1s',
      analysis: {
        analyzer: {
          default: {
            type: 'standard'
          }
        }
      }
    },
    mappings: {
      properties: {
        title: { type: 'text' },
        content: { type: 'text' },
        metadata: { type: 'object' }
      }
    },
    active: true
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState({});
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchIndices();
  }, []);

  const fetchIndices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/indices');
      setIndices(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching indices');
    } finally {
      setLoading(false);
    }
  };

  const fetchIndexStats = async (indexName) => {
    try {
      const response = await axios.get(`/api/indices/${indexName}/stats`);
      setStats(prev => ({ ...prev, [indexName]: response.data }));
    } catch (err) {
      console.error('Error fetching index stats:', err);
    }
  };

  const handleCreateIndex = async () => {
    try {
      setLoading(true);
      await axios.post('/api/indices', newIndex);
      setNewIndex({
        name: '',
        type: 'elasticsearch',
        settings: {
          shards: 1,
          replicas: 1,
          refreshInterval: '1s',
          analysis: {
            analyzer: {
              default: {
                type: 'standard'
              }
            }
          }
        },
        mappings: {
          properties: {
            title: { type: 'text' },
            content: { type: 'text' },
            metadata: { type: 'object' }
          }
        },
        active: true
      });
      fetchIndices();
      setDialogOpen(false);
    } catch (err) {
      setError('Error creating index');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIndex = async (id, updates) => {
    try {
      setLoading(true);
      await axios.put(`/api/indices/${id}`, updates);
      fetchIndices();
    } catch (err) {
      setError('Error updating index');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIndex = async (id) => {
    if (window.confirm('Are you sure you want to delete this index? This action cannot be undone.')) {
      try {
        setLoading(true);
        await axios.delete(`/api/indices/${id}`);
        fetchIndices();
      } catch (err) {
        setError('Error deleting index');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReindex = async (id) => {
    try {
      setLoading(true);
      await axios.post(`/api/indices/${id}/reindex`);
      setStatus(prev => ({ ...prev, [id]: 'reindexing' }));
      fetchIndices();
    } catch (err) {
      setError('Error starting reindex');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (indexName) => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      const response = await axios.post(`/api/indices/${indexName}/search`, {
        query: searchQuery
      });
      setSearchResults(response.data);
    } catch (err) {
      setError('Error performing search');
    } finally {
      setSearching(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'reindexing':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
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
        <Typography variant="h5">Index Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          New Index
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {indices.map((index) => (
              <TableRow key={index._id}>
                <TableCell>{index.name}</TableCell>
                <TableCell>
                  <Chip
                    label={index.type}
                    color={index.type === 'elasticsearch' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {stats[index.name]?.documents || 0}
                </TableCell>
                <TableCell>
                  {stats[index.name]?.size || '0 MB'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={status[index._id] || 'active'}
                    color={getStatusColor(status[index._id])}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedIndex(index);
                        setDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reindex">
                    <IconButton
                      size="small"
                      onClick={() => handleReindex(index._id)}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteIndex(index._id)}
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

      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search Test
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="Search Query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
              onClick={() => handleSearch(selectedIndex?.name)}
              disabled={!selectedIndex || !searchQuery.trim() || searching}
            >
              Search
            </Button>
          </Box>
          {searchResults.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((result) => (
                    <TableRow key={result._id}>
                      <TableCell>{result.title}</TableCell>
                      <TableCell>{result._score.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button size="small">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedIndex(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedIndex ? 'Edit Index' : 'New Index'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedIndex ? selectedIndex.name : newIndex.name}
                  onChange={(e) => selectedIndex
                    ? setSelectedIndex({ ...selectedIndex, name: e.target.value })
                    : setNewIndex({ ...newIndex, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedIndex ? selectedIndex.type : newIndex.type}
                    onChange={(e) => selectedIndex
                      ? setSelectedIndex({ ...selectedIndex, type: e.target.value })
                      : setNewIndex({ ...newIndex, type: e.target.value })
                    }
                    label="Type"
                  >
                    <MenuItem value="elasticsearch">Elasticsearch</MenuItem>
                    <MenuItem value="solr">Solr</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedIndex ? selectedIndex.active : newIndex.active}
                      onChange={(e) => selectedIndex
                        ? setSelectedIndex({ ...selectedIndex, active: e.target.checked })
                        : setNewIndex({ ...newIndex, active: e.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Shards"
                      value={selectedIndex ? selectedIndex.settings.shards : newIndex.settings.shards}
                      onChange={(e) => selectedIndex
                        ? setSelectedIndex({
                            ...selectedIndex,
                            settings: { ...selectedIndex.settings, shards: parseInt(e.target.value) }
                          })
                        : setNewIndex({
                            ...newIndex,
                            settings: { ...newIndex.settings, shards: parseInt(e.target.value) }
                          })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Replicas"
                      value={selectedIndex ? selectedIndex.settings.replicas : newIndex.settings.replicas}
                      onChange={(e) => selectedIndex
                        ? setSelectedIndex({
                            ...selectedIndex,
                            settings: { ...selectedIndex.settings, replicas: parseInt(e.target.value) }
                          })
                        : setNewIndex({
                            ...newIndex,
                            settings: { ...newIndex.settings, replicas: parseInt(e.target.value) }
                          })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Refresh Interval"
                      value={selectedIndex ? selectedIndex.settings.refreshInterval : newIndex.settings.refreshInterval}
                      onChange={(e) => selectedIndex
                        ? setSelectedIndex({
                            ...selectedIndex,
                            settings: { ...selectedIndex.settings, refreshInterval: e.target.value }
                          })
                        : setNewIndex({
                            ...newIndex,
                            settings: { ...newIndex.settings, refreshInterval: e.target.value }
                          })
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Mappings
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={JSON.stringify(selectedIndex ? selectedIndex.mappings : newIndex.mappings, null, 2)}
                  onChange={(e) => {
                    try {
                      const value = JSON.parse(e.target.value);
                      selectedIndex
                        ? setSelectedIndex({ ...selectedIndex, mappings: value })
                        : setNewIndex({ ...newIndex, mappings: value });
                    } catch (err) {
                      // Invalid JSON, ignore
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setSelectedIndex(null);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => selectedIndex
              ? handleUpdateIndex(selectedIndex._id, selectedIndex)
              : handleCreateIndex()
            }
          >
            {selectedIndex ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndexManager; 