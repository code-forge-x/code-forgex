const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  endpoint: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['started', 'completed', 'error']
  },
  duration: {
    type: Number,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed
  },
  queryParams: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ endpoint: 1 });
AuditLogSchema.index({ status: 1 });
AuditLogSchema.index({ createdAt: -1 });

// Static method to clean up old logs
AuditLogSchema.statics.cleanup = async function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  await this.deleteMany({
    createdAt: { $lt: cutoffDate }
  });
};

// Static method to get audit logs with pagination
AuditLogSchema.statics.getLogs = async function(query = {}, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    logs,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page
  };
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);