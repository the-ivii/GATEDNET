const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['announcement', 'maintenance', 'poll', 'event', 'payment', 'general']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date
  }],
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Poll', 'Maintenance', 'Event', 'Payment']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
notificationSchema.index({ society: 1, createdAt: -1 });
notificationSchema.index({ 'recipients.user': 1, createdAt: -1 });

// Method to get public profile
notificationSchema.methods.getPublicProfile = function() {
  const notification = this.toObject();
  delete notification.__v;
  return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;