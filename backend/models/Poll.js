const mongoose = require('mongoose');

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
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  showResults: {
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
pollSchema.index({ society: 1, createdAt: -1 });
pollSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

// Method to get public profile
pollSchema.methods.getPublicProfile = function() {
  const poll = this.toObject();
  delete poll.__v;
  return poll;
};

// Method to check if poll is active
pollSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.startDate <= now && now <= this.endDate && this.isActive;
};

// Method to check if user has voted
pollSchema.methods.hasUserVoted = function(userId) {
  return this.options.some(option => 
    option.votes.some(vote => vote.user.toString() === userId.toString())
  );
};

// Method to get vote count for an option
pollSchema.methods.getVoteCount = function(optionIndex) {
  return this.options[optionIndex].votes.length;
};

// Method to get total votes
pollSchema.methods.getTotalVotes = function() {
  return this.options.reduce((total, option) => total + option.votes.length, 0);
};

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;