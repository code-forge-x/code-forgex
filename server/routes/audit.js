const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { apiLimiter } = require('../middleware/rateLimiter');
const { trackPerformance } = require('../middleware/performance');
const { logAudit } = require('../middleware/audit');

// Apply middleware
router.use(apiLimiter);
router.use(trackPerformance);
router.use(logAudit);

// Get audit logs with filtering and pagination
router.get('/logs',
  authenticate,
  authorize(['admin']),
  validate('getAuditLogs'),
  auditController.getLogs
);

// Get audit log statistics
router.get('/statistics',
  authenticate,
  authorize(['admin']),
  validate('getAuditStatistics'),
  auditController.getStatistics
);

// Get a specific audit log by ID
router.get('/logs/:id',
  authenticate,
  authorize(['admin']),
  validate('getAuditLogById'),
  auditController.getLogById
);

// Export audit logs to CSV
router.get('/export',
  authenticate,
  authorize(['admin']),
  validate('exportAuditLogs'),
  auditController.exportToCSV
);

module.exports = router;