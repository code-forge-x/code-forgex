const express = require('express');
const auth = require('../middleware/auth');
const techSupportService = require('../services/techsupport/techSupportService');
const logger = require('../utils/logger');
const router = express.Router();

// Create new tech support session
router.post('/sessions', auth, async (req, res) => {
  try {
    const { projectId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    const session = await techSupportService.createSession(req.user.id, projectId);
    res.json(session);
  } catch (error) {
    logger.error('Create tech support session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's active sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await techSupportService.getUserSessions(req.user.id);
    res.json(sessions);
  } catch (error) {
    logger.error('Get tech support sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single session by ID
router.get('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await techSupportService.getSession(req.params.id, req.user.id);
    res.json(session);
  } catch (error) {
    logger.error('Get tech support session error:', error);
    
    if (error.message.includes('not found or not authorized')) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message in session
router.post('/sessions/:id/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    const response = await techSupportService.sendMessage(
      req.params.id,
      req.user.id,
      message
    );
    
    res.json(response);
  } catch (error) {
    logger.error('Send tech support message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Close session
router.put('/sessions/:id/close', auth, async (req, res) => {
  try {
    const result = await techSupportService.closeSession(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Close tech support session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
