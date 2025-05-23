const mongoose = require('mongoose');

const amenityBookingSchema = new mongoose.Schema({
  amenityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society.amenities',
    required: true
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
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  guests: {
    type: Number,
    default: 0,
    min: 0
  },
  purpose: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Validate end time is after start time
amenityBookingSchema.pre('save', function(next) {
  const startHour = parseInt(this.startTime.split(':')[0]);
  const startMinute = parseInt(this.startTime.split(':')[1]);
  const endHour = parseInt(this.endTime.split(':')[0]);
  const endMinute = parseInt(this.endTime.split(':')[1]);

  if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Method to check if booking time slot is available
amenityBookingSchema.statics.isTimeSlotAvailable = async function(amenityId, date, startTime, endTime, excludeBookingId = null) {
  const query = {
    amenityId,
    date,
    status: { $ne: 'cancelled' },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await this.findOne(query);
  return !conflictingBooking;
};

module.exports = mongoose.model('AmenityBooking', amenityBookingSchema); 