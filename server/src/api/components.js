// server/src/api/components.js
/**
 * Components API Routes
 * Handles component generation, saving, and approval workflow
 * Part of the self-building system MVP
 */
const express = require('express');
const router = express.Router({ mergeParams: true }); // To access projectId from parent router
const { simpleComponentService } = require('../services');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// Set up file upload
const upload = multer({ 
  dest: path.join(os.tmpdir(), 'component-uploads'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files
  }
});

/**
 * @route   POST /api/projects/:projectId/components/generate
 * @desc    Generate a component
 * @access  Private
 */
router.post('/generate', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const componentData = req.body;
    
    if (!componentData || !componentData.name || !componentData.type || !componentData.framework) {
      return res.status(400).json({ 
        message: 'Component name, type, and framework are required' 
      });
    }
    
    // Generate component
    const component = await simpleComponentService.generateComponent(
      projectId,
      componentData
    );
    
    res.json(component);
  } catch (error) {
    console.error('Error generating component:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects/:projectId/components/generate-multiple
 * @desc    Generate multiple related components
 * @access  Private
 */
router.post('/generate-multiple', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { components, fromBlueprint } = req.body;
    
    if (!components || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ message: 'Components array is required' });
    }
    
    // Validate each component
    for (const comp of components) {
      if (!comp.name || !comp.type || !comp.framework) {
        return res.status(400).json({ 
          message: 'Each component must have a name, type, and framework' 
        });
      }
    }
    
    // If generating from a blueprint, log this info
    if (fromBlueprint) {
      console.log(`Generating components from blueprint for project ${projectId}`);
    }
    
    // Generate components
    const generatedComponents = await simpleComponentService.generateRelatedComponents(
      projectId,
      components
    );
    
    // If this was a blueprint-based generation, implement the approval workflow
    if (fromBlueprint) {
      await simpleComponentService.implementApprovalWorkflow(
        projectId,
        generatedComponents
      );
    }
    
    res.json(generatedComponents);
  } catch (error) {
    console.error('Error generating components:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects/:projectId/components/save
 * @desc    Save generated components to files
 * @access  Private
 */
router.post('/save', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { components, outputDir } = req.body;
    
    if (!components || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ message: 'Components array is required' });
    }
    
    if (!outputDir) {
      return res.status(400).json({ message: 'Output directory is required' });
    }
    
    // Save components
    const results = [];
    
    for (const component of components) {
      try {
        const filePath = await simpleComponentService.saveComponent(outputDir, component);
        results.push({
          name: component.name,
          success: true,
          filePath
        });
      } catch (err) {
        results.push({
          name: component.name,
          success: false,
          error: err.message
        });
      }
    }
    
    res.json({
      message: 'Components saved',
      results
    });
  } catch (error) {
    console.error('Error saving components:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects/:projectId/components/approval
 * @desc    Implement approval workflow for generated components
 * @access  Private
 */
router.post('/approval', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { components } = req.body;
    
    if (!components || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ message: 'Components array is required' });
    }
    
    // Implement approval workflow
    const result = await simpleComponentService.implementApprovalWorkflow(
      projectId,
      components
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error implementing approval workflow:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects/:projectId/components/upload
 * @desc    Upload a component file
 * @access  Private
 */
router.post('/upload', auth.projectAccess, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { componentName, componentType, framework } = req.body;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Read file content
    const content = await fs.readFile(file.path, 'utf8');
    
    // Create component object
    const component = {
      name: componentName || path.basename(file.originalname, path.extname(file.originalname)),
      type: componentType || 'ui',
      framework: framework || 'react',
      code: content,
      createdAt: new Date(),
      generatedBy: 'upload'
    };
    
    // Clean up temp file
    setTimeout(async () => {
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.error('Error cleaning up temp file:', err);
      }
    }, 10000); // Clean up after 10 seconds
    
    res.json(component);
  } catch (error) {
    console.error('Error uploading component:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;