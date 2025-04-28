// server/src/models/PromptComponent.js
const mongoose = require('mongoose');

const promptComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to update the updatedAt field
promptComponentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const PromptComponent = mongoose.model('PromptComponent', promptComponentSchema);

module.exports = PromptComponent;