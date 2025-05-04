import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { Scatter, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Download, History, Timeline, ScatterPlot } from '@mui/icons-material';
import api from '../../../services/api';

// Register ChartJS components
ChartJS.register(LinearScale, PointElement, LineElement, ChartTooltip, Legend);

const VectorVisualization = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [embeddings, setEmbeddings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.8);
  const [selectedModel, setSelectedModel] = useState('all');
  const [models, setModels] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [visualizationType, setVisualizationType] = useState('scatter');
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchEmbeddings();
    fetchModels();
  }, []);

  useEffect(() => {
    if (selectedPoint) {
      fetchVersionHistory(selectedPoint.promptId);
    }
  }, [selectedPoint]);

  const fetchEmbeddings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/embeddings');
      setEmbeddings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch embeddings');
      console.error('Error fetching embeddings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await api.get('/api/embeddings/models');
      setModels(response.data);
    } catch (err) {
      console.error('Error fetching models:', err);
    }
  };

  const fetchVersionHistory = async (promptId) => {
    try {
      const response = await api.get(`/api/embeddings/prompt/${promptId}/versions`);
      setVersionHistory(response.data);
    } catch (err) {
      console.error('Error fetching version history:', err);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/embeddings/similar', {
        embedding: searchQuery,
        threshold: similarityThreshold,
        limit: 10
      });
      setEmbeddings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to perform similarity search');
      console.error('Error performing similarity search:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = async (model) => {
    setSelectedModel(model);
    try {
      setLoading(true);
      const response = await api.get(`/api/embeddings/model/${model}`);
      setEmbeddings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch embeddings for selected model');
      console.error('Error fetching model embeddings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/api/embeddings/export', {
        params: {
          model: selectedModel,
          format: 'csv'
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `embeddings-${selectedModel}-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export embeddings');
      console.error('Error exporting embeddings:', err);
    }
  };

  const chartData = {
    datasets: [
      {
        label: 'Embeddings',
        data: embeddings.map(embedding => ({
          x: embedding.vector[0],
          y: embedding.vector[1],
          z: embedding.vector[2],
          promptId: embedding.prompt_id,
          model: embedding.model_version,
          similarity: embedding.similarity
        })),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ]
  };

  const versionHistoryData = {
    labels: versionHistory.map(v => new Date(v.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Similarity Score',
        data: versionHistory.map(v => v.similarity),
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Dimension 1'
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Dimension 2'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const data = context.raw;
            return [
              `Prompt ID: ${data.promptId}`,
              `Model: ${data.model}`,
              `Similarity: ${data.similarity?.toFixed(2) || 'N/A'}`
            ];
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search Query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Model</InputLabel>
          <Select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            label="Model"
          >
            <MenuItem value="all">All Models</MenuItem>
            {models.map(model => (
              <MenuItem key={model} value={model}>{model}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ width: 200 }}>
          <Typography gutterBottom>Similarity Threshold</Typography>
          <Slider
            value={similarityThreshold}
            onChange={(e, newValue) => setSimilarityThreshold(newValue)}
            min={0}
            max={1}
            step={0.1}
            valueLabelDisplay="auto"
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={!searchQuery}
        >
          Search
        </Button>
        <Tooltip title="Export Embeddings">
          <IconButton onClick={handleExport}>
            <Download />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs value={visualizationType} onChange={(e, newValue) => setVisualizationType(newValue)}>
          <Tab 
            value="scatter" 
            icon={<ScatterPlot />} 
            label="Scatter Plot" 
          />
          <Tab 
            value="timeline" 
            icon={<Timeline />} 
            label="Timeline" 
          />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2, height: '600px' }}>
        <Typography variant="h6" gutterBottom>
          Vector Embedding Space
        </Typography>
        {visualizationType === 'scatter' ? (
          <Scatter data={chartData} options={chartOptions} />
        ) : (
          <Line data={versionHistoryData} options={chartOptions} />
        )}
      </Paper>

      {selectedPoint && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              <Tab icon={<History />} label="Version History" />
              <Tab label="Details" />
            </Tabs>
          </Box>
          {selectedTab === 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Version History
              </Typography>
              {versionHistory.map((version, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography>Version: {version.version}</Typography>
                  <Typography>Created: {new Date(version.created_at).toLocaleString()}</Typography>
                  <Typography>Similarity: {version.similarity.toFixed(2)}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Selected Embedding Details
              </Typography>
              <Typography>Prompt ID: {selectedPoint.promptId}</Typography>
              <Typography>Model Version: {selectedPoint.model}</Typography>
              <Typography>Similarity Score: {selectedPoint.similarity?.toFixed(2) || 'N/A'}</Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default VectorVisualization;