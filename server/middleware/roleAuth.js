const logger = require('../utils/logger');

// Role-based middleware
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn(`Access denied: user ${req.user?.id} attempted to access admin route`);
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

exports.hasRole = (roles) => {
  return (req, res, next) => {
    // Support single role or array of roles
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      logger.warn(`Access denied: user ${req.user?.id} with role ${req.user?.role} attempted to access route requiring ${requiredRoles.join(' or ')}`);
      return res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
    }
    next();
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