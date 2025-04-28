// server/src/models/ProjectPrompt.js
const mongoose = require('mongoose');

const projectPromptSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
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
  basedOn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt'
  },
  active: {
    type: Boolean,
    default: true
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

// Create a compound index on projectId, name and version
projectPromptSchema.index({ projectId: 1, name: 1, version: 1 }, { unique: true });

// Pre-save hook to update the updatedAt field
projectPromptSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ProjectPrompt = mongoose.model('ProjectPrompt', projectPromptSchema);

module.exports = ProjectPrompt;