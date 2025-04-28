// server/src/api/support.js
/**
 * Support Conversation API Routes
 * Handles persistent conversation tracking with support IDs,
 * specialized workflows for bug fixes, library upgrades, and code reviews.
 */
const express = require('express');
const router = express.Router();
const { supportConversationService } = require('../services');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/support
 * @desc    Create a new support conversation
 * @access  Private
 */
router.post('/', auth.authenticate, async (req, res) => {
  try {
    const { projectId, title, category } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!projectId || !title) {
      return res.status(400).json({ message: 'Project ID and title are required' });
    }
    
    // Create conversation
    const conversation = await supportConversationService.createConversation(
      projectId, 
      userId, 
      title, 
      category || 'general'
    );
    
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating support conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/support/:supportId
 * @desc    Get a support conversation
 * @access  Private
 */
router.get('/:supportId', auth.authenticate, async (req, res) => {
  try {
    const supportId = req.params.supportId;
    
    // Get conversation
    const conversation = await supportConversationService.getConversation(supportId);
    
    // Check if user has access to this conversation
    if (conversation.userId.toString() !== req.user.id.toString() && 
        !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Error getting support conversation:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: 'Support conversation not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/support/project/:projectId
 * @desc    Get all support conversations for a project
 * @access  Private
 */
router.get('/project/:projectId', auth.projectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Filter options
    const options = {};
    
    if (req.query.status) {
      options.status = req.query.status;
    }
    
    if (req.query.category) {
      options.category = req.query.category;
    }
    
    // Get conversations
    const conversations = await supportConversationService.getProjectConversations(
      projectId, 
      options
    );
    
    res.json(conversations);
  } catch (error) {
    console.error('Error getting project support conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/support/:supportId/message
 * @desc    Add a user message to a support conversation
 * @access  Private
 */
router.post('/:supportId/message', auth.authenticate, async (req, res) => {
  try {
    const supportId = req.params.supportId;
    const { content } = req.body;
    
    // Validate content
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Get conversation first to check access
    const conversation = await supportConversationService.getConversation(supportId);
    
    // Check if user has access to this conversation
    if (conversation.userId.toString() !== req.user.id.toString() && 
        !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Add message
    await supportConversationService.addUserMessage(supportId, content);
    
    // Generate AI response
    const aiResponse = await supportConversationService.generateAIResponse(supportId);
    
    // Get updated conversation
    const updatedConversation = await supportConversationService.getConversation(supportId);
    
    res.json(updatedConversation);
  } catch (error) {
    console.error('Error adding message to support conversation:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: 'Support conversation not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PATCH /api/support/:supportId/status
 * @desc    Update the status of a support conversation
 * @access  Private
 */
router.patch('/:supportId/status', auth.authenticate, async (req, res) => {
  try {
    const supportId = req.params.supportId;
    const { status } = req.body;
    
    // Validate status
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Get conversation first to check access
    const conversation = await supportConversationService.getConversation(supportId);
    
    // Check if user has access to this conversation
    if (conversation.userId.toString() !== req.user.id.toString() && 
        !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update status
    const updatedConversation = await supportConversationService.updateStatus(
      supportId, 
      status
    );
    
    res.json(updatedConversation);
  } catch (error) {
    console.error('Error updating support conversation status:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: 'Support conversation not found' });
    }
    
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/support/:supportId/system-message
 * @desc    Add a system message to a support conversation (admin only)
 * @access  Private (Admin only)
 */
router.post('/:supportId/system-message', auth.adminOnly, async (req, res) => {
  try {
    const supportId = req.params.supportId;
    const { category } = req.body;
    
    // Add system message
    await supportConversationService.addSystemMessage(supportId, category || 'general');
    
    // Get updated conversation
    const updatedConversation = await supportConversationService.getConversation(supportId);
    
    res.json(updatedConversation);
  } catch (error) {
    console.error('Error adding system message to support conversation:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: 'Support conversation not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;