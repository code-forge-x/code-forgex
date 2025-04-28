// server/src/models/PromptPerformance.js
const mongoose = require('mongoose');

const promptPerformanceSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true
  },
  supportId: {
    type: String,
    required: true
  },
  tokenUsage: {
    input: {
      type: Number,
      default: 0
    },
    output: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  latency: {
    type: Number,  // Response time in milliseconds
    default: 0
  },
  success: {
    type: Boolean,
    default: true
  },
  errorDetails: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PromptPerformance = mongoose.model('PromptPerformance', promptPerformanceSchema);

module.exports = PromptPerformance;