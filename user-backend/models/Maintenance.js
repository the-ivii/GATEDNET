const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  title: String,
  status: { type: String, enum: ['open', 'resolved', 'in progress'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema); 