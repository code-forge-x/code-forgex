const { query } = require('../config/timescale');
const logger = require('../utils/logger');

class PerformanceMetrics {
  /**
   * Insert a new performance metric
   * @param {Object} metric - The metric data
   * @returns {Promise<Object>} - The inserted metric
   */
  static async insert(metric) {
    try {
      const { prompt_id, user_id, environment, response_time, token_usage, success_rate, error_count, metadata } = metric;
      
      const result = await query(
        `INSERT INTO performance_metrics 
         (time, prompt_id, user_id, environment, response_time, token_usage, success_rate, error_count, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [new Date(), prompt_id, user_id, environment, response_time, token_usage, success_rate, error_count, metadata]
      );

      return result.rows[0];
    } catch (error) {
      logger.error(`Error inserting performance metric: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get metrics for a specific time range
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of metrics
   */
  static async getMetrics(options = {}) {
    try {
      const {
        startTime,
        endTime,
        promptId,
        userId,
        environment,
        interval = '1h',
        limit = 1000
      } = options;

      let queryText = `
        SELECT 
          time_bucket($1, time) as bucket,
          prompt_id,
          user_id,
          environment,
          AVG(response_time) as avg_response_time,
          SUM(token_usage) as total_token_usage,
          AVG(success_rate) as avg_success_rate,
          SUM(error_count) as total_errors,
          COUNT(*) as request_count
        FROM performance_metrics
        WHERE 1=1
      `;
      const params = [interval];
      let paramIndex = 2;

      if (startTime) {
        queryText += ` AND time >= $${paramIndex}`;
        params.push(startTime);
        paramIndex++;
      }

      if (endTime) {
        queryText += ` AND time <= $${paramIndex}`;
        params.push(endTime);
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
        LIMIT $${paramIndex}
      `;
      params.push(limit);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      logger.error(`Error getting performance metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get aggregated metrics for a prompt
   * @param {string} promptId - The prompt ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Aggregated metrics
   */
  static async getPromptMetrics(promptId, options = {}) {
    try {
      const { startTime, endTime } = options;
      
      let queryText = `
        SELECT 
          AVG(response_time) as avg_response_time,
          SUM(token_usage) as total_token_usage,
          AVG(success_rate) as avg_success_rate,
          SUM(error_count) as total_errors,
          COUNT(*) as request_count
        FROM performance_metrics
        WHERE prompt_id = $1
      `;
      const params = [promptId];

      if (startTime) {
        queryText += ` AND time >= $2`;
        params.push(startTime);
      }

      if (endTime) {
        queryText += ` AND time <= $${params.length + 1}`;
        params.push(endTime);
      }

      const result = await query(queryText, params);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error getting prompt metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get environment-specific metrics
   * @param {string} environment - The environment name
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Environment metrics
   */
  static async getEnvironmentMetrics(environment, options = {}) {
    try {
      const { startTime, endTime, interval = '1h' } = options;
      
      let queryText = `
        SELECT 
          time_bucket($1, time) as bucket,
          AVG(response_time) as avg_response_time,
          SUM(token_usage) as total_token_usage,
          AVG(success_rate) as avg_success_rate,
          SUM(error_count) as total_errors,
          COUNT(*) as request_count
        FROM performance_metrics
        WHERE environment = $2
      `;
      const params = [interval, environment];

      if (startTime) {
        queryText += ` AND time >= $3`;
        params.push(startTime);
      }

      if (endTime) {
        queryText += ` AND time <= $${params.length + 1}`;
        params.push(endTime);
      }

      queryText += `
        GROUP BY bucket
        ORDER BY bucket DESC
      `;

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      logger.error(`Error getting environment metrics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = PerformanceMetrics;