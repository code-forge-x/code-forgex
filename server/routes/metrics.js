const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { adminOnly } = require('../middleware/roleAuth');
const { apiLimiter } = require('../middleware/rateLimiter');
const performanceTracking = require('../middleware/performanceTracking');
const auditLogging = require('../middleware/auditLogging');

// Apply middleware
router.use(apiLimiter);
router.use(performanceTracking);
router.use(auditLogging);

// Validation middleware
const validateMetrics = [
  check('successRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Success rate must be between 0 and 1'),
  check('tokenEfficiency')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Token efficiency must be a positive number'),
  check('avgResponseTime')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Average response time must be a positive number'),
  check('userSatisfaction')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('User satisfaction must be between 0 and 1'),
  validateRequest
];

// Protected routes
router.use(authenticate);

// Template metrics routes
router.get('/templates/:id', metricsController.getTemplateMetrics);
router.get('/templates/:id/trends', metricsController.getPerformanceTrends);
router.post('/templates/:id', authorize(['admin', 'developer']), validateMetrics, metricsController.storeTemplateMetrics);

// Aggregated metrics routes
router.get('/aggregated', authorize(['admin']), metricsController.getAggregatedMetrics);
router.get('/prompt/:promptId', adminOnly, metricsController.getPromptMetrics);
router.get('/environment/:env', adminOnly, metricsController.getEnvironmentMetrics);

module.exports = router;