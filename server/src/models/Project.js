const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    required: false
  },
  financialDomain: {
    type: String,
    enum: ['trading', 'risk_management', 'market_data', 'order_management', 'backtesting', 'analytics', 'compliance'],
    default: 'trading'
  },
  tradingVenue: {
    type: String,
    enum: ['forex', 'equities', 'futures', 'options', 'crypto', 'fixed_income', 'multi_asset', 'other'],
    default: 'multi_asset'
  },
  blueprint: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  techStack: {
    type: [String],
    required: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  components: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component'
  }],
  status: {
    type: String,
    enum: ['created', 'blueprint_generated', 'blueprint_approved', 'in_progress', 'completed', 'archived'],
    default: 'created'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indices
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ name: "text", description: "text", requirements: "text" });

module.exports = mongoose.model('Project', ProjectSchema);
