const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const config = require('../config/default');

module.exports = function(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.header('Authorization');
  
  logger.debug('Auth middleware - checking token');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('No token or invalid token format in Authorization header');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  logger.debug(`Token received: ${token.substring(0, 10)}...`);

  // Verify token
  try {
    logger.debug(`Verifying token with secret: ${config.jwtSecret.substring(0, 4)}...`);
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded.user;
    logger.debug(`Token verified successfully for user ID: ${decoded.user.id}`);
    next();
  } catch (err) {
    logger.error(`Token verification failed: ${err.message}\nStack: ${err.stack}`);
    res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
};