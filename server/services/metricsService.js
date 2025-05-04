const { timescalePool } = require('../config/database');
const logger = require('../utils/logger');

class MetricsService {
  // Store template metrics
  static async storeMetrics(templateId, metrics) {
    try {
      await timescalePool.query(
        `INSERT INTO template_metrics 
         (time, template_id, success_rate, token_efficiency, avg_response_time, user_satisfaction)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          new Date(),
          templateId,
          metrics.successRate,
          metrics.tokenEfficiency,
          metrics.avgResponseTime,
          metrics.userSatisfaction
        ]
      );
    } catch (error) {
      logger.error('Error storing metrics:', error);
      throw error;
    }
  }

  // Get metrics for a template over time
  static async getTemplateMetrics(templateId, timeRange = '1d') {
    try {
      const query = `
        SELECT 
          time_bucket('1 hour', time) as bucket,
          AVG(success_rate) as avg_success_rate,
          AVG(token_efficiency) as avg_token_efficiency,
          AVG(avg_response_time) as avg_response_time,
          AVG(user_satisfaction) as avg_user_satisfaction
        FROM template_metrics
        WHERE template_id = $1
          AND time > NOW() - INTERVAL '${timeRange}'
        GROUP BY bucket
        ORDER BY bucket DESC
      `;

      const result = await timescalePool.query(query, [templateId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting template metrics:', error);
      throw error;
    }
  }

  // Get aggregated metrics for all templates
  static async getAggregatedMetrics(timeRange = '1d') {
    try {
      const query = `
        SELECT 
          template_id,
          AVG(success_rate) as avg_success_rate,
          AVG(token_efficiency) as avg_token_efficiency,
          AVG(avg_response_time) as avg_response_time,
          AVG(user_satisfaction) as avg_user_satisfaction
        FROM template_metrics
        WHERE time > NOW() - INTERVAL '${timeRange}'
        GROUP BY template_id
        ORDER BY avg_success_rate DESC
      `;

      const result = await timescalePool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting aggregated metrics:', error);
      throw error;
    }
  }

  // Get performance trends
  static async getPerformanceTrends(templateId, timeRange = '7d') {
    try {
      const query = `
        SELECT 
          time_bucket('1 day', time) as bucket,
          AVG(success_rate) as avg_success_rate,
          AVG(token_efficiency) as avg_token_efficiency,
          AVG(avg_response_time) as avg_response_time,
          AVG(user_satisfaction) as avg_user_satisfaction
        FROM template_metrics
        WHERE template_id = $1
          AND time > NOW() - INTERVAL '${timeRange}'
        GROUP BY bucket
        ORDER BY bucket ASC
      `;

      const result = await timescalePool.query(query, [templateId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting performance trends:', error);
      throw error;
    }
  }
}

module.exports = MetricsService; 