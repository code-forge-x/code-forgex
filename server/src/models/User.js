const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'developer', 'client'],
    default: 'client'
  },
  projects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  }],
  fingerprint: { 
    type: String 
  },
  preferences: { 
    type: Object 
  },
  created: { 
    type: Date, 
    default: Date.now 
  },
  lastActive: { 
    type: Date 
  }
});

module.exports = mongoose.model('User', UserSchema);