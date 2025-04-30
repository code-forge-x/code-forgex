const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt
} = require('../controllers/promptController');

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// Get all prompts
router.get('/', getPrompts);

// Create a new prompt
router.post('/', createPrompt);

// Update a prompt
router.put('/:id', updatePrompt);

// Delete a prompt
router.delete('/:id', deletePrompt);

module.exports = router; 