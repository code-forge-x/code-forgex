const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const auditLogging = async (req, res, next) => {
  const startTime = Date.now();

  // Function to log the audit entry
  const logAudit = async (status, error = null) => {
    try {
      const duration = Date.now() - startTime;
      const auditEntry = {
        userId: req.user?.id || null,
        action: req.method,
        endpoint: req.originalUrl,
        status,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        requestBody: req.body,
        queryParams: req.query,
        error: error ? error.message : null
      };

      await AuditLog.create(auditEntry);
    } catch (err) {
      logger.error('Failed to create audit log:', err);
    }
  };

  // Log request start
  await logAudit('started');

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = async function(chunk, encoding) {
    try {
      await logAudit('completed');
    } catch (err) {
      logger.error('Error in audit logging:', err);
    }
    originalEnd.call(this, chunk, encoding);
  };

  // Error handling
  res.on('error', async (error) => {
    await logAudit('error', error);
  });

  next();
};

module.exports = auditLogging;