const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

const pollSchema = new mongoose.Schema({
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
  options: [optionSchema],
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Method to check if poll is expired
pollSchema.methods.isExpired = function() {
  return new Date() > this.endDate;
};

// Method to get results
pollSchema.methods.getResults = function() {
  const total = this.options.reduce((sum, option) => sum + option.votes, 0);
  return this.options.map(option => ({
    text: option.text,
    votes: option.votes,
    percentage: total > 0 ? (option.votes / total * 100).toFixed(2) : 0
  }));
};

module.exports = mongoose.model('Poll', pollSchema); 