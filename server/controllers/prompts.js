const promptManager = require('../services/promptManager');
const logger = require('../utils/logger');

/**
 * Get all prompt templates
 * @route GET /api/prompts
 */
exports.getAllPrompts = async (req, res) => {
  try {
    const prompts = await promptManager.getAllPromptTemplates();
    res.json(prompts);
  } catch (err) {
    logger.error(`Error fetching prompts: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching prompts' });
  }
};

/**
 * Get prompt template by name
 * @route GET /api/prompts/:name
 */
exports.getPromptByName = async (req, res) => {
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
};

/**
 * Get specific version of prompt template
 * @route GET /api/prompts/:name/:version
 */
exports.getPromptVersion = async (req, res) => {
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
};

/**
 * Create new prompt template
 * @route POST /api/prompts
 */
exports.createPrompt = async (req, res) => {
  try {
    const templateData = req.body;
    const newTemplate = await promptManager.createPromptTemplate(templateData);
    res.status(201).json(newTemplate);
  } catch (err) {
    logger.error(`Error creating prompt: ${err.message}`);
    res.status(500).json({ message: 'Server error creating prompt' });
  }
};

/**
 * Update prompt template
 * @route PUT /api/prompts/:name/:version
 */
exports.updatePrompt = async (req, res) => {
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
};

/**
 * Get versions of a prompt template
 * @route GET /api/prompts/:name/versions
 */
exports.getPromptVersions = async (req, res) => {
  try {
    const { name } = req.params;
    const versions = await promptManager.getPromptVersions(name);
    res.json(versions);
  } catch (err) {
    logger.error(`Error fetching prompt versions: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching versions' });
  }
};

/**
 * Compare two versions of a prompt template
 * @route GET /api/prompts/:name/compare/:oldVersion/:newVersion
 */
exports.compareVersions = async (req, res) => {
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
};

/**
 * Test prompt template with variables
 * @route POST /api/prompts/test
 */
exports.testPrompt = async (req, res) => {
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
};

/**
 * Get prompt performance metrics
 * @route GET /api/prompts/performance
 */
exports.getPerformanceMetrics = async (req, res) => {
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
};

/**
 * Get all prompt components
 * @route GET /api/prompts/components
 */
exports.getPromptComponents = async (req, res) => {
  try {
    const { category } = req.query;
    const components = await promptManager.getPromptComponents(category);
    res.json(components);
  } catch (err) {
    logger.error(`Error fetching prompt components: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching components' });
  }
};

/**
 * Create prompt component
 * @route POST /api/prompts/components
 */
exports.createPromptComponent = async (req, res) => {
  try {
    const componentData = req.body;
    const newComponent = await promptManager.createPromptComponent(componentData);
    res.status(201).json(newComponent);
  } catch (err) {
    logger.error(`Error creating prompt component: ${err.message}`);
    res.status(500).json({ message: 'Server error creating component' });
  }
};

/**
 * Update prompt component
 * @route PUT /api/prompts/components/:id
 */
exports.updatePromptComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedComponent = await promptManager.updatePromptComponent(id, updateData);
    res.json(updatedComponent);
  } catch (err) {
    logger.error(`Error updating prompt component: ${err.message}`);
    res.status(500).json({ message: 'Server error updating component' });
  }
};

/**
 * Delete prompt component
 * @route DELETE /api/prompts/components/:id
 */
exports.deletePromptComponent = async (req, res) => {
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
};