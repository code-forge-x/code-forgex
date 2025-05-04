const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// Validation middleware
const validateTemplate = [
  check('templateId')
    .notEmpty()
    .withMessage('Template ID is required')
    .trim(),
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  check('description')
    .notEmpty()
    .withMessage('Description is required'),
  check('version')
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage('Version must be in semantic format (e.g., 1.0.0)'),
  check('category')
    .isArray()
    .withMessage('Category must be an array')
    .notEmpty()
    .withMessage('At least one category is required'),
  check('roles')
    .isArray()
    .withMessage('Roles must be an array')
    .notEmpty()
    .withMessage('At least one role is required'),
  check('content')
    .notEmpty()
    .withMessage('Content is required'),
  check('parameters')
    .isArray()
    .withMessage('Parameters must be an array'),
  check('dependencies')
    .isArray()
    .withMessage('Dependencies must be an array'),
  validateRequest
];

const validateMetrics = [
  check('successRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Success rate must be between 0 and 1'),
  check('tokenEfficiency')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Token efficiency must be a positive number'),
  check('avgResponseTime')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Average response time must be a positive number'),
  check('userSatisfaction')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('User satisfaction must be between 0 and 1'),
  validateRequest
];

// Public routes
router.get('/', templateController.getTemplates);

// Protected routes
router.use(authenticate);

// Template management routes
router.post('/', authorize(['admin', 'developer']), validateTemplate, templateController.createTemplate);
router.get('/:id', templateController.getTemplate);
router.put('/:id', authorize(['admin', 'developer']), validateTemplate, templateController.updateTemplate);
router.delete('/:id', authorize(['admin', 'developer']), templateController.deleteTemplate);

// Version management routes
router.get('/:id/versions', templateController.getTemplateVersions);

// Performance metrics routes
router.put('/:id/metrics', authorize(['admin', 'developer']), validateMetrics, templateController.updateTemplateMetrics);

module.exports = router; 