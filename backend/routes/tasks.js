const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, societyAdmin } = require('../middleware/auth');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all tasks for a society
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, assignedTo } = req.query;
    const query = {
      society: req.user.society,
      isActive: true
    };

    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .limit(50);

    res.json(tasks.map(task => task.getPublicProfile()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks assigned to current user
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      society: req.user.society,
      assignedTo: req.user._id,
      isActive: true
    };

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .sort({ dueDate: 1 })
      .populate('createdBy', 'name')
      .limit(50);

    res.json(tasks.map(task => task.getPublicProfile()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      society: req.user.society,
      isActive: true
    })
    .populate('createdBy', 'name')
    .populate('assignedTo', 'name')
    .populate('comments.user', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task.getPublicProfile());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task (society admin only)
router.post('/', [auth, societyAdmin], [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['maintenance', 'cleaning', 'security', 'event', 'other'])
    .withMessage('Invalid task type'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),
  body('location').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      type,
      priority,
      dueDate,
      assignedTo,
      location
    } = req.body;

    // Create task
    const task = new Task({
      title,
      description,
      type,
      priority,
      society: req.user.society,
      createdBy: req.user._id,
      assignedTo,
      location,
      dueDate
    });

    await task.save();

    // Create notification if task is assigned
    if (assignedTo) {
      const notification = new Notification({
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${title}"`,
        type: 'maintenance',
        priority: priority === 'urgent' ? 'high' : priority,
        society: req.user.society,
        relatedTo: task._id,
        onModel: 'Task',
        recipients: [{
          user: assignedTo,
          isRead: false
        }]
      });

      await notification.save();
    }

    res.status(201).json(task.getPublicProfile());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status
router.patch('/:id/status', auth, [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      society: req.user.society,
      isActive: true
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only assigned user or society admin can update status
    if (
      task.assignedTo?.toString() !== req.user._id.toString() &&
      req.user.role !== 'society_admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.updateStatus(req.body.status);

    // Create notification for status change
    const notification = new Notification({
      title: 'Task Status Updated',
      message: `Task "${task.title}" has been marked as ${req.body.status}`,
      type: 'maintenance',
      priority: task.priority === 'urgent' ? 'high' : task.priority,
      society: req.user.society,
      relatedTo: task._id,
      onModel: 'Task'
    });

    await notification.save();

    res.json(task.getPublicProfile());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to task
router.post('/:id/comments', auth, [
  body('text').notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      society: req.user.society,
      isActive: true
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.addComment(req.user._id, req.body.text);

    // Create notification for new comment
    const notification = new Notification({
      title: 'New Task Comment',
      message: `A new comment has been added to task "${task.title}"`,
      type: 'maintenance',
      priority: task.priority === 'urgent' ? 'high' : task.priority,
      society: req.user.society,
      relatedTo: task._id,
      onModel: 'Task'
    });

    await notification.save();

    res.json(task.getPublicProfile());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task (society admin only)
router.delete('/:id', [auth, societyAdmin], async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      society: req.user.society
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isActive = false;
    await task.save();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;