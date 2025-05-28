const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');

// Get all reminders
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific reminder
router.get('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 