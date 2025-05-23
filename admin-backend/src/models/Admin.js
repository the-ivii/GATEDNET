const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  societyId: { 
    type: String, 
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'society_admin'],
    default: 'society_admin'
  },
  firebaseUid: { 
    type: String, 
    required: true,
    unique: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add indexes for better query performance
adminSchema.index({ email: 1 });
adminSchema.index({ firebaseUid: 1 });
adminSchema.index({ societyId: 1 });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;