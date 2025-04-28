const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const PromptPerformance = require('../models/PromptPerformance');
const logger = require('../utils/logger');
const router = express.Router();

// Get performance data
router.get('/performance', adminAuth, async (req, res) => {
  try {
    const { range, metric } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch (range) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Determine which metric to aggregate
    let metricField;
    switch (metric) {
      case 'latency':
        metricField = 'latency';
        break;
      case 'tokens':
        metricField = 'tokenUsage.inputTokens';
        break;
      case 'success':
        metricField = 'success';
        break;
      default:
        metricField = 'latency';
    }
    
    // Aggregate data
    const aggregated = await PromptPerformance.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          success: { $ne: null } // Only include completed requests
        } 
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            template: '$templateName'
          },
          value: metric === 'success' 
            ? { $avg: { $cond: [{ $eq: ['$success', true] }, 1, 0] } }
            : { $avg: `${metricField}` }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          template: '$_id.template',
          value: metric === 'success' ? { $multiply: ['$value', 100] } : '$value'
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // Transform to chart-friendly format
    const templates = [...new Set(aggregated.map(item => item.template))];
    const dates = [...new Set(aggregated.map(item => item.date))];
    
    const chartData = dates.map(date => {
      const dataPoint = { name: date };
      
      templates.forEach(template => {
        const match = aggregated.find(item => 
          item.date === date && item.template === template
        );
        dataPoint[template] = match ? Math.round(match.value * 100) / 100 : null;
      });
      
      return dataPoint;
    });
    
    res.json(chartData);
  } catch (error) {
    logger.error('Get performance data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;