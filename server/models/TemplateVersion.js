const mongoose = require('mongoose');

const TemplateVersionSchema = new mongoose.Schema({
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  version: {
    type: String,
    required: true
  },
  changes: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  parameters: [{
    name: String,
    type: String,
    description: String,
    required: Boolean,
    defaultValue: mongoose.Schema.Types.Mixed,
    validation: mongoose.Schema.Types.Mixed
  }],
  dependencies: [{
    name: String,
    version: String,
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
TemplateVersionSchema.index({ template: 1, version: 1 }, { unique: true });
TemplateVersionSchema.index({ template: 1, createdAt: -1 });

// Static method to get version history
TemplateVersionSchema.statics.getVersionHistory = async function(templateId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const [versions, total] = await Promise.all([
    this.find({ template: templateId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean(),
    this.countDocuments({ template: templateId })
  ]);

  return {
    versions,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

// Static method to get specific version
TemplateVersionSchema.statics.getVersion = async function(templateId, version) {
  return this.findOne({ template: templateId, version })
    .populate('author', 'name email')
    .lean();
};

// Static method to get latest version
TemplateVersionSchema.statics.getLatestVersion = async function(templateId) {
  return this.findOne({ template: templateId })
    .sort({ createdAt: -1 })
    .populate('author', 'name email')
    .lean();
};

module.exports = mongoose.model('TemplateVersion', TemplateVersionSchema); 