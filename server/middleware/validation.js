const { body, query, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { asyncHandler } = require('./async');

const validationRules = {
  getAuditLogs: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('action').optional().isIn(['create', 'update', 'delete', 'login', 'logout', 'error']),
    query('userId').optional().isString(),
    query('entityType').optional().isString(),
    query('entityId').optional().isString()
  ],
  getAuditStatistics: [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate()
  ],
  getAuditLogById: [
    param('id').isMongoId()
  ],
  exportAuditLogs: [
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('action').optional().isIn(['create', 'update', 'delete', 'login', 'logout', 'error']),
    query('userId').optional().isString(),
    query('entityType').optional().isString(),
    query('entityId').optional().isString()
  ]
};

const validate = (ruleName) => {
  const rules = validationRules[ruleName];
  if (!rules) {
    throw new Error(`Validation rule '${ruleName}' not found`);
  }
  return rules;
};

// Sanitize and validate user input
const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });

  // Sanitize query parameters
  Object.keys(req.query).forEach(key => {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].trim();
    }
  });

  next();
};

// Validation middleware for registration
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation middleware for login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validate request middleware
const validateRequest = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
});

// Template validation middleware
const validateTemplate = asyncHandler(async (req, res, next) => {
  const { name, description, code, version, parameters, dependencies } = req.body;

  // Required fields
  if (!name || !description || !code || !version) {
    return res.status(400).json({
      message: 'Missing required fields: name, description, code, version'
    });
  }

  // Validate version format
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(version)) {
    return res.status(400).json({
      message: 'Version must be in format x.y.z (e.g., 1.0.0)'
    });
  }

  // Validate parameters if provided
  if (parameters) {
    if (!Array.isArray(parameters)) {
      return res.status(400).json({
        message: 'Parameters must be an array'
      });
    }

    for (const param of parameters) {
      if (!param.name || !param.type) {
        return res.status(400).json({
          message: 'Each parameter must have a name and type'
        });
      }
    }
  }

  // Validate dependencies if provided
  if (dependencies) {
    if (!Array.isArray(dependencies)) {
      return res.status(400).json({
        message: 'Dependencies must be an array'
      });
    }

    for (const dep of dependencies) {
      if (!dep.name || !dep.version) {
        return res.status(400).json({
          message: 'Each dependency must have a name and version'
        });
      }
    }
  }

  next();
});

// Validation middleware for metrics
const validateMetrics = [
  body('metricName')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Metric name must be at least 3 characters long'),
  body('value')
    .isNumeric()
    .withMessage('Metric value must be a number'),
  body('tags')
    .optional()
    .isObject()
    .withMessage('Tags must be an object'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Metrics validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validate,
  sanitizeInput,
  validateRegister,
  validateLogin,
  validateTemplate,
  validateMetrics,
  validateRequest
};