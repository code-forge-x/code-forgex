import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Typography,
  CircularProgress,
  Tooltip,
  Alert,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PromptList = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrompts();
  }, [page, rowsPerPage, sortField, sortOrder, searchQuery]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prompts', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          sort: sortField,
          order: sortOrder,
          search: searchQuery
        }
      });

      // Check if the response has the expected structure
      if (response.data && response.data.data) {
        setPrompts(response.data.data);
        // If pagination is provided in the response
        if (response.data.pagination) {
          setTotalCount(response.data.pagination.total || 0);
        } else {
          setTotalCount(response.data.data.length);
        }
      } else if (Array.isArray(response.data)) {
        // If the response is already an array
        setPrompts(response.data);
        setTotalCount(response.data.length);
      } else {
        // Fallback for unexpected format
        console.error('Unexpected response format:', response.data);
        setPrompts([]);
        setTotalCount(0);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError(err.response?.data?.message || 'Failed to fetch prompts');
      setPrompts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (promptId) => {
    navigate(`/prompts/${promptId}`);
  };

  const handleViewVersions = (promptId) => {
    navigate(`/prompts/version-control?id=${promptId}`);
  };

  const handleDelete = async (promptId) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await api.delete(`/prompts/${promptId}`);
        fetchPrompts();
      } catch (err) {
        console.error('Error deleting prompt:', err);
        setError(err.response?.data?.message || 'Failed to delete prompt');
      }
    }
  };

  const handlePreview = (promptId) => {
    navigate(`/prompts/${promptId}`);
  };

  const handleAddNewPrompt = () => {
    navigate('/prompts/new');
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Prompts</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNewPrompt}
        >
          Add New Prompt
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                    Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                    Category {sortField === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell onClick={() => handleSort('version')} style={{ cursor: 'pointer' }}>
                    Version {sortField === 'version' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                    Created {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1">No prompts found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  prompts.map((prompt) => (
                    <TableRow key={prompt._id || prompt.id}>
                      <TableCell>{prompt.title || prompt.name}</TableCell>
                      <TableCell>
                        <Chip label={prompt.category || 'General'} size="small" />
                      </TableCell>
                      <TableCell>{prompt.version || 1}</TableCell>
                      <TableCell>
                        {prompt.createdAt ? new Date(prompt.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={prompt.status || 'active'}
                          color={prompt.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(prompt._id || prompt.id)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Versions">
                          <IconButton onClick={() => handleViewVersions(prompt._id || prompt.id)}>
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Preview">
                          <IconButton onClick={() => handlePreview(prompt._id || prompt.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(prompt._id || prompt.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default PromptList;