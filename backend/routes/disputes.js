const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Dispute = require('../models/Dispute');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { emitToDispute, emitToUser, emitToSociety } = require('../socket');

// Create a new dispute
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('emotion').isIn(['frustrated', 'concerned', 'neutral', 'hopeful']).withMessage('Valid emotion is required'),
  body('involvedUsers').optional().isArray().withMessage('Involved users must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dispute = new Dispute({
      ...req.body,
      reportedBy: req.user._id,
      societyId: req.user.societyId
    });

    await dispute.save();
    
    // Notify admins about the new dispute
    const admins = await User.find({
      societyId: req.user.societyId,
      role: 'admin'
    }).select('_id');
    
    admins.forEach(admin => {
      emitToUser(admin._id, 'new-dispute', {
        disputeId: dispute._id,
        title: dispute.title,
        reportedBy: req.user.name
      });
    });
    
    // Notify involved users
    if (dispute.involvedUsers && dispute.involvedUsers.length > 0) {
      dispute.involvedUsers.forEach(userId => {
        if (userId.toString() !== req.user._id.toString()) {
          emitToUser(userId, 'dispute-involved', {
            disputeId: dispute._id,
            title: dispute.title,
            reportedBy: req.user.name
          });
        }
      });
    }

    res.status(201).json(dispute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all disputes for society (admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    if (status) {
      query.status = status;
    }
    
    const disputes = await Dispute.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('reportedBy', 'name')
      .populate('mediator', 'name')
      .populate('involvedUsers', 'name');
    
    const total = await Dispute.countDocuments(query);
    
    res.json({
      disputes,
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

// Get my disputes (reported by me or involving me)
router.get('/my', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { 
      societyId: req.user.societyId,
      $or: [
        { reportedBy: req.user._id },
        { involvedUsers: req.user._id }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    const disputes = await Dispute.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('reportedBy', 'name')
      .populate('mediator', 'name')
      .populate('involvedUsers', 'name');
    
    const total = await Dispute.countDocuments(query);
    
    res.json({
      disputes,
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

// Get dispute by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('reportedBy', 'name')
      .populate('mediator', 'name')
      .populate('involvedUsers', 'name')
      .populate('comments.user', 'name');
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    // Check if user is authorized to view this dispute
    const isAdmin = req.user.role === 'admin';
    const isReporter = dispute.reportedBy._id.toString() === req.user._id.toString();
    const isInvolved = dispute.involvedUsers.some(user => user._id.toString() === req.user._id.toString());
    const isMediator = dispute.mediator && dispute.mediator._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isReporter && !isInvolved && !isMediator && dispute.isPrivate) {
      return res.status(403).json({ message: 'Not authorized to view this dispute' });
    }
    
    res.json(dispute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update dispute status (admin only)
router.put('/:id/status', adminAuth, [
  body('status').isIn(['pending', 'in-mediation', 'resolved', 'escalated']).withMessage('Valid status is required'),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const dispute = await Dispute.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    await dispute.updateStatus(req.body.status, req.body.comment, req.user._id);
    
    // Notify involved parties about status update
    emitToDispute(dispute._id, 'dispute-status-updated', {
      disputeId: dispute._id,
      status: dispute.status,
      updatedBy: req.user.name
    });
    
    // Also send individual notifications to reporter and involved users
    emitToUser(dispute.reportedBy, 'dispute-updated', {
      disputeId: dispute._id,
      title: dispute.title,
      status: dispute.status
    });
    
    if (dispute.involvedUsers && dispute.involvedUsers.length > 0) {
      dispute.involvedUsers.forEach(userId => {
        emitToUser(userId, 'dispute-updated', {
          disputeId: dispute._id,
          title: dispute.title,
          status: dispute.status
        });
      });
    }
    
    res.json(dispute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign mediator to dispute (admin only)
router.put('/:id/mediator', adminAuth, [
  body('mediatorId').notEmpty().withMessage('Mediator ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const dispute = await Dispute.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    // Check if mediator exists and belongs to same society
    const mediator = await User.findOne({
      _id: req.body.mediatorId,
      societyId: req.user.societyId
    });
    
    if (!mediator) {
      return res.status(404).json({ message: 'Mediator not found in society' });
    }
    
    dispute.mediator = mediator._id;
    
    // If dispute is in pending state, change to in-mediation
    if (dispute.status === 'pending') {
      await dispute.updateStatus('in-mediation', 'Mediator assigned', req.user._id);
    } else {
      await dispute.save();
    }
    
    // Notify the assigned mediator
    emitToUser(mediator._id, 'assigned-as-mediator', {
      disputeId: dispute._id,
      title: dispute.title
    });
    
    res.json(dispute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to dispute
router.post('/:id/comments', auth, [
  body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    // Check if user is authorized to comment on this dispute
    const isAdmin = req.user.role === 'admin';
    const isReporter = dispute.reportedBy.toString() === req.user._id.toString();
    const isInvolved = dispute.involvedUsers.some(userId => userId.toString() === req.user._id.toString());
    const isMediator = dispute.mediator && dispute.mediator.toString() === req.user._id.toString();
    
    if (!isAdmin && !isReporter && !isInvolved && !isMediator) {
      return res.status(403).json({ message: 'Not authorized to comment on this dispute' });
    }
    
    await dispute.addComment(req.user._id, req.body.text);
    
    // Get the newly added comment with populated user
    const updatedDispute = await Dispute.findById(dispute._id)
      .populate('comments.user', 'name');
    
    const newComment = updatedDispute.comments[updatedDispute.comments.length - 1];
    
    // Emit real-time update
    emitToDispute(dispute._id, 'dispute-comment-added', {
      disputeId: dispute._id,
      comment: newComment
    });
    
    res.json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update resolution notes (admin or mediator only)
router.put('/:id/resolution', auth, [
  body('resolutionNotes').trim().notEmpty().withMessage('Resolution notes are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    // Check if user is authorized to update resolution notes
    const isAdmin = req.user.role === 'admin';
    const isMediator = dispute.mediator && dispute.mediator.toString() === req.user._id.toString();
    
    if (!isAdmin && !isMediator) {
      return res.status(403).json({ message: 'Not authorized to update resolution notes' });
    }
    
    dispute.resolutionNotes = req.body.resolutionNotes;
    await dispute.save();
    
    res.json(dispute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update dispute privacy setting (admin only)
router.put('/:id/privacy', adminAuth, [
  body('isPrivate').isBoolean().withMessage('isPrivate must be a boolean value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const dispute = await Dispute.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    dispute.isPrivate = req.body.isPrivate;
    await dispute.save();
    
    res.json(dispute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dispute statistics (admin only)
router.get('/statistics/summary', adminAuth, async (req, res) => {
  try {
    const society = req.user.societyId;
    
    // Get counts by status
    const statusCounts = await Dispute.aggregate([
      { $match: { societyId: mongoose.Types.ObjectId(society) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get counts by emotion
    const emotionCounts = await Dispute.aggregate([
      { $match: { societyId: mongoose.Types.ObjectId(society) } },
      { $group: { _id: '$emotion', count: { $sum: 1 } } }
    ]);
    
    // Get resolution times
    const resolvedDisputes = await Dispute.find({
      societyId: society,
      status: 'resolved',
      resolutionDate: { $exists: true }
    });
    
    let avgResolutionTimeHours = 0;
    
    if (resolvedDisputes.length > 0) {
      const totalHours = resolvedDisputes.reduce((sum, dispute) => {
        const createdTime = new Date(dispute.createdAt).getTime();
        const resolvedTime = new Date(dispute.resolutionDate).getTime();
        const hours = (resolvedTime - createdTime) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      
      avgResolutionTimeHours = Math.round(totalHours / resolvedDisputes.length);
    }
    
    res.json({
      totalDisputes: await Dispute.countDocuments({ societyId: society }),
      byStatus: statusCounts.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),
      byEmotion: emotionCounts.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),
      avgResolutionTimeHours
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 