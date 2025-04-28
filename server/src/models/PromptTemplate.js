const mongoose = require('mongoose');

const PromptTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['blueprint', 'component_generation', 'tech_support', 'code_analysis', 'system','chat'],
    default: 'component_generation',
    index: true
  },
  version: {
    type: Number,
    default: 1
  },
  content: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  tags: {
    type: [String],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  }
  
});

// Add indexes
PromptTemplateSchema.index({ name: 1 }, { unique: true });
PromptTemplateSchema.index({ version: -1 });
PromptTemplateSchema.index({ category: 1 });
PromptTemplateSchema.index({ active: 1 });
PromptTemplateSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model('PromptTemplate', PromptTemplateSchema);
