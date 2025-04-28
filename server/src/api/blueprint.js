// server/src/api/blueprint.js
/**
 * Blueprint API Routes
 * Handles blueprint generation, file extraction, and component analysis
 * Part of the self-building system MVP
 */
const express = require('express');
const router = express.Router({ mergeParams: true }); // To access projectId from parent router
const { simpleBlueprintService, basicExtractionService } = require('../services');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// Set up file upload
const upload = multer({ 
  dest: path.join(os.tmpdir(), 'blueprint-uploads'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 50 // Max 50 files
  }
});

/**
 * @route   POST /api/projects/:projectId/blueprint/generate
 * @desc    Generate a blueprint from uploaded code files
 * @access  Private
 */
router.post('/generate', auth.projectAccess, upload.array('files'), async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    // Create temp directory for extraction
    const extractionDir = path.join(os.tmpdir(), `blueprint-${projectId}-${Date.now()}`);
    await fs.mkdir(extractionDir, { recursive: true });
    
    // Move uploaded files to extraction directory
    for (const file of files) {
      const destPath = path.join(extractionDir, file.originalname);
      await fs.rename(file.path, destPath);
    }
    
    // Generate blueprint
    const blueprint = await simpleBlueprintService.generateBlueprintFromDirectory(
      projectId,
      extractionDir
    );
    
    // Clean up temp directory
    setTimeout(async () => {
      try {
        await fs.rm(extractionDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Error cleaning up temp directory:', err);
      }
    }, 60000); // Clean up after 1 minute
    
    res.json(blueprint);
  } catch (error) {
    console.error('Error generating blueprint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects/:projectId/blueprint/analyze
 * @desc    Analyze a single file and extract information
 * @access  Private
 */
router.post('/analyze', auth.projectAccess, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Extract from file
    const extractedInfo = await basicExtractionService.extractFromFile(file.path);
    
    // Clean up temp file
    setTimeout(async () => {
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.error('Error cleaning up temp file:', err);
      }
    }, 10000); // Clean up after 10 seconds
    
    res.json(extractedInfo);
  } catch (error) {
    console.error('Error analyzing file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/projects/:projectId/blueprint
 * @desc    Get the latest blueprint for a project
 * @access  Private
 */
router.get('/', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // In a full implementation, we would retrieve the saved blueprint from a database
    // For MVP, we'll return a mock response
    // TODO: Implement blueprint storage and retrieval in Phase 4
    
    // Mock blueprint structure to match the guide's requirements
    const mockBlueprint = {
      projectId,
      components: [
        { name: 'Example', file: 'Example.jsx', type: 'ui', language: 'javascript' }
      ],
      services: [
        { name: 'ExampleService', file: 'exampleService.js', type: 'service', methods: ['get', 'update'], language: 'javascript' }
      ],
      models: [
        { name: 'ExampleModel', file: 'ExampleModel.js', type: 'mongoose', fields: ['name', 'content'], language: 'javascript' }
      ],
      apis: [
        { name: 'ExampleAPI', file: 'exampleApi.js', type: 'express', endpoints: ['/api/example'], language: 'javascript' }
      ],
      relationships: [
        { from: 'Example', to: 'ExampleService', type: 'uses' }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.json(mockBlueprint);
  } catch (error) {
    console.error('Error getting blueprint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects/:projectId/blueprint
 * @desc    Save a blueprint
 * @access  Private
 */
router.post('/', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const blueprint = req.body;
    
    if (!blueprint) {
      return res.status(400).json({ message: 'Blueprint data is required' });
    }
    
    // TODO: Implement blueprint storage
    // For MVP, we'll just return the blueprint with a success message
    
    res.json({
      message: 'Blueprint saved successfully',
      projectId,
      blueprint
    });
  } catch (error) {
    console.error('Error saving blueprint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects/:projectId/blueprint/extract
 * @desc    Extract components from a blueprint
 * @access  Private
 */
router.post('/extract', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { blueprint } = req.body;
    
    if (!blueprint) {
      return res.status(400).json({ message: 'Blueprint data is required' });
    }
    
    // Extract components from blueprint
    // For MVP, we'll just return the components from the blueprint
    
    res.json({
      components: blueprint.components || [],
      services: blueprint.services || [],
      models: blueprint.models || [],
      apis: blueprint.apis || []
    });
  } catch (error) {
    console.error('Error extracting from blueprint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;