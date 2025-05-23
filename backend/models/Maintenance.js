const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const maintenanceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'structural', 'cleaning', 'security', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  location: {
    building: String,
    floor: String,
    area: String
  },
  images: [{
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timeline: [{
    status: String,
    comment: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  comments: [commentSchema],
  estimatedCost: {
    amount: Number,
    currency: { type: String, default: 'INR' }
  },
  actualCost: {
    amount: Number,
    currency: { type: String, default: 'INR' }
  },
  completionDate: Date,
  rating: {
    score: { type: Number, min: 1, max: 5 },
    feedback: String
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Method to update status
maintenanceSchema.methods.updateStatus = function(status, comment, updatedBy) {
  this.status = status;
  this.timeline.push({
    status,
    comment,
    updatedBy,
    timestamp: new Date()
  });
  return this.save();
};

// Method to add comment
maintenanceSchema.methods.addComment = function(userId, text) {
  this.comments.push({
    user: userId,
    text,
    timestamp: new Date()
  });
  return this.save();
};

// Update completedAt when status changes to completed
maintenanceSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Maintenance', maintenanceSchema); 