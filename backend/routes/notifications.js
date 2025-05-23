const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { auth, adminAuth } = require('../middleware/auth');

// Create notification (admin only)
router.post('/', adminAuth, [
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
    const { page = 1, limit = 10, status } = req.query;
    const query = { 
      $or: [
        { recipients: req.user._id },
        { recipients: { $size: 0 } } // Broadcast notifications
      ]
    };
    
    if (status) {
      query.status = status;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
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

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipients: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.markAsRead();
    res.json(notification);
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
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.remove();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 