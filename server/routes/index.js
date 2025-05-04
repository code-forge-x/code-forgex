const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const promptRoutes = require('./prompts');
const metricsRoutes = require('./metrics');
const auditRoutes = require('./audit');
const embeddingsRoutes = require('./embeddings');
const templateRoutes = require('./templates');
const documentRoutes = require('./documents');

// Mount routes directly without prefixes 
router.use('/auth', authRoutes);
router.use('/prompts', promptRoutes);
router.use('/metrics', metricsRoutes);
router.use('/audit', auditRoutes);
router.use('/embeddings', embeddingsRoutes);
router.use('/templates', templateRoutes);
router.use('/admin/documents', documentRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router; 