const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Announcement = require('../models/Announcement');

// Placeholder GET endpoints for frontend integration
router.get('/polls', (req, res) => res.json([]));
router.get('/amenities', (req, res) => res.json([]));

// Announcements endpoint - fetch from announcements collection
router.get('/announcements', async (req, res) => {
  console.log('GET /announcements called');
  try {
    const announcements = await Announcement.find({ isActive: true });
    console.log('Fetched announcements:', announcements);
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

router.get('/maintenances', (req, res) => res.json([]));
router.get('/reminders', (req, res) => res.json([]));

// Login route
router.post('/login', async (req, res) => {
  const { name, flat } = req.body;
  const member = await Member.findOne({ name, flat });
  if (!member) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Login successful', member });
});

// TODO: Add routes for polls, voting, announcements, reminders, maintenances, amenities, and booking

module.exports = router; 