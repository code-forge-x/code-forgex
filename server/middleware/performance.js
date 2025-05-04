const logger = require('../utils/logger');

const trackPerformance = (req, res, next) => {
  const startTime = Date.now();

  // Store the original response methods
  const originalJson = res.json;
  const originalSend = res.send;

  // Override response methods to capture the response time
  res.json = function (data) {
    logPerformance(req, res, startTime);
    return originalJson.call(this, data);
  };

  res.send = function (data) {
    logPerformance(req, res, startTime);
    return originalSend.call(this, data);
  };

  next();
};

const logPerformance = (req, res, startTime) => {
  const responseTime = Date.now() - startTime;
  const { method, originalUrl } = req;
  const statusCode = res.statusCode;

  // Log performance metrics
  logger.info('Performance metrics:', {
    method,
    url: originalUrl,
    statusCode,
    responseTime,
    timestamp: new Date().toISOString()
  });

  // Log warning if response time is too high
  if (responseTime > 1000) {
    logger.warn('Slow response detected:', {
      method,
      url: originalUrl,
      responseTime,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  trackPerformance
};