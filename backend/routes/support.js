const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SupportTicket = require('../models/SupportTicket');
const { auth, adminAuth } = require('../middleware/auth');
const { emitToUser } = require('../socket');

// Create a new support ticket
router.post('/', auth, [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['technical', 'billing', 'access', 'amenities', 'other']).withMessage('Valid category is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Valid priority is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supportTicket = new SupportTicket({
      ...req.body,
      userId: req.user._id,
      societyId: req.user.societyId,
      response: [{
        text: req.body.description,
        respondedBy: req.user._id,
        timestamp: new Date(),
        isStaff: false
      }]
    });

    await supportTicket.save();
    
    // Notify admins about the new support ticket
    const User = require('../models/User');
    const admins = await User.find({
      societyId: req.user.societyId,
      role: 'admin'
    }).select('_id');
    
    admins.forEach(admin => {
      emitToUser(admin._id, 'new-support-ticket', {
        ticketId: supportTicket._id,
        subject: supportTicket.subject,
        userId: req.user._id,
        userName: req.user.name
      });
    });

    res.status(201).json(supportTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all my support tickets
router.get('/my', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const tickets = await SupportTicket.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name');
    
    const total = await SupportTicket.countDocuments(query);
    
    res.json({
      tickets,
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

// Get all support tickets for society (admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    const tickets = await SupportTicket.find(query)
      .sort({ priority: 1, createdAt: 1 }) // Sort by priority first, then creation date
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name')
      .populate('assignedTo', 'name');
    
    const total = await SupportTicket.countDocuments(query);
    
    res.json({
      tickets,
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

// Get support ticket by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('userId', 'name email phoneNumber flatNumber')
      .populate('assignedTo', 'name')
      .populate('response.respondedBy', 'name role');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    // Check if user is authorized to view this ticket
    const isAdmin = req.user.role === 'admin';
    const isOwner = ticket.userId._id.toString() === req.user._id.toString();
    const isAssigned = ticket.assignedTo && ticket.assignedTo._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isOwner && !isAssigned && ticket.isPrivate) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add response to support ticket
router.post('/:id/response', auth, [
  body('text').trim().notEmpty().withMessage('Response text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    // Check if user is authorized to respond to this ticket
    const isAdmin = req.user.role === 'admin';
    const isOwner = ticket.userId.toString() === req.user._id.toString();
    const isAssigned = ticket.assignedTo && ticket.assignedTo.toString() === req.user._id.toString();
    
    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to respond to this ticket' });
    }
    
    // Staff response if admin or assigned
    const isStaff = isAdmin || isAssigned;
    
    await ticket.addResponse(req.user._id, req.body.text, isStaff);
    
    // If ticket was open and staff responded, change to in-progress
    if (ticket.status === 'open' && isStaff) {
      await ticket.updateStatus('in-progress', req.user._id);
    }
    
    // Notify ticket owner about staff response
    if (isStaff && !isOwner) {
      emitToUser(ticket.userId, 'support-ticket-response', {
        ticketId: ticket._id,
        subject: ticket.subject,
        respondedBy: req.user.name
      });
    }
    
    // Notify assigned staff about owner response
    if (!isStaff && ticket.assignedTo) {
      emitToUser(ticket.assignedTo, 'support-ticket-response', {
        ticketId: ticket._id,
        subject: ticket.subject,
        respondedBy: req.user.name
      });
    }
    
    // Get the updated ticket with populated response
    const updatedTicket = await SupportTicket.findById(ticket._id)
      .populate('response.respondedBy', 'name role');
    
    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update support ticket status (admin only)
router.put('/:id/status', adminAuth, [
  body('status').isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Valid status is required'),
  body('responseText').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    await ticket.updateStatus(req.body.status, req.user._id, req.body.responseText);
    
    // Notify ticket owner about status change
    emitToUser(ticket.userId, 'support-ticket-status-changed', {
      ticketId: ticket._id,
      subject: ticket.subject,
      status: ticket.status,
      updatedBy: req.user.name
    });
    
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign support ticket to staff (admin only)
router.put('/:id/assign', adminAuth, [
  body('staffId').notEmpty().withMessage('Staff ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    // Check if staff exists and belongs to same society
    const User = require('../models/User');
    const staff = await User.findOne({
      _id: req.body.staffId,
      societyId: req.user.societyId,
      role: { $in: ['admin', 'maintenance', 'security'] }
    });
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found in society' });
    }
    
    ticket.assignedTo = staff._id;
    
    // If ticket is open, change to in-progress
    if (ticket.status === 'open') {
      await ticket.updateStatus('in-progress', req.user._id, 'Ticket assigned to staff');
    } else {
      await ticket.save();
    }
    
    // Notify the assigned staff
    emitToUser(staff._id, 'support-ticket-assigned', {
      ticketId: ticket._id,
      subject: ticket.subject,
      userId: ticket.userId
    });
    
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate and provide feedback (ticket owner only)
router.post('/:id/rate', auth, [
  body('score').isInt({ min: 1, max: 5 }).withMessage('Rating score must be between 1 and 5'),
  body('feedback').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return res.status(400).json({ message: 'Only resolved or closed tickets can be rated' });
    }
    
    ticket.rating = {
      score: req.body.score,
      feedback: req.body.feedback || ''
    };
    
    await ticket.save();
    
    // Notify assigned staff about rating
    if (ticket.assignedTo) {
      emitToUser(ticket.assignedTo, 'support-ticket-rated', {
        ticketId: ticket._id,
        subject: ticket.subject,
        score: ticket.rating.score
      });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get support ticket statistics (admin only)
router.get('/statistics/summary', adminAuth, async (req, res) => {
  try {
    const society = req.user.societyId;
    
    // Get counts by status
    const statusCounts = await SupportTicket.aggregate([
      { $match: { societyId: society } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get counts by category
    const categoryCounts = await SupportTicket.aggregate([
      { $match: { societyId: society } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Get average response time
    const ticketsWithResponses = await SupportTicket.find({
      societyId: society,
      response: { $exists: true, $ne: [] }
    });
    
    let avgResponseTimeHours = 0;
    let avgResolutionTimeHours = 0;
    let totalRating = 0;
    let ratingCount = 0;
    
    if (ticketsWithResponses.length > 0) {
      let totalResponseTime = 0;
      let totalResolutionTime = 0;
      
      ticketsWithResponses.forEach(ticket => {
        // Calculate response time
        const responseTime = ticket.getResponseTime();
        if (responseTime !== null) {
          totalResponseTime += responseTime;
        }
        
        // Calculate resolution time
        const resolutionTime = ticket.getResolutionTime();
        if (resolutionTime !== null) {
          totalResolutionTime += resolutionTime;
        }
        
        // Sum ratings
        if (ticket.rating && ticket.rating.score) {
          totalRating += ticket.rating.score;
          ratingCount++;
        }
      });
      
      avgResponseTimeHours = Math.round(totalResponseTime / ticketsWithResponses.length);
      
      const resolvedTickets = ticketsWithResponses.filter(t => t.status === 'resolved' || t.status === 'closed');
      if (resolvedTickets.length > 0) {
        avgResolutionTimeHours = Math.round(totalResolutionTime / resolvedTickets.length);
      }
    }
    
    res.json({
      totalTickets: await SupportTicket.countDocuments({ societyId: society }),
      byStatus: statusCounts.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),
      byCategory: categoryCounts.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),
      avgResponseTimeHours,
      avgResolutionTimeHours,
      avgRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 