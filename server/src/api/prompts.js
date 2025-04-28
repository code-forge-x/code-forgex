// server/src/api/prompts.js
const express = require('express');
const router = express.Router();
const { promptManager } = require('../services');
const auth = require('../middleware/auth');
const { Prompt } = require('../models');

/**
 * @route   GET /api/prompts
 * @desc    Get all global prompt templates
 * @access  Private (Admin only)
 */
router.get('/', auth.adminOnly, async (req, res) => {
  try {
    // Filter options
    const category = req.query.category;
    const active = req.query.active === 'true' ? true : undefined;
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (active !== undefined) query.active = active;
    
    // Fetch prompts from database
    const prompts = await Prompt.find(query)
      .sort({ name: 1, version: -1 });
      
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/prompts/:name
 * @desc    Get prompt template by name (latest version)
 * @access  Private (Admin only)
 */
router.get('/:name', auth.adminOnly, async (req, res) => {
  try {
    const prompt = await promptManager.getPromptTemplate(req.params.name);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    
    res.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/prompts/:name/:version
 * @desc    Get specific version of a prompt template
 * @access  Private (Admin only)
 */
router.get('/:name/:version', auth.adminOnly, async (req, res) => {
  try {
    const version = parseInt(req.params.version);
    
    if (isNaN(version)) {
      return res.status(400).json({ message: 'Invalid version number' });
    }
    
    const prompt = await promptManager.getPromptTemplate(req.params.name, version);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    
    res.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt version:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/prompts
 * @desc    Create a new prompt template
 * @access  Private (Admin only)
 */
router.post('/', auth.adminOnly, async (req, res) => {
  try {
    const { name, content, category, active } = req.body;
    
    // Validate required fields
    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }
    
    // Create new prompt template
    const promptData = {
      name,
      content,
      category: category || 'general',
      active: active !== undefined ? active : true
    };
    
    const newPrompt = await promptManager.createPromptTemplate(promptData);
    
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/prompts/:name/:version
 * @desc    Update a prompt template
 * @access  Private (Admin only)
 */
router.put('/:name/:version', auth.adminOnly, async (req, res) => {
  try {
    const name = req.params.name;
    const version = parseInt(req.params.version);
    const { content, active, category } = req.body;
    
    if (isNaN(version)) {
      return res.status(400).json({ message: 'Invalid version number' });
    }
    
    // Update prompt
    const promptData = {};
    if (content !== undefined) promptData.content = content;
    if (active !== undefined) promptData.active = active;
    if (category !== undefined) promptData.category = category;
    
    const updatedPrompt = await promptManager.updatePromptTemplate(name, version, promptData);
    
    if (!updatedPrompt) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    
    res.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/prompts/components
 * @desc    Get all prompt components
 * @access  Private (Admin only)
 */
router.get('/components', auth.adminOnly, async (req, res) => {
  try {
    const category = req.query.category;
    const components = await promptManager.getPromptComponents(category);
    
    res.json(components);
  } catch (error) {
    console.error('Error fetching prompt components:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/prompts/components
 * @desc    Create a new prompt component
 * @access  Private (Admin only)
 */
router.post('/components', auth.adminOnly, async (req, res) => {
  try {
    const { name, content, category, description } = req.body;
    
    // Validate required fields
    if (!name || !content || !category) {
      return res.status(400).json({ 
        message: 'Name, content, and category are required' 
      });
    }
    
    // Create component
    const componentData = {
      name,
      content,
      category,
      description: description || ''
    };
    
    const newComponent = await promptManager.createPromptComponent(componentData);
    
    res.status(201).json(newComponent);
  } catch (error) {
    console.error('Error creating prompt component:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/prompts/performance
 * @desc    Get prompt performance statistics
 * @access  Private (Admin only)
 */
router.get('/performance', auth.adminOnly, async (req, res) => {
  try {
    const { templateId, startDate, endDate, limit } = req.query;
    
    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    if (limit) options.limit = parseInt(limit);
    
    const stats = await promptManager.getPerformanceStats(templateId, options);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/prompts/project/:projectId
 * @desc    Get all project-specific prompts
 * @access  Private
 */
router.get('/project/:projectId', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Fetch project prompts from database
    const projectPrompts = await require('../models/ProjectPrompt')
      .find({ projectId })
      .sort({ name: 1, version: -1 });
      
    res.json(projectPrompts);
  } catch (error) {
    console.error('Error fetching project prompts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/prompts/project/:projectId
 * @desc    Create a project-specific prompt
 * @access  Private
 */
router.post('/project/:projectId', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { name, content, basedOn } = req.body;
    
    // Validate required fields
    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }
    
    // Create project prompt
    const promptData = {
      name,
      content,
      basedOn
    };
    
    const newPrompt = await promptManager.createProjectPrompt(projectId, promptData);
    
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating project prompt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;