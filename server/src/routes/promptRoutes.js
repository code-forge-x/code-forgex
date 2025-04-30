const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const promptController = require('../controllers/promptController');
const auth = require('../middleware/auth');

// Validation middleware
const promptValidation = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),
  check('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .withMessage('Content must be a string'),
  check('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  check('variables')
    .optional()
    .isArray()
    .withMessage('Variables must be an array'),
  check('variables.*.name')
    .optional()
    .isString()
    .withMessage('Variable name must be a string'),
  check('variables.*.description')
    .optional()
    .isString()
    .withMessage('Variable description must be a string'),
  check('variables.*.required')
    .optional()
    .isBoolean()
    .withMessage('Variable required flag must be a boolean'),
  check('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  check('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  check('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
];

// Test prompt validation
const testPromptValidation = [
  check('variables')
    .isObject()
    .withMessage('Variables must be an object')
];

// Routes
router.get('/', auth, promptController.getAllPrompts);
router.get('/:name', auth, promptController.getPromptByName);
router.post('/', [auth, promptValidation], promptController.createPrompt);
router.put('/:name', [auth, promptValidation], promptController.updatePrompt);
router.delete('/:name', auth, promptController.deletePrompt);
router.get('/:name/versions', auth, promptController.getPromptVersions);
router.post('/:name/test', [auth, testPromptValidation], promptController.testPrompt);
router.get('/metrics/all', auth, promptController.getPromptMetrics);

module.exports = router; 