const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
SessionSchema.index({ token: 1 });
SessionSchema.index({ user: 1 });
SessionSchema.index({ expiresAt: 1 });

// Method to check if session is expired
SessionSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Method to refresh session
SessionSchema.methods.refresh = function() {
  this.lastActivity = new Date();
  this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return this.save();
};

// Static method to clean up expired sessions
SessionSchema.statics.cleanup = async function() {
  await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Session', SessionSchema); 