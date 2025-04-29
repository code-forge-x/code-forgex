const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromptSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  version: { 
    type: Number, 
    required: true, 
    default: 1 
  },
  content: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['general', 'requirements', 'blueprint', 'component', 'support'],
    default: 'general'
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: String, 
    default: 'system' 
  },
  created: { 
    type: Date, 
    default: Date.now 
  },
  updated: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to ensure name+version uniqueness
PromptSchema.index({ name: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('Prompt', PromptSchema);