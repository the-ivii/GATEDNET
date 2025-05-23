const express = require('express');
const router = express.Router();
const { 
  createPoll, 
  getAllPolls, 
  getPollById, 
  updatePoll, 
  deletePoll,
  voteOnPoll
} = require('../controllers/pollController');
const { firebaseAuth } = require('../middleware/firebaseAuth');

// Apply authentication middleware to all routes
router.use(firebaseAuth);

// Poll CRUD routes
router.post('/', createPoll);
router.get('/', getAllPolls);
router.get('/:id', getPollById);
router.put('/:id', updatePoll);
router.delete('/:id', deletePoll);

// Voting route
router.post('/:id/vote', voteOnPoll);

module.exports = router;