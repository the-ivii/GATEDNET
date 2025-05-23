const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'access', 'amenities', 'other'],
    default: 'other'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: [{
    text: {
      type: String,
      required: true
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isStaff: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  resolvedAt: Date,
  isPrivate: {
    type: Boolean,
    default: false
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    feedback: String
  }
}, {
  timestamps: true
});

// Method to update status
supportTicketSchema.methods.updateStatus = function(status, userId, responseText) {
  this.status = status;
  
  if (responseText) {
    this.response.push({
      text: responseText,
      respondedBy: userId,
      timestamp: new Date(),
      isStaff: true
    });
  }
  
  if (status === 'resolved') {
    this.resolvedAt = new Date();
  }
  
  return this.save();
};

// Method to add response
supportTicketSchema.methods.addResponse = function(userId, text, isStaff = false) {
  this.response.push({
    text,
    respondedBy: userId,
    timestamp: new Date(),
    isStaff
  });
  
  return this.save();
};

// Method to calculate response time
supportTicketSchema.methods.getResponseTime = function() {
  if (this.response.length === 0) {
    return null;
  }
  
  const firstResponse = this.response[0];
  const createdAt = this.createdAt;
  
  // Return time difference in hours
  return Math.round((firstResponse.timestamp - createdAt) / (1000 * 60 * 60));
};

// Method to calculate resolution time
supportTicketSchema.methods.getResolutionTime = function() {
  if (!this.resolvedAt) {
    return null;
  }
  
  // Return time difference in hours
  return Math.round((this.resolvedAt - this.createdAt) / (1000 * 60 * 60));
};

module.exports = mongoose.model('SupportTicket', supportTicketSchema); 