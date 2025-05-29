const express = require('express');
const router = express.Router();
const { 
  addAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/AnouncementController');
// const { firebaseAuth } = require('../middleware/firebaseAuth'); // Removed Firebase auth middleware import

// *** Removed Firebase authentication middleware application ***
// router.use(firebaseAuth);

// Announcement routes
router.post('/add', addAnnouncement);
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;