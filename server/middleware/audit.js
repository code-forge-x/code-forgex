const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const logAudit = async (req, res, next) => {
  const startTime = Date.now();

  // Store the original response methods
  const originalJson = res.json;
  const originalSend = res.send;

  // Override response methods to capture the response
  res.json = function (data) {
    logRequest(req, res, data, startTime);
    return originalJson.call(this, data);
  };

  res.send = function (data) {
    logRequest(req, res, data, startTime);
    return originalSend.call(this, data);
  };

  next();
};

const logRequest = async (req, res, responseData, startTime) => {
  try {
    const responseTime = Date.now() - startTime;
    const { method, originalUrl, body, query, params, user } = req;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Skip logging for audit-related endpoints to prevent infinite loops
    if (originalUrl.startsWith('/api/audit')) {
      return;
    }

    // Determine the action based on the HTTP method
    const action = getActionFromMethod(method);
    if (!action) {
      return;
    }

    // Extract entity information from the URL
    const { entityType, entityId } = extractEntityInfo(originalUrl);

    // Create the audit log entry
    const auditLog = {
      timestamp: new Date(),
      action,
      userId: user ? user.id : 'anonymous',
      ipAddress,
      entityType,
      entityId,
      changes: {
        request: {
          method,
          url: originalUrl,
          body,
          query,
          params
        },
        response: responseData,
        responseTime
      },
      metadata: {
        userAgent: req.get('user-agent'),
        statusCode: res.statusCode
      }
    };

    // Log any errors
    if (res.statusCode >= 400) {
      auditLog.error = responseData.error || 'Unknown error';
    }

    // Save the audit log
    await AuditLog.createLog(auditLog);
  } catch (error) {
    logger.error('Error logging audit:', error);
  }
};

const getActionFromMethod = (method) => {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'read';
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return null;
  }
};

const extractEntityInfo = (url) => {
  const parts = url.split('/').filter(Boolean);
  let entityType = null;
  let entityId = null;

  // Look for entity type and ID in the URL
  for (let i = 0; i < parts.length; i++) {
    if (['users', 'prompts', 'embeddings', 'metrics'].includes(parts[i])) {
      entityType = parts[i];
      if (parts[i + 1] && !parts[i + 1].includes('?')) {
        entityId = parts[i + 1];
      }
      break;
    }
  }

  return { entityType, entityId };
};

module.exports = {
  logAudit
};