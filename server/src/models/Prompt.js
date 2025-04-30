const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromptSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  version: { 
    type: Number, 
    required: true, 
    default: 1 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['general', 'requirements', 'blueprint', 'component', 'support', 'chat'],
    default: 'general'
  },
  variables: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'array', 'object'],
      default: 'string'
    },
    required: {
      type: Boolean,
      default: false
    }
  }],
  examples: [{
    input: {
      type: Map,
      of: String
    },
    output: {
      type: String,
      required: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  active: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Compound index to ensure name+version uniqueness
PromptSchema.index({ name: 1, version: 1 }, { unique: true });

// Virtual for full prompt name (name + version)
PromptSchema.virtual('fullName').get(function() {
  return `${this.name} v${this.version}`;
});

// Method to get the next version number
PromptSchema.statics.getNextVersion = async function(name) {
  const latest = await this.findOne({ name })
    .sort({ version: -1 })
    .select('version');
  return (latest?.version || 0) + 1;
};

// Method to validate variables against template
PromptSchema.methods.validateVariables = function(variables) {
  const requiredVars = this.variables
    .filter(v => v.required)
    .map(v => v.name);
  
  const missingVars = requiredVars.filter(v => !(v in variables));
  if (missingVars.length > 0) {
    throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
  }
  
  return true;
};

// Method to replace variables in template
PromptSchema.methods.replaceVariables = function(variables) {
  this.validateVariables(variables);
  
  let content = this.content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    content = content.replace(regex, value);
  }
  
  return content;
};

// Update the updatedAt field before saving
PromptSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Prompt', PromptSchema);