const mongoose = require('mongoose');
const { Schema } = mongoose;

const ParameterSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['string', 'number', 'boolean', 'array', 'object']
  },
  description: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: Schema.Types.Mixed
  },
  validation: {
    type: Schema.Types.Mixed
  }
});

const VersionHistorySchema = new Schema({
  version: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changes: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    default: 'main'
  },
  parentVersion: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  }
});

const PerformanceMetricsSchema = new Schema({
  successRate: {
    type: Number,
    default: 0
  },
  tokenEfficiency: {
    type: Number,
    default: 0
  },
  avgResponseTime: {
    type: Number,
    default: 0
  },
  userSatisfaction: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const TemplateSchema = new Schema({
  templateId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  category: [{
    type: String,
    required: true,
    enum: [
      'strategy', 'indicator', 'utility', 'test', 'other',
      'blueprint', 'code-generation', 'quickfix', 'document-fingerprinting',
      'ai-integration', 'project-init', 'development-workflow', 'testing-deployment'
    ]
  }],
  roles: [{
    type: String,
    required: true,
    enum: ['admin', 'developer', 'user']
  }],
  content: {
    type: String,
    required: true
  },
  parameters: [ParameterSchema],
  versionHistory: [VersionHistorySchema],
  performanceMetrics: PerformanceMetricsSchema,
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Template'
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
TemplateSchema.index({ templateId: 1 });
TemplateSchema.index({ category: 1 });
TemplateSchema.index({ roles: 1 });
TemplateSchema.index({ author: 1 });
TemplateSchema.index({ status: 1 });
TemplateSchema.index({ isPublic: 1 });

// Method to validate parameters
TemplateSchema.methods.validateParameters = function(params) {
  const errors = [];
  
  this.parameters.forEach(param => {
    if (param.required && !(param.name in params)) {
      errors.push(`Missing required parameter: ${param.name}`);
      return;
    }

    const value = params[param.name];
    if (value === undefined) return;

    // Type validation
    switch (param.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Parameter ${param.name} must be a string`);
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          errors.push(`Parameter ${param.name} must be a number`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Parameter ${param.name} must be a boolean`);
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`Parameter ${param.name} must be an array`);
        }
        break;
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`Parameter ${param.name} must be an object`);
        }
        break;
    }

    // Custom validation if provided
    if (param.validation && typeof param.validation === 'function') {
      const validationError = param.validation(value);
      if (validationError) {
        errors.push(`Validation failed for ${param.name}: ${validationError}`);
      }
    }
  });

  return errors;
};

// Method to generate code with parameters
TemplateSchema.methods.generateCode = function(params = {}) {
  let code = this.content;
  
  // Replace parameters in code
  this.parameters.forEach(param => {
    const value = params[param.name] ?? param.defaultValue;
    const regex = new RegExp(`\\$\\{${param.name}\\}`, 'g');
    code = code.replace(regex, value);
  });

  return code;
};

// Method to create new version
TemplateSchema.methods.createVersion = async function(data, userId) {
  const versionHistory = {
    version: data.version,
    author: userId,
    changes: data.changes,
    branch: data.branch || 'main',
    parentVersion: this.version,
    status: data.status || 'draft'
  };

  this.versionHistory.push(versionHistory);
  this.version = data.version;
  
  if (data.content) this.content = data.content;
  if (data.parameters) this.parameters = data.parameters;
  if (data.dependencies) this.dependencies = data.dependencies;
  
  await this.save();
  return this;
};

// Static method to get templates with pagination and filtering
TemplateSchema.statics.getTemplates = async function(query = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const [templates, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .populate('dependencies', 'templateId name version')
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    templates,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

module.exports = mongoose.model('Template', TemplateSchema);