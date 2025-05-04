import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Slider, Select, MenuItem, Button, CircularProgress } from '@mui/material';
import Plot from 'react-plotly.js';
import EmbeddingsService from '../../services/embeddingsService';
import VersionHistory from './VersionHistory';
import SearchPanel from './SearchPanel';

const EmbeddingsVisualizer = ({ promptId }) => {
  const [embeddings, setEmbeddings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [dimensions, setDimensions] = useState(3);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchEmbeddings = async () => {
      try {
        setLoading(true);
        const data = await EmbeddingsService.getByPromptId(promptId);
        setEmbeddings(data);
        if (data.length > 0) {
          setSelectedVersion(data[0].version);
        }
      } catch (err) {
        setError('Failed to load embeddings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmbeddings();
  }, [promptId]);

  const handleSearch = async (vector, options) => {
    try {
      setLoading(true);
      const results = await EmbeddingsService.searchSimilar(vector, {
        ...options,
        minSimilarity: similarityThreshold
      });
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search embeddings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await EmbeddingsService.exportToCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'embeddings.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export embeddings');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const selectedEmbedding = embeddings.find(e => e.version === selectedVersion);
  const plotData = [
    {
      type: 'scatter3d',
      mode: 'markers',
      x: selectedEmbedding?.vector.slice(0, 100),
      y: selectedEmbedding?.vector.slice(100, 200),
      z: selectedEmbedding?.vector.slice(200, 300),
      marker: {
        size: 5,
        color: 'blue'
      }
    }
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Embedding Visualization
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>Dimensions</Typography>
            <Select
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              fullWidth
            >
              <MenuItem value={2}>2D</MenuItem>
              <MenuItem value={3}>3D</MenuItem>
            </Select>
          </Box>
          <Box sx={{ height: 500 }}>
            <Plot
              data={plotData}
              layout={{
                title: `Embedding Version ${selectedVersion}`,
                scene: {
                  xaxis: { title: 'Dimension 1' },
                  yaxis: { title: 'Dimension 2' },
                  zaxis: { title: 'Dimension 3' }
                },
                margin: { l: 0, r: 0, b: 0, t: 30 }
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Version History
          </Typography>
          <VersionHistory
            versions={embeddings}
            selectedVersion={selectedVersion}
            onSelectVersion={setSelectedVersion}
          />
        </Paper>

        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search Settings
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>Similarity Threshold</Typography>
            <Slider
              value={similarityThreshold}
              onChange={(_, value) => setSimilarityThreshold(value)}
              min={0}
              max={1}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>
          <SearchPanel onSearch={handleSearch} />
        </Paper>

        <Button
          variant="contained"
          color="primary"
          onClick={handleExport}
          fullWidth
        >
          Export to CSV
        </Button>
      </Grid>
    </Grid>
  );
};

export default EmbeddingsVisualizer;