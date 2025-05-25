const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Create a new task
router.post('/', taskController.createTask);

// Get all tasks
router.get('/', taskController.getAllTasks);

// Get task by ID
router.get('/:id', taskController.getTaskById);

// Update task
router.put('/:id', taskController.updateTask);

// Delete task
router.delete('/:id', taskController.deleteTask);

// Get tasks by status
router.get('/status/:status', taskController.getTasksByStatus);

// Get tasks by assignee
router.get('/assignee/:userId', taskController.getTasksByAssignee);

module.exports = router; 