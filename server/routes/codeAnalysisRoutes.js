const express = require('express');
const router = express.Router();
const codeAnalysisController = require('../controllers/codeAnalysisController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// Validation schemas
const analyzeCodeSchema = {
  body: {
    type: 'object',
    required: ['code'],
    properties: {
      code: { type: 'string' }
    }
  }
};

const saveAnalysisSchema = {
  body: {
    type: 'object',
    required: ['code', 'analysis'],
    properties: {
      code: { type: 'string' },
      analysis: { type: 'object' },
      metadata: { type: 'object' }
    }
  }
};

// Routes
router.post(
  '/analyze',
  authenticate,
  validateRequest(analyzeCodeSchema),
  codeAnalysisController.analyzeCode
);

router.get(
  '/history/:userId',
  authenticate,
  codeAnalysisController.getAnalysisHistory
);

router.post(
  '/save',
  authenticate,
  validateRequest(saveAnalysisSchema),
  codeAnalysisController.saveAnalysis
);

module.exports = router;