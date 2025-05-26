const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['maintenance', 'cleaning', 'security', 'event', 'other']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: Date,
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
taskSchema.index({ society: 1, createdAt: -1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

// Method to get public profile
taskSchema.methods.getPublicProfile = function() {
  const task = this.toObject();
  delete task.__v;
  return task;
};

// Method to check if task is overdue
taskSchema.methods.isOverdue = function() {
  return this.status !== 'completed' && new Date() > this.dueDate;
};

// Method to add comment
taskSchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    user: userId,
    text
  });
  return this.save();
};

// Method to update status
taskSchema.methods.updateStatus = async function(status) {
  this.status = status;
  if (status === 'completed') {
    this.completedAt = new Date();
  }
  return this.save();
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;