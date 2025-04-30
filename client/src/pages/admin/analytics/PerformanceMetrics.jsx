import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';

const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    errorRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('1h');
  const [performanceData, setPerformanceData] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchPerformanceData();
    fetchErrorLogs();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics/performance?range=${timeRange}`);
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.get(`/api/analytics/performance-data?range=${timeRange}`);
      setPerformanceData(response.data);
    } catch (err) {
      console.error('Error fetching performance data:', err);
    }
  };

  const fetchErrorLogs = async () => {
    try {
      const response = await axios.get(`/api/analytics/error-logs?range=${timeRange}`);
      setErrorLogs(response.data);
    } catch (err) {
      console.error('Error fetching error logs:', err);
    }
  };

  const getStatusColor = (value, type) => {
    if (type === 'responseTime') {
      if (value < 100) return 'success';
      if (value < 300) return 'warning';
      return 'error';
    }
    if (type === 'errorRate') {
      if (value < 1) return 'success';
      if (value < 5) return 'warning';
      return 'error';
    }
    if (type === 'cpuUsage' || type === 'memoryUsage') {
      if (value < 50) return 'success';
      if (value < 80) return 'warning';
      return 'error';
    }
    return 'default';
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
        <Typography variant="h5">Performance Metrics</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="1h">Last Hour</MenuItem>
            <MenuItem value="6h">Last 6 Hours</MenuItem>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Response Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4">{metrics.responseTime}ms</Typography>
                <Chip
                  label={metrics.responseTime < 100 ? 'Good' : metrics.responseTime < 300 ? 'Fair' : 'Poor'}
                  color={getStatusColor(metrics.responseTime, 'responseTime')}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                CPU Usage
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4">{metrics.cpuUsage}%</Typography>
                <Chip
                  label={metrics.cpuUsage < 50 ? 'Good' : metrics.cpuUsage < 80 ? 'Fair' : 'Poor'}
                  color={getStatusColor(metrics.cpuUsage, 'cpuUsage')}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Memory Usage
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4">{metrics.memoryUsage}%</Typography>
                <Chip
                  label={metrics.memoryUsage < 50 ? 'Good' : metrics.memoryUsage < 80 ? 'Fair' : 'Poor'}
                  color={getStatusColor(metrics.memoryUsage, 'memoryUsage')}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Error Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4">{metrics.errorRate}%</Typography>
                <Chip
                  label={metrics.errorRate < 1 ? 'Good' : metrics.errorRate < 5 ? 'Fair' : 'Poor'}
                  color={getStatusColor(metrics.errorRate, 'errorRate')}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Performance Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Response Time (ms)"
                />
                <Area
                  type="monotone"
                  dataKey="cpuUsage"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="CPU Usage (%)"
                />
                <Area
                  type="monotone"
                  dataKey="memoryUsage"
                  stroke="#ffc658"
                  fill="#ffc658"
                  name="Memory Usage (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Errors
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Error</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errorLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.status}
                          color={log.status === 'error' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceMetrics; 