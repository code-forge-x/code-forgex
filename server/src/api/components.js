const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams allows access to projectId param
const auth = require('../middleware/auth');

/**
 * Component Routes
 * Handles project component management
 */

// @route    GET /api/projects/:projectId/components
// @desc     Get all project components
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // For now, return mock components
    // Later, implement logic to fetch actual components
    res.json([
      {
        id: 'comp-1',
        name: 'Authentication Service',
        type: 'service',
        status: 'completed',
        files: []
      },
      {
        id: 'comp-2',
        name: 'User Management',
        type: 'service',
        status: 'pending',
        files: []
      }
    ]);
  } catch (err) {
    console.error(`Error fetching components: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route    GET /api/projects/:projectId/components/:componentId
// @desc     Get specific component details
// @access   Private
router.get('/:componentId', auth, async (req, res) => {
  try {
    const { projectId, componentId } = req.params;
    
    // For now, return a mock component
    // Later, implement logic to fetch specific component
    res.json({
      id: componentId,
      projectId,
      name: 'Component Details',
      type: 'service',
      status: 'in_progress',
      description: 'This is a mock component for development',
      files: [
        {
          name: 'index.js',
          path: '/src/services/',
          content: '// Sample code\nconsole.log("Hello World");',
          language: 'javascript'
        }
      ],
      dependencies: [],
      version: 1,
      created: new Date(),
      updated: new Date()
    });
  } catch (err) {
    console.error(`Error fetching component: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route    POST /api/projects/:projectId/components
// @desc     Generate new component
// @access   Private
router.post('/', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, type, description } = req.body;
    
    // For now, return a mock response
    // Later, implement actual component generation
    res.status(201).json({
      id: `component-${Date.now()}`,
      projectId,
      name: name || 'New Component',
      type: type || 'service',
      description: description || 'Auto-generated component',
      status: 'pending',
      files: [],
      dependencies: [],
      version: 1,
      created: new Date(),
      updated: new Date()
    });
  } catch (err) {
    console.error(`Error generating component: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route    PUT /api/projects/:projectId/components/:componentId
// @desc     Update component code
// @access   Private
router.put('/:componentId', auth, async (req, res) => {
  try {
    const { projectId, componentId } = req.params;
    const updateData = req.body;
    
    // For now, return the updated component as received
    // Later, implement actual update logic
    res.json({
      id: componentId,
      projectId,
      ...updateData,
      updated: new Date()
    });
  } catch (err) {
    console.error(`Error updating component: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route    GET /api/projects/:projectId/components/next
// @desc     Get next component to generate
// @access   Private
router.get('/next', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // For now, return a mock next component
    // Later, implement actual dependency resolution
    res.json({
      id: null, // Null ID indicates a new component to be created
      projectId,
      name: 'Next Component',
      type: 'service',
      description: 'This is the next component to be generated based on dependencies',
      dependencies: []
    });
  } catch (err) {
    console.error(`Error determining next component: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route    POST /api/projects/:projectId/components/:componentId/validate
// @desc     Validate component code
// @access   Private
router.post('/:componentId/validate', auth, async (req, res) => {
  try {
    const { projectId, componentId } = req.params;
    const { testCase } = req.body;
    
    // For now, return mock validation results
    // Later, implement actual validation logic
    res.json({
      valid: true,
      issues: [],
      componentId,
      projectId,
      testCase,
      validatedAt: new Date()
    });
  } catch (err) {
    console.error(`Error validating component: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;