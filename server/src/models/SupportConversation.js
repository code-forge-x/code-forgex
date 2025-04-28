// server/src/models/SupportConversation.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'system', 'ai'],
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
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt'
    },
    tokenUsage: {
      input: Number,
      output: Number,
      total: Number
    }
  }
});

const supportConversationSchema = new mongoose.Schema({
  supportId: {
    type: String,
    required: true,
    unique: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  category: {
    type: String,
    enum: ['bug_fix', 'feature_request', 'code_review', 'library_upgrade', 'general'],
    default: 'general'
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

// Pre-save hook to update the updatedAt field
supportConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a function to add a message to the conversation
supportConversationSchema.methods.addMessage = function(sender, content, metadata = {}) {
  this.messages.push({
    sender,
    content,
    timestamp: new Date(),
    metadata
  });
  
  return this.save();
};

const SupportConversation = mongoose.model('SupportConversation', supportConversationSchema);

module.exports = SupportConversation;