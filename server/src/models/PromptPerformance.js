const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromptPerformanceSchema = new Schema({
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
    type: Number, 
    default: 0 
  },
  success: { 
    type: Boolean, 
    default: true 
  },
  errorDetails: { 
    type: String 
  },
  created: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('PromptPerformance', PromptPerformanceSchema);