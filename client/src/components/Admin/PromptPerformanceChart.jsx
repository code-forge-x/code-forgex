import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const PromptPerformanceChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [metric, setMetric] = useState('latency');
  
  useEffect(() => {
    fetchData();
  }, [timeRange, metric]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/prompt-admin/performance?range=${timeRange}&metric=${metric}`);
      setPerformanceData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };
  
  const handleMetricChange = (e) => {
    setMetric(e.target.value);
  };
  
  // Mock data for demonstration - remove in production
  const mockData = [
    { name: 'Day 1', extract_requirements: 450, determine_intent: 220, blueprint_query: 380 },
    { name: 'Day 2', extract_requirements: 480, determine_intent: 240, blueprint_query: 390 },
    { name: 'Day 3', extract_requirements: 470, determine_intent: 230, blueprint_query: 400 },
    { name: 'Day 4', extract_requirements: 520, determine_intent: 250, blueprint_query: 410 },
    { name: 'Day 5', extract_requirements: 500, determine_intent: 260, blueprint_query: 420 },
    { name: 'Day 6', extract_requirements: 490, determine_intent: 270, blueprint_query: 430 },
    { name: 'Day 7', extract_requirements: 480, determine_intent: 280, blueprint_query: 440 }
  ];
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Prompt Performance Analytics</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={handleTimeRangeChange} label="Time Range">
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Metric</InputLabel>
            <Select value={metric} onChange={handleMetricChange} label="Metric">
              <MenuItem value="latency">Latency (ms)</MenuItem>
              <MenuItem value="tokens">Token Usage</MenuItem>
              <MenuItem value="success">Success Rate</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', height: '400px', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', height: '400px', alignItems: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <LineChart
            data={mockData}  // Replace with performanceData in production
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="extract_requirements" 
              name="Extract Requirements" 
              stroke="#8884d8" 
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey="determine_intent" 
              name="Determine Intent" 
              stroke="#82ca9d" 
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey="blueprint_query" 
              name="Blueprint Query" 
              stroke="#ffc658" 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default PromptPerformanceChart;
