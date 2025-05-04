const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateTemplate } = require('../middleware/validation');

// Public routes
router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplate);
router.get('/:id/versions', templateController.getTemplateVersions);
router.get('/:id/versions/:version', templateController.getTemplateVersion);

// Protected routes
router.post('/', 
  authenticate, 
  authorize(['admin', 'developer']), 
  validateTemplate, 
  templateController.createTemplate
);

router.put('/:id', 
  authenticate, 
  authorize(['admin', 'developer']), 
  validateTemplate, 
  templateController.updateTemplate
);

router.delete('/:id', 
  authenticate, 
  authorize(['admin', 'developer']), 
  templateController.deleteTemplate
);

router.post('/:id/generate', 
  authenticate, 
  templateController.generateCode
);

module.exports = router; 