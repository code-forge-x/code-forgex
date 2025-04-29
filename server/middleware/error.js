const logger = require('../utils/logger');

module.exports = function(err, req, res, next) {
  // Log the error
  logger.error(`API Error: ${err.message}`);
  logger.debug(err.stack);
  
  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server error';
  
  // Return error response
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};