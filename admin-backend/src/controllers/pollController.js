const Poll = require('../models/Poll');

// Create a new poll
exports.createPoll = async (req, res) => {
  try {
    const { question, options, endDate } = req.body;

    // Validate required fields
    if (!question || !options || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: question, options, and endDate are required' 
      });
    }

    // Validate endDate is in the future
    const endDateObj = new Date(endDate);
    if (endDateObj <= new Date()) {
      return res.status(400).json({ 
        error: 'End date must be in the future' 
      });
    }

    // Validate options array
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        error: 'At least two options are required' 
      });
    }

    const poll = new Poll({ 
      question, 
      options: options.map(text => ({ text })),
      endDate: endDateObj,
      createdBy: req.admin._id
    });

    await poll.save();
    res.status(201).json({ message: 'Poll created', poll });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

// Get all polls
exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    res.json(polls);
  } catch (error) {
    console.error('Get all polls error:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
};

// Get a single poll by ID
exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    res.json(poll);
  } catch (error) {
    console.error('Get poll by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
};

// Update a poll
exports.updatePoll = async (req, res) => {
  try {
    const { question, options, endDate } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Check if user is the creator
    if (poll.createdBy.toString() !== req.admin._id) {
      return res.status(403).json({ error: 'Not authorized to update this poll' });
    }

    // Validate endDate if provided
    if (endDate) {
      const endDateObj = new Date(endDate);
      if (endDateObj <= new Date()) {
        return res.status(400).json({ 
          error: 'End date must be in the future' 
        });
      }
      poll.endDate = endDateObj;
    }
    
    // Update other fields if provided
    if (question) poll.question = question;
    if (options) {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ 
          error: 'At least two options are required' 
        });
      }
      poll.options = options.map(opt => ({ text: opt }));
    }
    
    await poll.save();
    res.json({ message: 'Poll updated', poll });
  } catch (error) {
    console.error('Update poll error:', error);
    res.status(500).json({ error: 'Failed to update poll' });
  }
};

// Delete a poll
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Check if user is the creator
    if (poll.createdBy.toString() !== req.admin._id) {
      return res.status(403).json({ error: 'Not authorized to delete this poll' });
    }
    
    await poll.deleteOne();
    res.json({ message: 'Poll deleted' });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
};

// Vote on a poll
exports.voteOnPoll = async (req, res) => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll is still active
    if (!poll.isActive || new Date() > poll.endDate) {
      return res.status(400).json({ error: 'This poll is no longer active' });
    }
    
    // Check if user has already voted
    if (poll.votes.some(vote => vote.userId === req.admin._id)) {
      return res.status(400).json({ error: 'You have already voted on this poll' });
    }

    // Validate optionId
    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(400).json({ error: 'Invalid option selected' });
    }
    
    // Add vote
    poll.votes.push({
      userId: req.admin._id,
      optionId,
      timestamp: new Date()
    });

    // Increment vote count for the option
    option.votes += 1;
    
    await poll.save();
    res.json({ message: 'Vote recorded', poll });
  } catch (error) {
    console.error('Vote on poll error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
};