const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Maintenance = require('../models/Maintenance');
const { auth, adminAuth } = require('../middleware/auth');

// Create maintenance request
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Valid priority is required'),
  body('location').trim().notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const maintenance = new Maintenance({
      ...req.body,
      reportedBy: req.user._id,
      societyId: req.user.societyId
    });

    await maintenance.save();
    res.status(201).json(maintenance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all maintenance requests for society
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const query = { societyId: req.user.societyId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const maintenance = await Maintenance.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name');

    const total = await Maintenance.countDocuments(query);

    res.json({
      maintenance,
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

// Get single maintenance request
router.get('/:id', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    })
    .populate('reportedBy', 'name')
    .populate('assignedTo', 'name');

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json(maintenance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update maintenance request status (admin only)
router.put('/:id/status', adminAuth, [
  body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const maintenance = await Maintenance.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    maintenance.status = req.body.status;
    if (req.body.assignedTo) {
      maintenance.assignedTo = req.body.assignedTo;
    }
    await maintenance.save();

    res.json(maintenance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to maintenance request
router.post('/:id/comments', auth, [
  body('comment').trim().notEmpty().withMessage('Comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const maintenance = await Maintenance.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    maintenance.comments.push({
      text: req.body.comment,
      user: req.user._id
    });

    await maintenance.save();
    res.json(maintenance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 