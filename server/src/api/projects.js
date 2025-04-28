const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth'); // 
const logger = require('../utils/logger');
const router = express.Router();

// Create project
router.post('/', auth.authenticate, async (req, res) => {
  try {
    const { name, description, requirements, financialDomain, tradingVenue, techStack } = req.body;
    
    const project = new Project({
      name,
      description,
      requirements,
      financialDomain,
      tradingVenue: tradingVenue || 'multi_asset',
      techStack,
      owner: req.user.id
    });
    
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all projects for user
router.get('/', auth.authenticate, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    logger.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by id
router.get('/:id', auth.authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns the project
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(project);
  } catch (error) {
    logger.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;