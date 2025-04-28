// server/src/api/chat.js
const express = require('express');
const router = express.Router();
const chatService = require('../services/chat/chatService');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/chat/requirements
 * @desc    Process requirements chat message
 * @access  Private
 */
router.post('/requirements', auth.authenticate, async (req, res) => {
  try {
    const { projectId, message } = req.body;
    const userId = req.user.id;
    
    if (!projectId || !message) {
      return res.status(400).json({ message: 'Project ID and message are required' });
    }
    
    const result = await chatService.processRequirements(projectId, message, userId);
    res.json(result);
  } catch (error) {
    console.error('Error processing requirements message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/chat/blueprint
 * @desc    Process blueprint chat message
 * @access  Private
 */
router.post('/blueprint', auth.authenticate, async (req, res) => {
  try {
    const { projectId, message } = req.body;
    const userId = req.user.id;
    
    if (!projectId || !message) {
      return res.status(400).json({ message: 'Project ID and message are required' });
    }
    
    const result = await chatService.processBlueprint(projectId, message, userId);
    res.json(result);
  } catch (error) {
    console.error('Error processing blueprint message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/chat/component
 * @desc    Process component chat message
 * @access  Private
 */
router.post('/component', auth.authenticate, async (req, res) => {
  try {
    const { projectId, message } = req.body;
    const userId = req.user.id;
    
    if (!projectId || !message) {
      return res.status(400).json({ message: 'Project ID and message are required' });
    }
    
    const result = await chatService.processComponent(projectId, message, userId);
    res.json(result);
  } catch (error) {
    console.error('Error processing component message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/chat/support
 * @desc    Process support chat message
 * @access  Private
 */
router.post('/support', auth.authenticate, async (req, res) => {
  try {
    const { projectId, message } = req.body;
    const userId = req.user.id;
    
    if (!projectId || !message) {
      return res.status(400).json({ message: 'Project ID and message are required' });
    }
    
    const result = await chatService.processSupport(projectId, message, userId);
    res.json(result);
  } catch (error) {
    console.error('Error processing support message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/chat/message
 * @desc    Process generic chat message - detects phase automatically
 * @access  Private
 */
router.post('/message', auth.authenticate, async (req, res) => {
  try {
    const { projectId, message } = req.body;
    const userId = req.user.id;
    
    if (!projectId || !message) {
      return res.status(400).json({ message: 'Project ID and message are required' });
    }
    
    const result = await chatService.processMessage(projectId, message, userId);
    res.json(result);
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// For testing/debugging without authentication
router.post('/test', async (req, res) => {
  try {
    const { projectId, message, userId } = req.body;
    
    if (!projectId || !message || !userId) {
      return res.status(400).json({ 
        message: 'Project ID, message, and user ID are required' 
      });
    }
    
    const result = await chatService.processMessage(projectId, message, userId);
    res.json(result);
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;