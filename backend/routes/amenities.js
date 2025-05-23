const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AmenityBooking = require('../models/AmenityBooking');
const { auth, adminAuth } = require('../middleware/auth');

// Book an amenity
router.post('/book', auth, [
  body('amenityId').notEmpty().withMessage('Amenity ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('guests').optional().isInt({ min: 0 }).withMessage('Number of guests must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check for booking conflicts
    const conflictingBooking = await AmenityBooking.findOne({
      amenityId: req.body.amenityId,
      date: req.body.date,
      $or: [
        {
          startTime: { $lt: req.body.endTime },
          endTime: { $gt: req.body.startTime }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const booking = new AmenityBooking({
      ...req.body,
      userId: req.user._id,
      societyId: req.user.societyId
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const bookings = await AmenityBooking.find(query)
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('amenityId', 'name description');

    const total = await AmenityBooking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings for society (admin only)
router.get('/society-bookings', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, amenityId } = req.query;
    const query = { societyId: req.user.societyId };
    
    if (status) query.status = status;
    if (amenityId) query.amenityId = amenityId;

    const bookings = await AmenityBooking.find(query)
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name')
      .populate('amenityId', 'name description');

    const total = await AmenityBooking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.put('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await AmenityBooking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (admin only)
router.put('/bookings/:id/status', adminAuth, [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await AmenityBooking.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = req.body.status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 