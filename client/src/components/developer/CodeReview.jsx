import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Code as CodeIcon,
  BugReport as BugIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { CodeEditor } from '../common/CodeEditor';
import { useAuth } from '../../contexts/AuthContext';

const CodeReview = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const analyzeCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/code/analyze', { code });
      setAnalysis(response.data);
    } catch (err) {
      setError('Failed to analyze code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;

    try {
      const newComment = {
        id: Date.now(),
        text: comment,
        timestamp: new Date().toISOString(),
        user: 'Current User' // Replace with actual user
      };

      setComments(prev => [...prev, newComment]);
      setComment('');
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <BugIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <CheckIcon color="info" />;
      default:
        return null;
    }
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Code Review
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language="javascript"
                  height="500px"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" height="100%">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={analyzeCode}
                    disabled={loading || !code}
                    sx={{ mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Analyze Code'}
                  </Button>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {analysis && (
                    <Tabs
                      value={activeTab}
                      onChange={(_, newValue) => setActiveTab(newValue)}
                      sx={{ mb: 2 }}
                    >
                      <Tab label="Issues" />
                      <Tab label="Metrics" />
                      <Tab label="Comments" />
                    </Tabs>
                  )}

                  {analysis && activeTab === 0 && (
                    <List>
                      {analysis.issues.map((issue, index) => (
                        <React.Fragment key={index}>
                          <ListItem
                            button
                            onClick={() => setSelectedIssue(issue)}
                            sx={{ py: 1 }}
                          >
                            <ListItemIcon>
                              {getSeverityIcon(issue.severity)}
                            </ListItemIcon>
                            <ListItemText
                              primary={issue.message}
                              secondary={`Line ${issue.line}`}
                            />
                            <Chip
                              label={issue.severity}
                              color={getSeverityColor(issue.severity)}
                              size="small"
                            />
                          </ListItem>
                          {index < analysis.issues.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}

                  {analysis && activeTab === 1 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Code Metrics
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Complexity"
                            secondary={analysis.metrics.complexity}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Lines of Code"
                            secondary={analysis.metrics.loc}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Maintainability"
                            secondary={analysis.metrics.maintainability}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}

                  {analysis && activeTab === 2 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Comments
                      </Typography>
                      <List>
                        {comments.map((comment) => (
                          <ListItem key={comment.id}>
                            <ListItemIcon>
                              <CommentIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={comment.text}
                              secondary={`${comment.user} - ${new Date(
                                comment.timestamp
                              ).toLocaleString()}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Box mt={2}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment..."
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={addComment}
                          disabled={!comment.trim()}
                          sx={{ mt: 1 }}
                        >
                          Add Comment
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Issue Details</DialogTitle>
        <DialogContent>
          {selectedIssue && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedIssue.message}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Line {selectedIssue.line}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {selectedIssue.description}
              </Typography>
              {selectedIssue.suggestion && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Suggested Fix:
                  </Typography>
                  <CodeEditor
                    value={selectedIssue.suggestion}
                    language="javascript"
                    readOnly
                    height="200px"
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedIssue(null)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (selectedIssue?.suggestion) {
                setCode(selectedIssue.suggestion);
                setSelectedIssue(null);
              }
            }}
          >
            Apply Fix
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CodeReview;