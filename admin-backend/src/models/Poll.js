const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  optionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
});

const pollSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true,
    trim: true
  },
  options: [optionSchema],
  createdBy: { 
    type: String, 
    required: true,
    ref: 'Admin'
  },
  votes: [voteSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
pollSchema.index({ createdBy: 1 });
pollSchema.index({ createdAt: -1 });
pollSchema.index({ isActive: 1 });

module.exports = mongoose.model('Poll', pollSchema);