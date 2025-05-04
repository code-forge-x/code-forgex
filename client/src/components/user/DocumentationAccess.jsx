import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Book as BookIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const DocumentationAccess = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/docs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documentation');
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
    setOpenDialog(true);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'api':
        return <CodeIcon />;
      case 'deployment':
        return <CloudIcon />;
      case 'security':
        return <SecurityIcon />;
      case 'troubleshooting':
        return <HelpIcon />;
      default:
        return <BookIcon />;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Documentation
        </Typography>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary">Documentation</Typography>
        </Breadcrumbs>
      </Box>

      <Box display="flex" alignItems="center" mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />
          }}
        />
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="All Documentation" />
        <Tab label="API Reference" />
        <Tab label="Deployment Guide" />
        <Tab label="Security" />
        <Tab label="Troubleshooting" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredDocuments
          .filter(doc => activeTab === 0 || doc.category === ['all', 'api', 'deployment', 'security', 'troubleshooting'][activeTab])
          .map((doc) => (
            <Grid item xs={12} md={6} lg={4} key={doc._id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <ListItemIcon>
                    {getCategoryIcon(doc.category)}
                  </ListItemIcon>
                  <Typography variant="h6">{doc.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {doc.summary}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={doc.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => handleViewDocument(doc)}
                  >
                    Read More
                  </Button>
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
          {selectedDoc?.title}
          <Typography variant="subtitle2" color="text.secondary">
            Category: {selectedDoc?.category}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" paragraph>
              {selectedDoc?.content}
            </Typography>
            {selectedDoc?.codeExamples && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Code Examples
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {selectedDoc.codeExamples}
                  </pre>
                </Paper>
              </Box>
            )}
            {selectedDoc?.relatedDocs && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Related Documentation
                </Typography>
                <List>
                  {selectedDoc.relatedDocs.map((related, index) => (
                    <ListItem key={index} button onClick={() => handleViewDocument(related)}>
                      <ListItemIcon>
                        {getCategoryIcon(related.category)}
                      </ListItemIcon>
                      <ListItemText
                        primary={related.title}
                        secondary={related.summary}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentationAccess;