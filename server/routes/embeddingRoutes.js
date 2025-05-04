const express = require('express');
const router = express.Router();
const { insertEmbedding, searchSimilar, getEmbedding } = require('../config/milvus');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Validation schemas
const embeddingSchema = {
  body: {
    type: 'object',
    required: ['embedding', 'promptId', 'version'],
    properties: {
      embedding: {
        type: 'array',
        items: { type: 'number' }
      },
      promptId: { type: 'string' },
      version: { type: 'integer' },
      metadata: { type: 'object' }
    }
  }
};

const searchSchema = {
  body: {
    type: 'object',
    required: ['embedding'],
    properties: {
      embedding: {
        type: 'array',
        items: { type: 'number' }
      },
      limit: { type: 'integer', minimum: 1, maximum: 100 }
    }
  }
};

// Insert embedding
router.post(
  '/',
  authenticate,
  validateRequest(embeddingSchema),
  async (req, res) => {
    try {
      const { embedding, promptId, version, metadata } = req.body;
      const result = await insertEmbedding(embedding, promptId, version, metadata);
      res.json(result);
    } catch (error) {
      logger.error('Failed to insert embedding:', error);
      res.status(500).json({ error: 'Failed to insert embedding' });
    }
  }
);

// Search similar embeddings
router.post(
  '/search',
  authenticate,
  validateRequest(searchSchema),
  async (req, res) => {
    try {
      const { embedding, limit = 10 } = req.body;
      const result = await searchSimilar(embedding, limit);
      res.json(result);
    } catch (error) {
      logger.error('Failed to search similar embeddings:', error);
      res.status(500).json({ error: 'Failed to search similar embeddings' });
    }
  }
);

// Get embedding by prompt ID and version
router.get(
  '/:promptId/:version',
  authenticate,
  async (req, res) => {
    try {
      const { promptId, version } = req.params;
      const result = await getEmbedding(promptId, parseInt(version));
      res.json(result);
    } catch (error) {
      logger.error('Failed to get embedding:', error);
      res.status(500).json({ error: 'Failed to get embedding' });
    }
  }
);

module.exports = router;