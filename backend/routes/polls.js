const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Poll = require('../models/Poll');
const { auth, adminAuth } = require('../middleware/auth');

// Create a new poll (admin only)
router.post('/', adminAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const poll = new Poll({
      ...req.body,
      societyId: req.user.societyId,
      createdBy: req.user._id
    });

    await poll.save();
    res.status(201).json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all polls for society
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { societyId: req.user.societyId };
    
    if (status) {
      query.status = status;
    }

    const polls = await Poll.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    const total = await Poll.countDocuments(query);

    res.json({
      polls,
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

// Get single poll
router.get('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    }).populate('createdBy', 'name');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on a poll
router.post('/:id/vote', auth, [
  body('optionId').notEmpty().withMessage('Option ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const poll = await Poll.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.status !== 'active') {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    if (poll.voters.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    const option = poll.options.id(req.body.optionId);
    if (!option) {
      return res.status(400).json({ message: 'Invalid option' });
    }

    option.votes += 1;
    poll.voters.push(req.user._id);
    await poll.save();

    res.json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Close a poll (admin only)
router.put('/:id/close', adminAuth, async (req, res) => {
  try {
    const poll = await Poll.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    poll.status = 'closed';
    await poll.save();

    res.json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 