const logger = require('../utils/logger');

/**
 * Middleware to check if user has admin role
 */
const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      logger.warn('Admin check failed: No user in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      logger.warn(`Admin access denied for user role: ${req.user.role}`);
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (err) {
    logger.error(`Role check error: ${err.message}`);
    res.status(500).json({ message: 'Server error during role check' });
  }
};

/**
 * Middleware to check if user has one of the allowed roles
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn('Role check failed: No user in request');
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(`Access denied for user role: ${req.user.role}`);
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (err) {
      logger.error(`Role check error: ${err.message}`);
      res.status(500).json({ message: 'Server error during role check' });
    }
  };
};

// Project access middleware
exports.projectAccess = (req, res, next) => {
  // Implementation will be expanded when project model is fully implemented
  // For now, we'll just pass through
  next();
};

// Support conversation access middleware
exports.supportAccess = (req, res, next) => {
  // Implementation will be expanded when support model is fully implemented
  // For now, we'll just pass through
  next();
};

module.exports = {
  adminOnly,
  hasRole
};