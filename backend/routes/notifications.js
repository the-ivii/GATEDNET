const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { auth, admin } = require('../middleware/auth');
const User = require('../models/User');

// Create notification (admin only)
router.post('/', [auth, admin], [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('type').isIn(['announcement', 'maintenance', 'event', 'alert']).withMessage('Valid type is required'),
  body('recipients').optional().isArray().withMessage('Recipients must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const notification = new Notification({
      ...req.body,
      societyId: req.user.societyId,
      createdBy: req.user._id
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      'recipients.user': req.user._id,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .populate('society', 'name')
    .populate('relatedTo')
    .limit(50);

    res.json(notifications.map(n => n.getPublicProfile()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      'recipients.user': req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const recipient = notification.recipients.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (recipient) {
      recipient.isRead = true;
      recipient.readAt = new Date();
      await notification.save();
    }

    res.json(notification.getPublicProfile());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive notification
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipients: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.archive();
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isActive = false;
    await notification.save();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;