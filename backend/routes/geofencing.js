const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Society = require('../models/Society');
const { auth, adminAuth } = require('../middleware/auth');
const geolib = require('geolib');

// Update society geofence (admin only)
router.put('/society', adminAuth, [
  body('center').isObject().withMessage('Center coordinates are required'),
  body('center.latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('center.longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('radius').isFloat({ min: 0 }).withMessage('Valid radius is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const society = await Society.findById(req.user.societyId);
    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }

    society.geofence = {
      center: req.body.center,
      radius: req.body.radius
    };

    await society.save();
    res.json(society);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if location is within society boundaries
router.post('/check', auth, [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const society = await Society.findById(req.user.societyId);
    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }

    if (!society.geofence) {
      return res.status(400).json({ message: 'Society geofence not configured' });
    }

    const distance = geolib.getDistance(
      { latitude: req.body.latitude, longitude: req.body.longitude },
      { latitude: society.geofence.center.latitude, longitude: society.geofence.center.longitude }
    );

    const isWithinBoundary = distance <= society.geofence.radius;

    res.json({
      isWithinBoundary,
      distance,
      radius: society.geofence.radius
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get society geofence details
router.get('/society', auth, async (req, res) => {
  try {
    const society = await Society.findById(req.user.societyId)
      .select('geofence');

    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }

    if (!society.geofence) {
      return res.status(400).json({ message: 'Society geofence not configured' });
    }

    res.json(society.geofence);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 