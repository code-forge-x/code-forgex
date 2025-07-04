const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');
const promptManager = require('../services/promptManager');
const logger = require('../utils/logger');

// @route    GET /api/prompts
// @desc     Get all prompt templates
// @access   Admin only
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const prompts = await promptManager.getAllPromptTemplates();
    res.json(prompts);
  } catch (err) {
    logger.error(`Error fetching prompts: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching prompts' });
  }
});

// @route    POST /api/prompts
// @desc     Create new prompt template
// @access   Admin only
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const templateData = req.body;
    const newTemplate = await promptManager.createPromptTemplate(templateData);
    res.status(201).json(newTemplate);
  } catch (err) {
    logger.error(`Error creating prompt: ${err.message}`);
    res.status(500).json({ message: 'Server error creating prompt' });
  }
});

// @route    GET /api/prompts/:name
// @desc     Get latest version of prompt by name
// @access   Admin only
router.get('/:name', auth, adminOnly, async (req, res) => {
  try {
    const { name } = req.params;
    const prompt = await promptManager.getPromptTemplate(name);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    
    res.json(prompt);
  } catch (err) {
    logger.error(`Error fetching prompt by name: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching prompt' });
  }
});

// @route    GET /api/prompts/:name/:version
// @desc     Get specific version of prompt
// @access   Admin only
router.get('/:name/:version', auth, adminOnly, async (req, res) => {
  try {
    const { name, version } = req.params;
    const prompt = await promptManager.getPromptTemplate(name, parseInt(version));
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt template version not found' });
    }
    
    res.json(prompt);
  } catch (err) {
    logger.error(`Error fetching prompt version: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching prompt version' });
  }
});

// @route    PUT /api/prompts/:name/:version
// @desc     Update prompt template
// @access   Admin only
router.put('/:name/:version', auth, adminOnly, async (req, res) => {
  try {
    const { name, version } = req.params;
    const updateData = req.body;
    
    const updatedTemplate = await promptManager.updatePromptTemplate(
      name, 
      parseInt(version),
      updateData
    );
    
    res.json(updatedTemplate);
  } catch (err) {
    logger.error(`Error updating prompt: ${err.message}`);
    res.status(500).json({ message: 'Server error updating prompt' });
  }
});

// @route    GET /api/prompts/:name/versions
// @desc     Get versions of a prompt template
// @access   Admin only
router.get('/:name/versions', auth, adminOnly, async (req, res) => {
  try {
    const { name } = req.params;
    const versions = await promptManager.getPromptVersions(name);
    res.json(versions);
  } catch (err) {
    logger.error(`Error fetching prompt versions: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching versions' });
  }
});

// @route    GET /api/prompts/:name/compare/:oldVersion/:newVersion
// @desc     Compare two versions of a prompt template
// @access   Admin only
router.get('/:name/compare/:oldVersion/:newVersion', auth, adminOnly, async (req, res) => {
  try {
    const { name, oldVersion, newVersion } = req.params;
    
    const comparison = await promptManager.compareVersions(
      name,
      parseInt(oldVersion),
      parseInt(newVersion)
    );
    
    res.json(comparison);
  } catch (err) {
    logger.error(`Error comparing prompt versions: ${err.message}`);
    res.status(500).json({ message: 'Server error comparing versions' });
  }
});

// @route    POST /api/prompts/test
// @desc     Test prompt template with variables
// @access   Admin only
router.post('/test', auth, adminOnly, async (req, res) => {
  try {
    const { promptId, variables } = req.body;
    
    if (!promptId) {
      return res.status(400).json({ message: 'Prompt ID is required' });
    }
    
    const result = await promptManager.testPrompt(promptId, variables || {});
    res.json(result);
  } catch (err) {
    logger.error(`Error testing prompt: ${err.message}`);
    res.status(500).json({ message: 'Server error testing prompt' });
  }
});

// @route    GET /api/prompts/performance
// @desc     Get prompt performance metrics
// @access   Admin only
router.get('/performance', auth, adminOnly, async (req, res) => {
  try {
    const { promptId, timeRange } = req.query;
    
    const filter = {};
    if (promptId) filter.promptId = promptId;
    if (timeRange) filter.timeRange = timeRange;
    
    const metrics = await promptManager.getPerformanceMetrics(filter);
    res.json(metrics);
  } catch (err) {
    logger.error(`Error fetching performance metrics: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching metrics' });
  }
});

// @route    GET /api/prompts/components
// @desc     Get all prompt components
// @access   Admin only
router.get('/components', auth, adminOnly, async (req, res) => {
  try {
    const { category } = req.query;
    const components = await promptManager.getPromptComponents(category);
    res.json(components);
  } catch (err) {
    logger.error(`Error fetching prompt components: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching components' });
  }
});

// @route    POST /api/prompts/components
// @desc     Create prompt component
// @access   Admin only
router.post('/components', auth, adminOnly, async (req, res) => {
  try {
    const componentData = req.body;
    const newComponent = await promptManager.createPromptComponent(componentData);
    res.status(201).json(newComponent);
  } catch (err) {
    logger.error(`Error creating prompt component: ${err.message}`);
    res.status(500).json({ message: 'Server error creating component' });
  }
});

// @route    PUT /api/prompts/components/:id
// @desc     Update prompt component
// @access   Admin only
router.put('/components/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedComponent = await promptManager.updatePromptComponent(id, updateData);
    res.json(updatedComponent);
  } catch (err) {
    logger.error(`Error updating prompt component: ${err.message}`);
    res.status(500).json({ message: 'Server error updating component' });
  }
});

// @route    DELETE /api/prompts/components/:id
// @desc     Delete prompt component
// @access   Admin only
router.delete('/components/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await promptManager.deletePromptComponent(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    res.json({ message: 'Component deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting prompt component: ${err.message}`);
    res.status(500).json({ message: 'Server error deleting component' });
  }
});

module.exports = router;