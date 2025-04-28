const mongoose = require('mongoose');

const TechSupportSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active',
    index: true
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  startedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  closedAt: {
    type: Date,
    default: null
  }
});

// Add indices
TechSupportSessionSchema.index({ userId: 1, status: 1 });
TechSupportSessionSchema.index({ projectId: 1, status: 1 });
TechSupportSessionSchema.index({ updatedAt: -1 });
TechSupportSessionSchema.index({ "messages.content": "text" });

module.exports = mongoose.model('TechSupportSession', TechSupportSessionSchema);