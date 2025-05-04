// client/src/components/Admin/Prompts/PerformanceMetrics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PerformanceMetrics Component
 * Displays performance data for prompt templates
 */
const PerformanceMetrics = ({ prompts, loading }) => {
  const [metrics, setMetrics] = useState({});
  const [timeRange, setTimeRange] = useState('week');
  const [selectedPrompt, setSelectedPrompt] = useState('all');
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch metrics when component mounts or filters change
  useEffect(() => {
    fetchMetrics();
  }, [timeRange, selectedPrompt]);
  
  // Fetch metrics from API
  const fetchMetrics = async () => {
    setMetricsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build URL with query parameters
      let url = '//prompts/performance';
      const params = new URLSearchParams();
      
      if (timeRange !== 'all') {
        params.append('timeRange', timeRange);
      }
      
      if (selectedPrompt !== 'all') {
        params.append('promptId', selectedPrompt);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'x-auth-token': token
        }
      });
      
      setMetrics(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load performance metrics');
      setMetrics({});
    } finally {
      setMetricsLoading(false);
    }
  };
  
  // Format token count for display
  const formatTokens = (tokens) => {
    if (!tokens) return '0';
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(2)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(2)}K`;
    }
    return tokens.toString();
  };
  
  return (
    <div className="performance-metrics">
      <h2>Performance Metrics</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="metrics-filters">
        <div className="filter-group">
          <label htmlFor="time-range">Time Range:</label>
          <select
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="select-field"
            disabled={loading || metricsLoading}
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="prompt-filter">Prompt Template:</label>
          <select
            id="prompt-filter"
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className="select-field"
            disabled={loading || metricsLoading}
          >
            <option value="all">All Templates</option>
            {prompts.map(prompt => (
              <option key={`${prompt._id}`} value={prompt._id}>
                {prompt.name} (v{prompt.version})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {metricsLoading ? (
        <div className="loading-indicator">Loading metrics...</div>
      ) : (
        <div className="metrics-dashboard">
          <div className="metrics-summary">
            <div className="metric-card">
              <h3>Total Usage</h3>
              <div className="metric-value">{formatTokens(metrics.totalTokens || 0)}</div>
              <div className="metric-label">tokens</div>
            </div>
            
            <div className="metric-card">
              <h3>Average Latency</h3>
              <div className="metric-value">{(metrics.avgLatency || 0).toFixed(2)}</div>
              <div className="metric-label">seconds</div>
            </div>
            
            <div className="metric-card">
              <h3>Success Rate</h3>
              <div className="metric-value">{((metrics.successRate || 0) * 100).toFixed(1)}%</div>
              <div className="metric-label">success</div>
            </div>
            
            <div className="metric-card">
              <h3>Request Count</h3>
              <div className="metric-value">{metrics.requestCount || 0}</div>
              <div className="metric-label">requests</div>
            </div>
          </div>
          
          {metrics.topPrompts && metrics.topPrompts.length > 0 && (
            <div className="top-prompts">
              <h3>Most Used Templates</h3>
              
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Usage</th>
                    <th>Avg. Latency</th>
                    <th>Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topPrompts.map(prompt => (
                    <tr key={prompt.id}>
                      <td>{prompt.name} (v{prompt.version})</td>
                      <td>{formatTokens(prompt.tokenUsage)}</td>
                      <td>{prompt.latency.toFixed(2)}s</td>
                      <td>{(prompt.successRate * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="usage-chart">
            <h3>Usage Over Time</h3>
            <div className="chart-placeholder">
              <p>Chart visualization would be displayed here</p>
              <p>Daily usage data would be visualized as a time series chart</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;