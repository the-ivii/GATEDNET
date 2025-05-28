const express = require('express');
const router = express.Router();
const Amenity = require('../models/Amenity');
const auth = require('../middleware/auth');

// Get all amenities
router.get('/', auth, async (req, res) => {
  try {
    const amenities = await Amenity.find();
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for a specific date
router.get('/:amenityId/bookings/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const amenity = await Amenity.findById(req.params.amenityId)
      .populate('bookings.user', 'name flatNo');

    if (!amenity) {
      return res.status(404).json({ message: 'Amenity not found' });
    }

    const bookings = amenity.bookings.filter(booking => 
      booking.date >= startDate && booking.date <= endDate
    );

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Book an amenity
router.post('/:amenityId/book', auth, async (req, res) => {
  try {
    const { date } = req.body;
    const bookingDate = new Date(date);
    
    // Check if date is in the future
    if (bookingDate < new Date()) {
      return res.status(400).json({ message: 'Cannot book for past dates' });
    }

    const amenity = await Amenity.findById(req.params.amenityId);
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity not found' });
    }

    // Check if already booked
    const isBooked = amenity.bookings.some(booking => 
      booking.date.getTime() === bookingDate.getTime()
    );

    if (isBooked) {
      return res.status(400).json({ message: 'Amenity already booked for this date' });
    }

    // Add booking
    amenity.bookings.push({
      date: bookingDate,
      user: req.user._id
    });

    await amenity.save();
    res.status(201).json(amenity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const amenities = await Amenity.find({
      'bookings.user': req.user._id
    }).populate('bookings.user', 'name flatNo');

    const userBookings = amenities.map(amenity => ({
      amenityName: amenity.name,
      bookings: amenity.bookings.filter(booking => 
        booking.user._id.toString() === req.user._id.toString()
      )
    }));

    res.json(userBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 