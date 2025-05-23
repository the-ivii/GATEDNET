const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['attending', 'maybe', 'not-attending'], default: 'attending' },
    responseDate: { type: Date, default: Date.now }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  reminder: {
    isEnabled: { type: Boolean, default: true },
    time: { type: Number, default: 24 } // hours before event
  },
  category: {
    type: String,
    enum: ['meeting', 'celebration', 'maintenance', 'sports', 'other'],
    default: 'other'
  },
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // For time-based reminders
  remindersSent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  maxAttendees: {
    type: Number,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  comments: [{
    text: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Method to check if event is ongoing
eventSchema.methods.isOngoing = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Method to check if event is completed
eventSchema.methods.isCompleted = function() {
  return new Date() > this.endDate;
};

// Method to update event status based on current time
eventSchema.methods.updateStatus = function() {
  const now = new Date();
  
  if (now >= this.startDate && now <= this.endDate) {
    this.status = 'ongoing';
  } else if (now > this.endDate) {
    this.status = 'completed';
  } else {
    this.status = 'upcoming';
  }
  
  return this.save();
};

// Method to add attendee
eventSchema.methods.addAttendee = function(userId, status = 'attending') {
  // Check if user is already in attendees
  const existingAttendee = this.attendees.find(
    attendee => String(attendee.user) === String(userId)
  );
  
  if (existingAttendee) {
    existingAttendee.status = status;
    existingAttendee.responseDate = new Date();
  } else {
    this.attendees.push({
      user: userId,
      status,
      responseDate: new Date()
    });
  }
  
  return this.save();
};

// Method to check if event is full
eventSchema.methods.isFull = function() {
  if (!this.maxAttendees) return false;
  
  const attendingCount = this.attendees.filter(
    attendee => attendee.status === 'attending'
  ).length;
  
  return attendingCount >= this.maxAttendees;
};

// Method to add comment
eventSchema.methods.addComment = function(userId, text) {
  this.comments.push({
    user: userId,
    text,
    timestamp: new Date()
  });
  return this.save();
};

// Check for valid date range (end after start)
eventSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema); 