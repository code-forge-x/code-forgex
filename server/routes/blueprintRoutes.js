const express = require('express');
const router = express.Router();
const blueprintService = require('../services/blueprintService');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Validation schemas
const generateBlueprintSchema = {
  body: {
    type: 'object',
    required: ['requirements', 'context'],
    properties: {
      requirements: {
        type: 'object',
        required: ['name', 'description', 'components'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          components: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'type', 'description'],
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                description: { type: 'string' },
                requirements: { type: 'object' }
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

// Generate blueprint
router.post(
  '/generate',
  authenticate,
  validateRequest(generateBlueprintSchema),
  async (req, res) => {
    try {
      const { requirements, context } = req.body;
      const result = await blueprintService.generateBlueprint(requirements, context);
      res.json(result);
    } catch (error) {
      logger.error('Failed to generate blueprint:', error);
      res.status(500).json({ error: 'Failed to generate blueprint' });
    }
  }
);

// Analyze requirements
router.post(
  '/analyze',
  authenticate,
  validateRequest(generateBlueprintSchema),
  async (req, res) => {
    try {
      const { requirements, context } = req.body;
      const analysis = await blueprintService.analyzeRequirements(requirements, context);
      res.json(analysis);
    } catch (error) {
      logger.error('Failed to analyze requirements:', error);
      res.status(500).json({ error: 'Failed to analyze requirements' });
    }
  }
);

// Validate blueprint
router.post(
  '/validate',
  authenticate,
  async (req, res) => {
    try {
      const { blueprint } = req.body;
      const validation = await blueprintService.validateBlueprint(blueprint);
      res.json(validation);
    } catch (error) {
      logger.error('Failed to validate blueprint:', error);
      res.status(500).json({ error: 'Failed to validate blueprint' });
    }
  }
);

module.exports = router;