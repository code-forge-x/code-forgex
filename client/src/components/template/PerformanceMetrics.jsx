import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../../utils/api';

export const PerformanceMetrics = ({ templateId }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [metricType, setMetricType] = useState('success_rate');

  useEffect(() => {
    fetchMetrics();
  }, [templateId, timeRange]);

  const fetchMetrics = async () => {
    try {
      const response = await api.get(
        `/metrics/templates/${templateId}?timeRange=${timeRange}`
      );
      setMetrics(response.data);
    } catch (err) {
      setError('Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const getMetricLabel = (type) => {
    switch (type) {
      case 'success_rate':
        return 'Success Rate (%)';
      case 'token_efficiency':
        return 'Token Efficiency';
      case 'avg_response_time':
        return 'Average Response Time (ms)';
      case 'user_satisfaction':
        return 'User Satisfaction (%)';
      default:
        return '';
    }
  };

  const formatData = () => {
    return metrics.map(metric => ({
      time: new Date(metric.time).toLocaleDateString(),
      value: metric[metricType] * (metricType.includes('rate') || metricType.includes('satisfaction') ? 100 : 1)
    }));
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="1d">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Metric Type</InputLabel>
              <Select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value)}
                label="Metric Type"
              >
                <MenuItem value="success_rate">Success Rate</MenuItem>
                <MenuItem value="token_efficiency">Token Efficiency</MenuItem>
                <MenuItem value="avg_response_time">Response Time</MenuItem>
                <MenuItem value="user_satisfaction">User Satisfaction</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: getMetricLabel(metricType), angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {!loading && metrics.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center">
            No performance data available for the selected time range
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}; 