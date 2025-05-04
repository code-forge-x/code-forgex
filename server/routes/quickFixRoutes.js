const express = require('express');
const router = express.Router();
const quickFixService = require('../services/quickFixService');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Validation schemas
const suggestFixesSchema = {
  body: {
    type: 'object',
    required: ['code', 'context'],
    properties: {
      code: { type: 'string' },
      context: {
        type: 'object',
        required: ['language', 'type'],
        properties: {
          language: { type: 'string' },
          type: { type: 'string' },
          environment: { type: 'string' },
          constraints: { type: 'object' }
        }
      }
    }
  }
};

// Suggest fixes
router.post(
  '/suggest',
  authenticate,
  validateRequest(suggestFixesSchema),
  async (req, res) => {
    try {
      const { code, context } = req.body;
      const result = await quickFixService.suggestFixes(code, context);
      res.json(result);
    } catch (error) {
      logger.error('Failed to suggest fixes:', error);
      res.status(500).json({ error: 'Failed to suggest fixes' });
    }
  }
);

// Analyze code
router.post(
  '/analyze',
  authenticate,
  validateRequest(suggestFixesSchema),
  async (req, res) => {
    try {
      const { code, context } = req.body;
      const analysis = await quickFixService.analyzeCode(code, context);
      res.json(analysis);
    } catch (error) {
      logger.error('Failed to analyze code:', error);
      res.status(500).json({ error: 'Failed to analyze code' });
    }
  }
);

// Validate fixes
router.post(
  '/validate',
  authenticate,
  async (req, res) => {
    try {
      const { fixes, originalCode } = req.body;
      const validatedFixes = await quickFixService.validateFixes(fixes, originalCode);
      res.json(validatedFixes);
    } catch (error) {
      logger.error('Failed to validate fixes:', error);
      res.status(500).json({ error: 'Failed to validate fixes' });
    }
  }
);

module.exports = router;