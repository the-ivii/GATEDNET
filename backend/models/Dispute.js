const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
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
  involvedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'in-mediation', 'resolved', 'escalated'],
    default: 'pending'
  },
  emotion: {
    type: String,
    enum: ['frustrated', 'concerned', 'neutral', 'hopeful'],
    default: 'neutral'
  },
  mediator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: String,
  attachments: [{
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  comments: [{
    text: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  timeline: [{
    status: String,
    comment: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  resolutionDate: Date,
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Method to update status
disputeSchema.methods.updateStatus = function(status, comment, updatedBy) {
  this.status = status;
  this.timeline.push({
    status,
    comment,
    updatedBy,
    timestamp: new Date()
  });
  
  if (status === 'resolved') {
    this.resolutionDate = new Date();
  }
  
  return this.save();
};

// Method to add comment
disputeSchema.methods.addComment = function(userId, text) {
  this.comments.push({
    user: userId,
    text,
    timestamp: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Dispute', disputeSchema); 