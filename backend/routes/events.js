const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');
const { emitToSociety, emitToUser } = require('../socket');

// Create a new event
router.post('/', adminAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('category').isIn(['meeting', 'celebration', 'maintenance', 'sports', 'other']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate that end date is after start date
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const event = new Event({
      ...req.body,
      societyId: req.user.societyId,
      organizer: req.user._id
    });

    await event.save();
    
    // Add event to society's events array
    await updateSocietyEvents(req.user.societyId);
    
    // Notify society members about the new event
    emitToSociety(req.user.societyId, 'event-created', {
      eventId: event._id,
      title: event.title,
      startDate: event.startDate,
      category: event.category
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const { 
      category, 
      status,
      page = 1, 
      limit = 10,
      from,
      to,
      featured
    } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date range
    if (from) {
      query.startDate = { $gte: new Date(from) };
    }
    
    if (to) {
      query.endDate = { $lte: new Date(to) };
    }
    
    // Filter by featured
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Get only public events and those organized by current user
    if (req.user.role !== 'admin') {
      query.$or = [
        { isPublic: true },
        { organizer: req.user._id }
      ];
    }
    
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('organizer', 'name')
      .populate('attendees.user', 'name');
    
    const total = await Event.countDocuments(query);
    
    // Update event statuses based on current time
    events.forEach(async (event) => {
      const currentStatus = event.status;
      await event.updateStatus();
      
      // If status changed, we need to refresh the event data
      if (currentStatus !== event.status) {
        await event.save();
      }
    });
    
    res.json({
      events,
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

// Get event by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    })
    .populate('organizer', 'name')
    .populate('attendees.user', 'name')
    .populate('comments.user', 'name');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Update event status based on current time
    await event.updateStatus();
    
    // Check if user is authorized to view this event
    if (!event.isPublic && event.organizer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this event' });
    }
    
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', auth, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('category').optional().isIn(['meeting', 'celebration', 'maintenance', 'sports', 'other']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is authorized to update this event
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    // If updating dates, validate that end date is after start date
    if (req.body.startDate && req.body.endDate) {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      if (endDate <= startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    } else if (req.body.startDate && !req.body.endDate) {
      const startDate = new Date(req.body.startDate);
      const endDate = event.endDate;
      
      if (endDate <= startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    } else if (!req.body.startDate && req.body.endDate) {
      const startDate = event.startDate;
      const endDate = new Date(req.body.endDate);
      
      if (endDate <= startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }
    
    // Update fields
    const fieldsToUpdate = [
      'title', 'description', 'startDate', 'endDate', 'location', 
      'category', 'isPublic', 'reminder', 'maxAttendees', 'isFeatured'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });
    
    await event.save();
    
    // If dates changed, update event status
    if (req.body.startDate || req.body.endDate) {
      await event.updateStatus();
    }
    
    // Notify society members about the updated event
    emitToSociety(req.user.societyId, 'event-updated', {
      eventId: event._id,
      title: event.title,
      startDate: event.startDate,
      category: event.category
    });
    
    // Notify attendees about the update
    event.attendees.forEach(attendee => {
      emitToUser(attendee.user, 'event-updated', {
        eventId: event._id,
        title: event.title,
        startDate: event.startDate,
        message: 'An event you are attending has been updated'
      });
    });
    
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to event
router.post('/:id/comments', auth, [
  body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const event = await Event.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await event.addComment(req.user._id, req.body.text);
    
    // Get the newly added comment with populated user
    const updatedEvent = await Event.findById(event._id)
      .populate('comments.user', 'name');
    
    const newComment = updatedEvent.comments[updatedEvent.comments.length - 1];
    
    res.json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set attendance status
router.post('/:id/attend', auth, [
  body('status').isIn(['attending', 'maybe', 'not-attending']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const event = await Event.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if event is full and user is trying to attend
    if (req.body.status === 'attending' && !event.attendees.some(a => a.user.toString() === req.user._id.toString())) {
      if (event.isFull()) {
        return res.status(400).json({ message: 'Event is at maximum capacity' });
      }
    }
    
    await event.addAttendee(req.user._id, req.body.status);
    
    // Notify organizer about new attendee
    if (req.body.status === 'attending') {
      emitToUser(event.organizer, 'event-new-attendee', {
        eventId: event._id,
        title: event.title,
        attendeeName: req.user.name
      });
    }
    
    res.json({
      success: true,
      status: req.body.status,
      event: {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        attendees: event.attendees.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel event (admin or organizer only)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is authorized to cancel this event
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this event' });
    }
    
    event.status = 'cancelled';
    await event.save();
    
    // Notify all attendees about cancellation
    event.attendees.forEach(attendee => {
      if (attendee.status === 'attending' || attendee.status === 'maybe') {
        emitToUser(attendee.user, 'event-cancelled', {
          eventId: event._id,
          title: event.title,
          startDate: event.startDate
        });
      }
    });
    
    res.json({ success: true, message: 'Event cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event attendees
router.get('/:id/attendees', auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    }).populate('attendees.user', 'name email phoneNumber flatNumber');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is authorized to view attendees
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view attendees' });
    }
    
    const attendees = {
      attending: event.attendees.filter(a => a.status === 'attending'),
      maybe: event.attendees.filter(a => a.status === 'maybe'),
      notAttending: event.attendees.filter(a => a.status === 'not-attending')
    };
    
    res.json(attendees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming events (for dashboard)
router.get('/dashboard/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    
    const events = await Event.find({
      societyId: req.user.societyId,
      startDate: { $gte: now },
      status: 'upcoming',
      $or: [
        { isPublic: true },
        { organizer: req.user._id },
        { 'attendees.user': req.user._id }
      ]
    })
    .sort({ startDate: 1 })
    .limit(5)
    .populate('organizer', 'name');
    
    // Get events I'm attending
    const myEvents = await Event.find({
      societyId: req.user.societyId,
      startDate: { $gte: now },
      status: 'upcoming',
      'attendees.user': req.user._id,
      'attendees.status': 'attending'
    })
    .sort({ startDate: 1 })
    .limit(5)
    .populate('organizer', 'name');
    
    res.json({
      upcoming: events,
      attending: myEvents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update society events array
async function updateSocietyEvents(societyId) {
  try {
    const Society = require('../models/Society');
    const society = await Society.findById(societyId);
    
    if (!society) return;
    
    const events = await Event.find({
      societyId,
      status: { $in: ['upcoming', 'ongoing'] }
    }).select('_id');
    
    society.events = events.map(event => event._id);
    await society.save();
  } catch (error) {
    console.error('Error updating society events:', error);
  }
}

module.exports = router; 