const jwt = require('jsonwebtoken');
const config = require('../config/default');
const logger = require('../utils/logger');
const User = require('../models/User');
const Role = require('../models/Role');
const { asyncHandler } = require('./async');

// Protect routes
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    // Update last login
    await user.updateLastLogin();

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Role-based access control middleware
const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate('role');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const hasRole = requiredRoles.some(role => user.role.name === role);
      if (!hasRole) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      logger.error('Role check error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

// Session management middleware
const sessionManager = async (req, res, next) => {
  try {
    const sessionToken = req.cookies.session;
    if (!sessionToken) {
      return next();
    }

    const session = await Session.findOne({ token: sessionToken });
    if (!session || session.expiresAt < new Date()) {
      res.clearCookie('session');
      return next();
    }

    req.session = session;
    next();
  } catch (error) {
    logger.error('Session management error:', error);
    next();
  }
};

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = {};
  }

  if (!req.app.locals.rateLimit[ip]) {
    req.app.locals.rateLimit[ip] = {
      count: 0,
      resetTime: now + 60000 // 1 minute window
    };
  }

  const limit = req.app.locals.rateLimit[ip];
  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + 60000;
  }

  limit.count++;
  if (limit.count > 100) { // 100 requests per minute
    return res.status(429).json({ message: 'Too many requests' });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  checkRole,
  sessionManager,
  rateLimiter
};