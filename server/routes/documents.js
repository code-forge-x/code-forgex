const express = require('express');
const { check } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDocuments,
  uploadDocument,
  deleteDocument
} = require('../controllers/documentController');
const fileUpload = require('express-fileupload');

const router = express.Router();

// Enable file upload
router.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
}));

// Validation middleware
const validateDocument = [
  check('name', 'Name is required').not().isEmpty(),
  check('type', 'Type is required').isIn(['blueprint', 'specification', 'requirements', 'other'])
];

// All routes require authentication and admin role
router.use(authenticate, authorize(['admin']));

// Get all documents
router.get('/', getDocuments);

// Upload a document
router.post('/', validateDocument, uploadDocument);

// Delete a document
router.delete('/:id', deleteDocument);

module.exports = router; 