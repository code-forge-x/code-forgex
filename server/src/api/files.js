const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const logger = require('../utils/logger');
const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.projectId;
    const dir = path.join(__dirname, '../../uploads', projectId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate safe filename
    const filename = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '_');
    
    cb(null, `${Date.now()}-${filename}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|json|csv|xlsx|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.test(ext.substring(1))) {
      return cb(null, true);
    }
    
    cb(new Error('Invalid file type. Only images, PDFs, and text files are allowed.'));
  }
});

// Upload file to project
router.post('/:projectId/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const projectId = req.params.projectId;
    
    // Validate project ID format
    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    
    // Check if project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    });
    
    if (!project) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Project not found or access denied' });
    }
    
    // Create file entry in project
    project.files.push({
      name: req.file.originalname,
      path: req.file.path.replace(/\\/g, '/'), // Normalize path for all OS
      size: req.file.size,
      type: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: Date.now()
    });
    
    await project.save();
    
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        url: `/api/files/${projectId}/download/${project.files[project.files.length - 1]._id}`
      }
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all files for a project
router.get('/:projectId', auth, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Check if project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }
    
    // Return file list with download URLs
    const files = project.files.map(file => ({
      id: file._id,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: file.uploadedAt,
      url: `/api/files/${projectId}/download/${file._id}`
    }));
    
    res.json(files);
  } catch (error) {
    logger.error('Get files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download file
router.get('/:projectId/download/:fileId', auth, async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    
    // Check if project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }
    
    // Find file in project
    const file = project.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Send file
    res.download(file.path, file.name);
  } catch (error) {
    logger.error('File download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete file
router.delete('/:projectId/:fileId', auth, async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    
    // Check if project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }
    
    // Find file in project
    const file = project.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    // Remove file entry from project
    project.files.pull(fileId);
    await project.save();
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('File delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
