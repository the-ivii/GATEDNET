const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  securityStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maintenanceStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  geofence: {
    center: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    radius: {
      type: Number,
      min: 0
    }
  },
  amenities: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    capacity: Number,
    openTime: String,
    closeTime: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  settings: {
    allowGuestBookings: { type: Boolean, default: false },
    requireApprovalForBookings: { type: Boolean, default: true },
    maintenanceResponseTime: { type: Number, default: 24 }, // in hours
    votingDuration: { type: Number, default: 48 } // in hours
  },
  // Document repository for shared documents
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  // Community rules and regulations
  rules: [{
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
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Community events calendar
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  // For real-time updates on polls
  activePolls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll'
  }],
  // For ratings and reviews
  ratings: {
    overall: { type: Number, default: 0 },
    maintenance: { type: Number, default: 0 },
    security: { type: Number, default: 0 },
    amenities: { type: Number, default: 0 },
    community: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Society', societySchema); 