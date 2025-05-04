const express = require('express');
const router = express.Router();
const codeGenerationService = require('../services/codeGenerationService');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Validation schemas
const generateCodeSchema = {
  body: {
    type: 'object',
    required: ['blueprint', 'context'],
    properties: {
      blueprint: {
        type: 'object',
        required: ['name', 'version', 'components', 'dependencies'],
        properties: {
          name: { type: 'string' },
          version: { type: 'string' },
          components: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'type', 'template'],
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                template: { type: 'string' },
                parameters: { type: 'object' },
                dependencies: { type: 'array' }
              }
            }
          },
          dependencies: {
            type: 'array',
            items: {
              type: 'object',
              required: ['from', 'to', 'type'],
              properties: {
                from: { type: 'string' },
                to: { type: 'string' },
                type: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        }
      },
      context: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          environment: { type: 'string' },
          constraints: { type: 'object' }
        }
      }
    }
  }
};

// Generate code
router.post(
  '/generate',
  authenticate,
  validateRequest(generateCodeSchema),
  async (req, res) => {
    try {
      const { blueprint, context } = req.body;
      const result = await codeGenerationService.generateCode(blueprint, context);
      res.json(result);
    } catch (error) {
      logger.error('Failed to generate code:', error);
      res.status(500).json({ error: 'Failed to generate code' });
    }
  }
);

// Analyze blueprint
router.post(
  '/analyze',
  authenticate,
  validateRequest(generateCodeSchema),
  async (req, res) => {
    try {
      const { blueprint, context } = req.body;
      const analysis = await codeGenerationService.analyzeBlueprint(blueprint, context);
      res.json(analysis);
    } catch (error) {
      logger.error('Failed to analyze blueprint:', error);
      res.status(500).json({ error: 'Failed to analyze blueprint' });
    }
  }
);

// Validate generated code
router.post(
  '/validate',
  authenticate,
  async (req, res) => {
    try {
      const { components, integration } = req.body;
      const validation = await codeGenerationService.validateGeneratedCode(components, integration);
      res.json(validation);
    } catch (error) {
      logger.error('Failed to validate generated code:', error);
      res.status(500).json({ error: 'Failed to validate generated code' });
    }
  }
);

module.exports = router;