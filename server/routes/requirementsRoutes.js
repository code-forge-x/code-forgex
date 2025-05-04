const express = require('express');
const router = express.Router();
const requirementsService = require('../services/requirementsService');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Validation schemas
const collectRequirementsSchema = {
  body: {
    type: 'object',
    required: ['project', 'requirements'],
    properties: {
      project: {
        type: 'object',
        required: ['name', 'description'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          environment: { type: 'string' }
        }
      },
      requirements: {
        type: 'object',
        required: ['components'],
        properties: {
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
      }
    }
  }
};

// Collect requirements
router.post(
  '/collect',
  authenticate,
  validateRequest(collectRequirementsSchema),
  async (req, res) => {
    try {
      const { project, requirements } = req.body;
      const result = await requirementsService.collectRequirements(project, requirements);
      res.json(result);
    } catch (error) {
      logger.error('Failed to collect requirements:', error);
      res.status(500).json({ error: 'Failed to collect requirements' });
    }
  }
);

// Analyze requirements
router.post(
  '/analyze',
  authenticate,
  validateRequest(collectRequirementsSchema),
  async (req, res) => {
    try {
      const { requirements } = req.body;
      const analysis = await requirementsService.analyzeRequirements(requirements);
      res.json(analysis);
    } catch (error) {
      logger.error('Failed to analyze requirements:', error);
      res.status(500).json({ error: 'Failed to analyze requirements' });
    }
  }
);

// Validate requirements
router.post(
  '/validate',
  authenticate,
  async (req, res) => {
    try {
      const { analysis } = req.body;
      const validation = await requirementsService.validateRequirements(analysis);
      res.json(validation);
    } catch (error) {
      logger.error('Failed to validate requirements:', error);
      res.status(500).json({ error: 'Failed to validate requirements' });
    }
  }
);

module.exports = router;