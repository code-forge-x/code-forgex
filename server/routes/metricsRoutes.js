const express = require('express');
const router = express.Router();
const { query } = require('../config/timescale');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Validation schemas
const metricsQuerySchema = {
  query: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      promptId: { type: 'string' },
      userId: { type: 'string' },
      environment: { type: 'string' },
      interval: { type: 'string', enum: ['hour', 'day', 'week', 'month'] }
    }
  }
};

// Get performance metrics
router.get(
  '/',
  authenticate,
  validateRequest(metricsQuerySchema),
  async (req, res) => {
    try {
      const { startDate, endDate, promptId, userId, environment, interval = 'hour' } = req.query;
      
      let queryText = `
        SELECT 
          time_bucket('1 ${interval}', time) AS bucket,
          prompt_id,
          user_id,
          environment,
          AVG(response_time) AS avg_response_time,
          SUM(token_usage) AS total_token_usage,
          AVG(success_rate) AS avg_success_rate,
          SUM(error_count) AS total_errors
        FROM performance_metrics
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;

      if (startDate) {
        queryText += ` AND time >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        queryText += ` AND time <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      if (promptId) {
        queryText += ` AND prompt_id = $${paramIndex}`;
        params.push(promptId);
        paramIndex++;
      }

      if (userId) {
        queryText += ` AND user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (environment) {
        queryText += ` AND environment = $${paramIndex}`;
        params.push(environment);
        paramIndex++;
      }

      queryText += `
        GROUP BY bucket, prompt_id, user_id, environment
        ORDER BY bucket DESC
      `;

      const result = await query(queryText, params);
      res.json(result.rows);
    } catch (error) {
      logger.error('Failed to fetch performance metrics:', error);
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  }
);

// Get metrics summary
router.get(
  '/summary',
  authenticate,
  async (req, res) => {
    try {
      const queryText = `
        SELECT 
          COUNT(DISTINCT prompt_id) AS total_prompts,
          COUNT(DISTINCT user_id) AS total_users,
          AVG(response_time) AS avg_response_time,
          SUM(token_usage) AS total_tokens,
          AVG(success_rate) AS avg_success_rate,
          SUM(error_count) AS total_errors
        FROM performance_metrics
        WHERE time >= NOW() - INTERVAL '24 hours'
      `;

      const result = await query(queryText);
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Failed to fetch metrics summary:', error);
      res.status(500).json({ error: 'Failed to fetch metrics summary' });
    }
  }
);

module.exports = router;