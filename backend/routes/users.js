const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Society = require('../models/Society');
const Notification = require('../models/Notification');
const { auth, adminAuth } = require('../middleware/auth');
const { isValidPhoneNumber } = require('../utils/helpers');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('societyId', 'name address');
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phoneNumber').optional().custom(value => {
    if (!isValidPhoneNumber(value)) {
      throw new Error('Invalid phone number format');
    }
    return true;
  }),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phoneNumber, preferences } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (preferences) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get society details
router.get('/society', auth, async (req, res) => {
  try {
    const society = await Society.findById(req.user.societyId)
      .populate('admin', 'name email')
      .populate('securityStaff', 'name email')
      .populate('maintenanceStaff', 'name email');

    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }

    res.json(society);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { recipient: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

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
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
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
router.put('/notifications/:id/archive', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
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

// Admin: Get all users in society
router.get('/society/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const query = { societyId: req.user.societyId };
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
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

// Admin: Update user role
router.put('/users/:id/role', adminAuth, [
  body('role').isIn(['resident', 'admin', 'security']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = req.body.role;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 