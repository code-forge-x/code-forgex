const express = require('express');
const router = express.Router();
const promptManager = require('../services/promptManager');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * @route GET /api/prompts
 * @desc Get all prompt templates
 * @access Private (Admin)
 */
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const prompts = await promptManager.getAllPromptTemplates();
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompts', error: error.message });
  }
});

/**
 * @route GET /api/prompts/:name
 * @desc Get prompt template by name
 * @access Private (Admin)
 */
router.get('/:name', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name } = req.params;
    const { version } = req.query;
    
    const prompt = await promptManager.getPromptTemplate(name, version);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompt', error: error.message });
  }
});

/**
 * @route POST /api/prompts
 * @desc Create new prompt template
 * @access Private (Admin)
 */
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const prompt = await promptManager.createPromptTemplate(req.body, req.user.id);
    res.status(201).json(prompt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating prompt', error: error.message });
  }
});

/**
 * @route PUT /api/prompts/:name
 * @desc Update prompt template
 * @access Private (Admin)
 */
router.put('/:name', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name } = req.params;
    const { version } = req.query;
    
    const updatedPrompt = await promptManager.updatePromptTemplate(
      name,
      version,
      req.body,
      req.user.id
    );
    
    res.json(updatedPrompt);
  } catch (error) {
    res.status(500).json({ message: 'Error updating prompt', error: error.message });
  }
});

/**
 * @route DELETE /api/prompts/:name
 * @desc Delete prompt template
 * @access Private (Admin)
 */
router.delete('/:name', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name } = req.params;
    const { version } = req.query;
    
    const deleted = await promptManager.deletePromptTemplate(name, version);
    if (!deleted) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    
    res.json({ message: 'Prompt template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prompt', error: error.message });
  }
});

/**
 * @route GET /api/prompts/:name/versions
 * @desc Get all versions of a prompt template
 * @access Private (Admin)
 */
router.get('/:name/versions', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name } = req.params;
    const versions = await promptManager.getPromptVersions(name);
    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompt versions', error: error.message });
  }
});

/**
 * @route POST /api/prompts/:name/test
 * @desc Test prompt template with variables
 * @access Private (Admin)
 */
router.post('/:name/test', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name } = req.params;
    const { variables } = req.body;
    
    const result = await promptManager.testPrompt(name, variables);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error testing prompt', error: error.message });
  }
});

/**
 * @route GET /api/prompts/metrics
 * @desc Get prompt performance metrics
 * @access Private (Admin)
 */
router.get('/metrics', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const metrics = await promptManager.getPerformanceMetrics(req.query);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
});

module.exports = router; 