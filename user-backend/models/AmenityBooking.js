const mongoose = require('mongoose');

const amenityBookingSchema = new mongoose.Schema({
  amenity: { type: mongoose.Schema.Types.ObjectId, ref: 'Amenity', required: true },
  date: { type: String, required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AmenityBooking', amenityBookingSchema); 