import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper
} from '@mui/material';
import { Search as SearchIcon, ContentCopy as CopyIcon } from '@mui/icons-material';

const SearchPanel = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert text to vector (this would typically call an embedding API)
      const response = await fetch('/api/embeddings/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: query }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate embedding');
      }

      const { vector } = await response.json();
      const searchResults = await onSearch(vector);
      setResults(searchResults);
    } catch (err) {
      setError('Failed to perform search');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = (promptId) => {
    navigator.clipboard.writeText(promptId);
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Search Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
      </Box>

      <Button
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={handleSearch}
        disabled={loading || !query}
        fullWidth
        sx={{ mb: 2 }}
      >
        Search
      </Button>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {results.length > 0 && (
        <Paper elevation={2} sx={{ maxHeight: 300, overflow: 'auto' }}>
          <List>
            {results.map((result) => (
              <ListItem
                key={result.id}
                divider
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleCopyPrompt(result.prompt_id)}
                  >
                    <CopyIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`Prompt ${result.prompt_id}`}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Version: {result.version}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Similarity: {(result.score * 100).toFixed(1)}%
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchPanel;
