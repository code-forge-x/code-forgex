const express = require('express');
const router = express.Router();
const dependencyService = require('../services/dependencyService');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Validation schemas
const resolveDependenciesSchema = {
  params: {
    type: 'object',
    required: ['templateId', 'version'],
    properties: {
      templateId: { type: 'string' },
      version: { type: 'integer' }
    }
  }
};

const validateDependenciesSchema = {
  body: {
    type: 'object',
    required: ['dependencies'],
    properties: {
      dependencies: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name', 'version', 'type'],
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            type: { type: 'string' }
          }
        }
      }
    }
  }
};

// Resolve dependencies for a template
router.get(
  '/resolve/:templateId/:version',
  authenticate,
  validateRequest(resolveDependenciesSchema),
  async (req, res) => {
    try {
      const { templateId, version } = req.params;
      const resolvedDependencies = await dependencyService.resolveDependencies(templateId, version);
      res.json(resolvedDependencies);
    } catch (error) {
      logger.error('Failed to resolve dependencies:', error);
      res.status(500).json({ error: 'Failed to resolve dependencies' });
    }
  }
);

// Validate dependencies
router.post(
  '/validate',
  authenticate,
  validateRequest(validateDependenciesSchema),
  async (req, res) => {
    try {
      const { dependencies } = req.body;
      const validationResult = await dependencyService.validateDependencies(dependencies);
      res.json(validationResult);
    } catch (error) {
      logger.error('Failed to validate dependencies:', error);
      res.status(500).json({ error: 'Failed to validate dependencies' });
    }
  }
);

// Get dependency graph
router.get(
  '/graph/:templateId/:version',
  authenticate,
  validateRequest(resolveDependenciesSchema),
  async (req, res) => {
    try {
      const { templateId, version } = req.params;
      const graph = await dependencyService.getDependencyGraph(templateId, version);
      res.json(graph);
    } catch (error) {
      logger.error('Failed to get dependency graph:', error);
      res.status(500).json({ error: 'Failed to get dependency graph' });
    }
  }
);

module.exports = router;