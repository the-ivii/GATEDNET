const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['clubhouse', 'swimming pool', 'amphitheatre', 'kids pool', 'terrace garden']
  },
  bookings: [{
    date: {
      type: Date,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Index for efficient date-based queries
amenitySchema.index({ 'bookings.date': 1 });

module.exports = mongoose.model('Amenity', amenitySchema); 