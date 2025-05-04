const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const promptController = require('../controllers/promptController');

// Apply authentication middleware to all routes
router.use(authenticate);

// Define routes
router.get('/', promptController.getAllPrompts);
router.get('/:id', promptController.getPromptById);
router.post('/', promptController.createPrompt);
router.put('/:id', promptController.updatePrompt);
router.delete('/:id', promptController.deletePrompt);

module.exports = router;