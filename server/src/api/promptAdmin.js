const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const PromptTemplate = require('../models/PromptTemplate');
const PromptComponent = require('../models/PromptComponent');
const logger = require('../utils/logger');
const router = express.Router();

// Get all templates
router.get('/templates', adminAuth, async (req, res) => {
  try {
    const templates = await PromptTemplate.find().sort({ name: 1, version: -1 });
    res.json(templates);
  } catch (error) {
    logger.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all components
router.get('/components', adminAuth, async (req, res) => {
  try {
    const components = await PromptComponent.find().sort({ name: 1 });
    res.json(components);
  } catch (error) {
    logger.error('Get components error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create template
router.post('/templates', adminAuth, async (req, res) => {
  try {
    const { name, description, category, content, tags } = req.body;
    
    // Check if template exists
    const existingTemplate = await PromptTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({ message: 'Template name already exists' });
    }
    
    // Create template
    const template = new PromptTemplate({
      name,
      description,
      category,
      content,
      tags: tags || [],
      version: 1,
      active: true,
      createdBy: req.user.name || req.user.id
    });
    
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    logger.error('Create template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create component
router.post('/components', adminAuth, async (req, res) => {
  try {
    const { name, description, category, content, tags } = req.body;
    
    // Check if component exists
    const existingComponent = await PromptComponent.findOne({ name });
    if (existingComponent) {
      return res.status(400).json({ message: 'Component name already exists' });
    }
    
    // Create component
    const component = new PromptComponent({
      name,
      description,
      category,
      content,
      tags: tags || [],
      version: 1,
      active: true,
      createdBy: req.user.name || req.user.id
    });
    
    await component.save();
    res.status(201).json(component);
  } catch (error) {
    logger.error('Create component error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update template
router.put('/templates/:id', adminAuth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const template = await PromptTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    template.content = content;
    await template.save();
    
    res.json(template);
  } catch (error) {
    logger.error('Update template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
