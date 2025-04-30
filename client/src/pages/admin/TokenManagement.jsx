import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axios from 'axios';

const TokenManagement = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newToken, setNewToken] = useState({
    name: '',
    type: 'api',
    permissions: []
  });
  const [showToken, setShowToken] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tokens');
      setTokens(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    try {
      const response = await axios.post('/api/tokens', newToken);
      setTokens([...tokens, response.data]);
      setOpenDialog(false);
      setNewToken({ name: '', type: 'api', permissions: [] });
      setSnackbar({
        open: true,
        message: 'Token created successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error creating token',
        severity: 'error'
      });
    }
  };

  const handleDeleteToken = async (id) => {
    try {
      await axios.delete(`/api/tokens/${id}`);
      setTokens(tokens.filter(token => token._id !== id));
      setSnackbar({
        open: true,
        message: 'Token deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error deleting token',
        severity: 'error'
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Token copied to clipboard',
      severity: 'success'
    });
  };

  const toggleTokenVisibility = (id) => {
    setShowToken(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return <Typography>Loading tokens...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Token Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create New Token
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Token</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token._id}>
                <TableCell>{token.name}</TableCell>
                <TableCell>{token.type}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {showToken[token._id] ? token.value : '••••••••••••••••'}
                    <IconButton
                      size="small"
                      onClick={() => toggleTokenVisibility(token._id)}
                    >
                      {showToken[token._id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    <Tooltip title="Copy token">
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(token.value)}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(token.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteToken(token._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Token</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Token Name"
            fullWidth
            value={newToken.name}
            onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Token Type</InputLabel>
            <Select
              value={newToken.type}
              onChange={(e) => setNewToken({ ...newToken, type: e.target.value })}
              label="Token Type"
            >
              <MenuItem value="api">API Token</MenuItem>
              <MenuItem value="access">Access Key</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateToken} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

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

export default TokenManagement; 