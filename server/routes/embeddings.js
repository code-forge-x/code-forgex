const express = require('express');
const router = express.Router();
const { body, param, query, check } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const VectorEmbedding = require('../models/VectorEmbedding');
const logger = require('../utils/logger');
const embeddingsController = require('../controllers/embeddingsController');

// Apply middleware
router.use(authenticate);
router.use(apiLimiter);

// Validation middleware
const validateVector = [
  body('vector').isArray().withMessage('Vector must be an array'),
  body('vector.*').isFloat().withMessage('Vector elements must be numbers'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
];

const validateSearchParams = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('minSimilarity').optional().isFloat({ min: 0, max: 1 }).withMessage('Similarity must be between 0 and 1'),
  query('excludePromptId').optional().isString().withMessage('Exclude prompt ID must be a string')
];

const validateEmbedding = [
  check('embedding')
    .isArray()
    .withMessage('Embedding must be an array')
    .notEmpty()
    .withMessage('Embedding array cannot be empty'),
  validateRequest
];

// Routes
router.post('/prompt/:promptId', 
  [
    param('promptId').isString().withMessage('Prompt ID must be a string'),
    ...validateVector
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { promptId } = req.params;
      const { vector, metadata } = req.body;

      const embedding = await VectorEmbedding.createOrUpdate(promptId, vector, metadata);
      res.json(embedding);
    } catch (error) {
      logger.error(`Error creating embedding: ${error.message}`);
      res.status(500).json({ error: 'Failed to create embedding' });
    }
  }
);

router.post('/search',
  [
    body('vector').isArray().withMessage('Vector must be an array'),
    body('vector.*').isFloat().withMessage('Vector elements must be numbers'),
    ...validateSearchParams
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { vector, ...options } = req.body;
      const results = await VectorEmbedding.findSimilar(vector, options);
      res.json(results);
    } catch (error) {
      logger.error(`Error searching embeddings: ${error.message}`);
      res.status(500).json({ error: 'Failed to search embeddings' });
    }
  }
);

router.get('/prompt/:promptId',
  [
    param('promptId').isString().withMessage('Prompt ID must be a string')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { promptId } = req.params;
      const embeddings = await VectorEmbedding.getByPromptId(promptId);
      res.json(embeddings);
    } catch (error) {
      logger.error(`Error getting prompt embeddings: ${error.message}`);
      res.status(500).json({ error: 'Failed to get prompt embeddings' });
    }
  }
);

router.get('/prompt/:promptId/versions',
  [
    param('promptId').isString().withMessage('Prompt ID must be a string')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { promptId } = req.params;
      const versions = await VectorEmbedding.getVersionHistory(promptId);
      res.json(versions);
    } catch (error) {
      logger.error(`Error getting version history: ${error.message}`);
      res.status(500).json({ error: 'Failed to get version history' });
    }
  }
);

router.delete('/prompt/:promptId',
  [
    param('promptId').isString().withMessage('Prompt ID must be a string'),
    authorize(['admin'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { promptId } = req.params;
      await VectorEmbedding.deleteByPromptId(promptId);
      res.json({ message: 'Embeddings deleted successfully' });
    } catch (error) {
      logger.error(`Error deleting embeddings: ${error.message}`);
      res.status(500).json({ error: 'Failed to delete embeddings' });
    }
  }
);

router.get('/export',
  [
    authorize(['admin']),
    query('limit').optional().isInt({ min: 1, max: 10000 }).withMessage('Limit must be between 1 and 10000')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { limit } = req.query;
      const csvContent = await VectorEmbedding.exportToCSV({ limit });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=embeddings.csv');
      res.send(csvContent);
    } catch (error) {
      logger.error(`Error exporting embeddings: ${error.message}`);
      res.status(500).json({ error: 'Failed to export embeddings' });
    }
  }
);

// Template embedding routes
router.post('/templates/:id', authorize(['admin', 'developer']), validateEmbedding, embeddingsController.storeEmbedding);
router.delete('/templates/:id', authorize(['admin', 'developer']), embeddingsController.deleteEmbedding);

// Search routes
router.post('/search', validateEmbedding, embeddingsController.searchSimilarTemplates);

module.exports = router;