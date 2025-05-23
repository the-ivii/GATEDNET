const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const { auth } = require('../../middleware/auth');
const User = require('../../models/User');

// Initialize Firebase Admin
const serviceAccount = require('../../config/firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Register FCM token
router.post('/register-token', auth, [
  body('token').notEmpty().withMessage('FCM token is required'),
  body('deviceInfo').optional().isObject().withMessage('Device info must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    const { token, deviceInfo } = req.body;

    // Check if token already exists
    const existingToken = user.fcmTokens.find(t => t.token === token);
    if (existingToken) {
      existingToken.deviceInfo = deviceInfo;
      existingToken.lastUsed = new Date();
    } else {
      user.fcmTokens.push({
        token,
        deviceInfo,
        lastUsed: new Date()
      });
    }

    await user.save();
    res.json({ message: 'FCM token registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister FCM token
router.delete('/unregister-token/:token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.fcmTokens = user.fcmTokens.filter(t => t.token !== req.params.token);
    await user.save();
    res.json({ message: 'FCM token unregistered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send push notification
router.post('/send', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
  body('data').optional().isObject().withMessage('Data must be an object'),
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('recipients.*').isMongoId().withMessage('Invalid recipient ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, body, data, recipients } = req.body;

    // Get all FCM tokens for recipients
    const users = await User.find({
      _id: { $in: recipients },
      'preferences.notifications.push': true
    });

    const tokens = users.reduce((acc, user) => {
      return acc.concat(user.fcmTokens.map(t => t.token));
    }, []);

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'No valid FCM tokens found' });
    }

    // Send notification
    const message = {
      notification: {
        title,
        body
      },
      data: data || {},
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });

      // Remove failed tokens from users
      await User.updateMany(
        { 'fcmTokens.token': { $in: failedTokens } },
        { $pull: { fcmTokens: { token: { $in: failedTokens } } } }
      );
    }

    res.json({
      message: 'Notifications sent successfully',
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.put('/preferences', auth, [
  body('enabled').isBoolean().withMessage('Enabled must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    user.preferences.notifications.push = req.body.enabled;
    await user.save();

    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 