import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BlueprintReview = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const fetchBlueprints = async () => {
    try {
      const response = await fetch('/api/blueprints', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch blueprints');
      }
      
      const data = await response.json();
      setBlueprints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlueprint = (blueprint) => {
    setSelectedBlueprint(blueprint);
    setOpenDialog(true);
  };

  const handleDownloadBlueprint = async (blueprintId) => {
    try {
      const response = await fetch(`/api/blueprints/${blueprintId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download blueprint');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blueprint-${blueprintId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShareBlueprint = async (blueprintId) => {
    try {
      const response = await fetch(`/api/blueprints/${blueprintId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blueprintId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to share blueprint');
      }
      
      const data = await response.json();
      // Handle sharing success (e.g., show notification)
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/blueprints/${selectedBlueprint._id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: newComment })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const data = await response.json();
      setComments([...comments, data]);
      setNewComment('');
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredBlueprints = blueprints.filter(blueprint => {
    if (filter === 'all') return true;
    if (filter === 'approved') return blueprint.status === 'approved';
    if (filter === 'pending') return blueprint.status === 'pending';
    if (filter === 'rejected') return blueprint.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Blueprint Review
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            label="Filter"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Blueprints</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filteredBlueprints.map((blueprint) => (
          <Grid item xs={12} md={6} lg={4} key={blueprint._id}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{blueprint.name}</Typography>
                <Typography
                  variant="body2"
                  color={
                    blueprint.status === 'approved'
                      ? 'success.main'
                      : blueprint.status === 'rejected'
                      ? 'error.main'
                      : 'warning.main'
                  }
                >
                  {blueprint.status}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={2}>
                {blueprint.description}
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Version: {blueprint.version}
                </Typography>
                <Box>
                  <Tooltip title="View">
                    <IconButton onClick={() => handleViewBlueprint(blueprint)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton onClick={() => handleDownloadBlueprint(blueprint._id)}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton onClick={() => handleShareBlueprint(blueprint._id)}>
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Comment">
                    <IconButton onClick={() => handleViewBlueprint(blueprint)}>
                      <CommentIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedBlueprint?.name}
          <Typography variant="subtitle2" color="text.secondary">
            Version: {selectedBlueprint?.version}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="body1" paragraph>
              {selectedBlueprint?.description}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Components
            </Typography>
            {selectedBlueprint?.components?.map((component, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Typography variant="subtitle1">{component.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {component.description}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          <Box mb={2}>
            {comments.map((comment, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Typography variant="body2">{comment.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  By {comment.user} on {new Date(comment.date).toLocaleDateString()}
                </Typography>
              </Paper>
            ))}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button onClick={handleAddComment} variant="contained" color="primary">
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlueprintReview;