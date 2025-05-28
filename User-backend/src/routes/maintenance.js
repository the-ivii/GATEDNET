const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const auth = require('../middleware/auth');

// Get all maintenance updates
router.get('/', auth, async (req, res) => {
  try {
    const maintenanceUpdates = await Maintenance.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(maintenanceUpdates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific maintenance update
router.get('/:id', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance update not found' });
    }

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 