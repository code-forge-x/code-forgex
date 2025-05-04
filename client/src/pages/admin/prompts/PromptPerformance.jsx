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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PromptPerformance = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    totalUsage: 0,
    successRate: 0,
    avgResponseTime: 0,
    errorRate: 0,
    trend: 0
  });
  const [usageData, setUsageData] = useState([]);
  const [errorData, setErrorData] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [errorDetails, setErrorDetails] = useState([]);
  const [selectedError, setSelectedError] = useState(null);

  useEffect(() => {
    fetchMetrics();
    fetchUsageData();
    fetchErrorData();
    fetchUserStats();
    fetchErrorDetails();
  }, [id, timeRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`//prompts/${id}/metrics?range=${timeRange}`);
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageData = async () => {
    try {
      const response = await axios.get(`//prompts/${id}/usage?range=${timeRange}`);
      setUsageData(response.data);
    } catch (err) {
      console.error('Error fetching usage data:', err);
    }
  };

  const fetchErrorData = async () => {
    try {
      const response = await axios.get(`//prompts/${id}/errors?range=${timeRange}`);
      setErrorData(response.data);
    } catch (err) {
      console.error('Error fetching error data:', err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`//prompts/${id}/user-stats?range=${timeRange}`);
      setUserStats(response.data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const fetchErrorDetails = async () => {
    try {
      const response = await axios.get(`//prompts/${id}/error-details?range=${timeRange}`);
      setErrorDetails(response.data);
    } catch (err) {
      console.error('Error fetching error details:', err);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <TrendingUpIcon color="success" />;
    } else if (trend < 0) {
      return <TrendingDownIcon color="error" />;
    }
    return null;
  };

  const getStatusColor = (value, type) => {
    if (type === 'successRate') {
      if (value >= 90) return 'success';
      if (value >= 75) return 'warning';
      return 'error';
    }
    if (type === 'errorRate') {
      if (value <= 5) return 'success';
      if (value <= 15) return 'warning';
      return 'error';
    }
    if (type === 'responseTime') {
      if (value <= 1000) return 'success';
      if (value <= 2000) return 'warning';
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
        <Typography variant="h5">Prompt Performance</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => window.open(`//prompts/${id}/performance-report`, '_blank')}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Usage
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4">{metrics.totalUsage}</Typography>
                {getTrendIcon(metrics.trend)}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4">{metrics.successRate}%</Typography>
                <Chip
                  label={metrics.successRate >= 90 ? 'Good' : metrics.successRate >= 75 ? 'Fair' : 'Poor'}
                  color={getStatusColor(metrics.successRate, 'successRate')}
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
                Avg Response Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4">{metrics.avgResponseTime}ms</Typography>
                <Chip
                  label={metrics.avgResponseTime <= 1000 ? 'Fast' : metrics.avgResponseTime <= 2000 ? 'Normal' : 'Slow'}
                  color={getStatusColor(metrics.avgResponseTime, 'responseTime')}
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
                  label={metrics.errorRate <= 5 ? 'Low' : metrics.errorRate <= 15 ? 'Medium' : 'High'}
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
              Usage Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#8884d8"
                  name="Usage"
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke="#ff8042"
                  name="Errors"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error Types
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {errorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Users
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Usage</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userStats.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell align="right">{user.usage}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${user.successRate}%`}
                          color={getStatusColor(user.successRate, 'successRate')}
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

        <Grid item xs={12} md={6}>
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
                    <TableCell>User</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errorDetails.map((error) => (
                    <TableRow key={error._id}>
                      <TableCell>
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>{error.message}</TableCell>
                      <TableCell>{error.user}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => setSelectedError(error)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={selectedError !== null}
        onClose={() => setSelectedError(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Error Details</DialogTitle>
        <DialogContent>
          {selectedError && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Error Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary">Time</Typography>
                  <Typography>
                    {new Date(selectedError.timestamp).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary">User</Typography>
                  <Typography>{selectedError.user}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography color="textSecondary">Error Message</Typography>
                  <Typography>{selectedError.message}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography color="textSecondary">Stack Trace</Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      overflow: 'auto'
                    }}
                  >
                    {selectedError.stackTrace}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedError(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromptPerformance; 