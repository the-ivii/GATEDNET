const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, societyAdmin } = require('../middleware/auth');
const Poll = require('../models/Poll');
const Notification = require('../models/Notification');

// Get all polls for a society
router.get('/', auth, async (req, res) => {
  try {
    const polls = await Poll.find({
      society: req.user.society,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name')
    .limit(50);

    res.json(polls.map(poll => {
      const publicPoll = poll.getPublicProfile();
      publicPoll.hasVoted = poll.hasUserVoted(req.user._id);
      return publicPoll;
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active polls
router.get('/active', auth, async (req, res) => {
  try {
    const now = new Date();
    const polls = await Poll.find({
      society: req.user.society,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
    .sort({ endDate: 1 })
    .populate('createdBy', 'name');

    res.json(polls.map(poll => {
      const publicPoll = poll.getPublicProfile();
      publicPoll.hasVoted = poll.hasUserVoted(req.user._id);
      return publicPoll;
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get poll by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findOne({
      _id: req.params.id,
      society: req.user.society,
      isActive: true
    }).populate('createdBy', 'name');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const publicPoll = poll.getPublicProfile();
    publicPoll.hasVoted = poll.hasUserVoted(req.user._id);
    res.json(publicPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create poll (society admin only)
router.post('/', [auth, societyAdmin], [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('options.*.text').notEmpty().withMessage('Option text is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('isPublic').isBoolean().withMessage('isPublic must be a boolean'),
  body('allowMultipleVotes').isBoolean().withMessage('allowMultipleVotes must be a boolean'),
  body('showResults').isBoolean().withMessage('showResults must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      options,
      startDate,
      endDate,
      isPublic,
      allowMultipleVotes,
      showResults
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Create poll
    const poll = new Poll({
      title,
      description,
      options: options.map(opt => ({ text: opt.text })),
      society: req.user.society,
      createdBy: req.user._id,
      startDate,
      endDate,
      isPublic,
      allowMultipleVotes,
      showResults
    });

    await poll.save();

    // Create notification
    const notification = new Notification({
      title: 'New Poll Created',
      message: `A new poll "${title}" has been created. Please cast your vote.`,
      type: 'poll',
      priority: 'medium',
      society: req.user.society,
      relatedTo: poll._id,
      onModel: 'Poll'
    });

    await notification.save();

    res.status(201).json(poll.getPublicProfile());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on poll
router.post('/:id/vote', auth, [
  body('optionIndex').isInt({ min: 0 }).withMessage('Valid option index is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const poll = await Poll.findOne({
      _id: req.params.id,
      society: req.user.society,
      isActive: true
    });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if poll is active
    if (!poll.isActive()) {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    // Check if user has already voted
    if (!poll.allowMultipleVotes && poll.hasUserVoted(req.user._id)) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    const { optionIndex } = req.body;

    // Validate option index
    if (optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    // Add vote
    poll.options[optionIndex].votes.push({
      user: req.user._id,
      votedAt: new Date()
    });

    await poll.save();

    res.json(poll.getPublicProfile());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete poll (society admin only)
router.delete('/:id', [auth, societyAdmin], async (req, res) => {
  try {
    const poll = await Poll.findOne({
      _id: req.params.id,
      society: req.user.society
    });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    poll.isActive = false;
    await poll.save();

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;