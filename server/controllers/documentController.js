const Document = require('../models/Document');
const { asyncHandler } = require('../middleware/async');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

// @desc    Get all documents
// @route   GET /api/admin/documents
// @access  Private/Admin
exports.getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find()
    .populate('uploadedBy', 'username email')
    .sort('-uploadedAt');

  res.status(200).json({
    success: true,
    count: documents.length,
    data: documents
  });
});

// @desc    Upload a document
// @route   POST /api/admin/documents
// @access  Private/Admin
exports.uploadDocument = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file'
    });
  }

  const file = req.files.file;
  const { name, type } = req.body;

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, '../../uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const filePath = path.join(uploadDir, filename);

  // Save file
  await file.mv(filePath);

  // Generate fingerprint
  const fileBuffer = await fs.readFile(filePath);
  const fingerprint = await Document.generateFingerprint(fileBuffer);

  // Create document record
  const document = await Document.create({
    name: name || file.name,
    type,
    fingerprint,
    filePath,
    metadata: {
      size: file.size,
      mimeType: file.mimetype,
      encoding: file.encoding
    },
    uploadedBy: req.user.id
  });

  // Process document in background
  processDocument(document).catch(err => {
    logger.error('Error processing document:', err);
    document.status = 'error';
    document.error = {
      message: err.message,
      stack: err.stack
    };
    document.save();
  });

  res.status(201).json({
    success: true,
    data: document
  });
});

// @desc    Delete a document
// @route   DELETE /api/admin/documents/:id
// @access  Private/Admin
exports.deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Delete file
  try {
    await fs.unlink(document.filePath);
  } catch (err) {
    logger.error('Error deleting file:', err);
  }

  // Delete document record
  await document.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Background processing function
async function processDocument(document) {
  try {
    document.status = 'processing';
    await document.save();

    // TODO: Implement document processing logic
    // This could include:
    // - Text extraction
    // - Content analysis
    // - Metadata extraction
    // - Indexing for search
    // - etc.

    document.status = 'processed';
    document.processedAt = new Date();
    await document.save();

    logger.info(`Document ${document._id} processed successfully`);
  } catch (err) {
    logger.error(`Error processing document ${document._id}:`, err);
    throw err;
  }
} 