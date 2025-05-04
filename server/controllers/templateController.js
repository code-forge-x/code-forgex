const Template = require('../models/Template');
const { asyncHandler } = require('../middleware/async');
const logger = require('../utils/logger');

// @desc    Create a new template
// @route   POST /api/templates
// @access  Private
exports.createTemplate = asyncHandler(async (req, res) => {
  const {
    templateId,
    name,
    description,
    version,
    category,
    roles,
    content,
    parameters,
    dependencies,
    isPublic,
    metadata
  } = req.body;

  // Check if template with same ID exists
  const existingTemplate = await Template.findOne({ templateId });
  if (existingTemplate) {
    return res.status(400).json({
      success: false,
      message: 'Template with this ID already exists'
    });
  }

  const template = await Template.create({
    templateId,
    name,
    description,
    version,
    category,
    roles,
    content,
    parameters,
    dependencies,
    author: req.user.id,
    isPublic,
    metadata
  });

  // Add initial version history
  await template.createVersion({
    version,
    changes: 'Initial version',
    status: 'published'
  }, req.user.id);

  logger.info(`Template created: ${templateId} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    data: template
  });
});

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public/Private
exports.getTemplates = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const query = {};

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by role
  if (req.query.role) {
    query.roles = req.query.role;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by author
  if (req.query.author) {
    query.author = req.query.author;
  }

  // Filter by search term
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { templateId: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // If not admin, only show public templates or user's own templates
  if (req.user.role !== 'admin') {
    query.$or = [
      { isPublic: true },
      { author: req.user.id }
    ];
  }

  const result = await Template.getTemplates(query, page, limit);

  res.status(200).json({
    success: true,
    ...result
  });
});

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Public/Private
exports.getTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id)
    .populate('author', 'name email')
    .populate('dependencies', 'templateId name version');

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }

  // Check if user has access
  if (!template.isPublic && template.author._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this template'
    });
  }

  res.status(200).json({
    success: true,
    data: template
  });
});

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private
exports.updateTemplate = asyncHandler(async (req, res) => {
  let template = await Template.findById(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }

  // Check if user has permission to update
  if (template.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this template'
    });
  }

  // Create new version if content, parameters, or dependencies changed
  if (req.body.content || req.body.parameters || req.body.dependencies) {
    await template.createVersion({
      version: req.body.version || template.version,
      changes: req.body.changes || 'Updated template',
      status: req.body.status || template.status
    }, req.user.id);
  }

  // Update template fields
  template = await Template.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  logger.info(`Template updated: ${template.templateId} by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    data: template
  });
});

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private
exports.deleteTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }

  // Check if user has permission to delete
  if (template.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this template'
    });
  }

  await template.remove();

  logger.info(`Template deleted: ${template.templateId} by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get template versions
// @route   GET /api/templates/:id/versions
// @access  Private
exports.getTemplateVersions = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }

  // Check if user has access
  if (!template.isPublic && template.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this template'
    });
  }

  res.status(200).json({
    success: true,
    data: template.versionHistory
  });
});

// @desc    Update template performance metrics
// @route   PUT /api/templates/:id/metrics
// @access  Private
exports.updateTemplateMetrics = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template not found'
    });
  }

  // Check if user has permission to update metrics
  if (template.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this template'
    });
  }

  const { successRate, tokenEfficiency, avgResponseTime, userSatisfaction } = req.body;

  template.performanceMetrics = {
    successRate: successRate ?? template.performanceMetrics.successRate,
    tokenEfficiency: tokenEfficiency ?? template.performanceMetrics.tokenEfficiency,
    avgResponseTime: avgResponseTime ?? template.performanceMetrics.avgResponseTime,
    userSatisfaction: userSatisfaction ?? template.performanceMetrics.userSatisfaction,
    lastUpdated: Date.now()
  };

  await template.save();

  res.status(200).json({
    success: true,
    data: template.performanceMetrics
  });
}); 