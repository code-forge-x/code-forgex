const PerformanceMetrics = require('../models/PerformanceMetrics');
const Prompt = require('../models/Prompt');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const MetricsService = require('../services/metricsService');
const { asyncHandler } = require('../middleware/async');

/**
 * Get aggregated metrics for the specified time period
 * @route GET /api/metrics/aggregated
 */
exports.getAggregatedMetrics = asyncHandler(async (req, res) => {
  const { timeRange = '1d' } = req.query;

  const metrics = await MetricsService.getAggregatedMetrics(timeRange);

  res.status(200).json({
    success: true,
    data: metrics
  });
});

/**
 * Get metrics for a specific prompt
 * @route GET /api/metrics/prompt/:promptId
 */
exports.getPromptMetrics = asyncHandler(async (req, res) => {
  try {
    const { promptId } = req.params;
    const { startDate, endDate } = req.query;

    const query = {
      prompt_id: promptId
    };

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const metrics = await PerformanceMetrics.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(metrics);
  } catch (error) {
    logger.error(`Error fetching prompt metrics: ${error.message}`);
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
});

/**
 * Get metrics for a specific environment
 * @route GET /api/metrics/environment/:env
 */
exports.getEnvironmentMetrics = async (req, res) => {
  try {
    const { env } = req.params;
    const { startDate, endDate } = req.query;

    const query = {
      environment: env
    };

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const metrics = await PerformanceMetrics.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(metrics);
  } catch (error) {
    logger.error(`Error fetching environment metrics: ${error.message}`);
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
};

// @desc    Get template metrics
// @route   GET /api/metrics/templates/:id
// @access  Private
exports.getTemplateMetrics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { timeRange = '1d' } = req.query;

  const metrics = await MetricsService.getTemplateMetrics(id, timeRange);

  res.status(200).json({
    success: true,
    data: metrics
  });
});

// @desc    Get performance trends
// @route   GET /api/metrics/templates/:id/trends
// @access  Private
exports.getPerformanceTrends = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { timeRange = '7d' } = req.query;

  const trends = await MetricsService.getPerformanceTrends(id, timeRange);

  res.status(200).json({
    success: true,
    data: trends
  });
});

// @desc    Store template metrics
// @route   POST /api/metrics/templates/:id
// @access  Private
exports.storeTemplateMetrics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const metrics = req.body;

  await MetricsService.storeMetrics(id, metrics);

  logger.info(`Metrics stored for template ${id}`);

  res.status(201).json({
    success: true,
    message: 'Metrics stored successfully'
  });
});