const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');

// Get all active polls
router.get('/', auth, async (req, res) => {
  try {
    const polls = await Poll.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on a poll
router.post('/:pollId/vote', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.pollId);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ message: 'Poll is no longer active' });
    }

    // Check if user has already voted
    const hasVoted = poll.options.some(option => 
      option.votes.includes(req.user._id)
    );

    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    // Add vote
    poll.options[optionIndex].votes.push(req.user._id);
    await poll.save();

    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get poll results
router.get('/:pollId/results', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId)
      .populate('createdBy', 'name');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 