const mongoose = require('mongoose');
const crypto = require('crypto');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['blueprint', 'specification', 'requirements', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'processed', 'error'],
    default: 'pending'
  },
  fingerprint: {
    type: String,
    required: true,
    unique: true
  },
  filePath: {
    type: String,
    required: true
  },
  metadata: {
    size: Number,
    mimeType: String,
    encoding: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  error: {
    message: String,
    stack: String
  }
}, {
  timestamps: true
});

// Generate fingerprint from file content
documentSchema.statics.generateFingerprint = async function(fileBuffer) {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

// Pre-save middleware to ensure fingerprint is unique
documentSchema.pre('save', async function(next) {
  if (this.isModified('fingerprint')) {
    const existingDoc = await this.constructor.findOne({ fingerprint: this.fingerprint });
    if (existingDoc && !existingDoc._id.equals(this._id)) {
      throw new Error('Document with this fingerprint already exists');
    }
  }
  next();
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 