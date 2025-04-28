// server/src/models/Prompt.js
const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  active: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['financial', 'support', 'development', 'general'],
    default: 'general'
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

// Create a compound index on name and version
promptSchema.index({ name: 1, version: 1 }, { unique: true });

// Pre-save hook to update the updatedAt field
promptSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;