const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, admin } = require('../../middleware/auth');
const User = require('../../models/User');
const SMSTemplate = require('../../models/SMSTemplate');
const { sendSMS } = require('../../utils/smsNotifications');

// Create SMS template (admin only)
router.post('/templates', [auth, admin], [
  body('name').trim().notEmpty().withMessage('Template name is required'),
  body('content').trim().notEmpty().withMessage('Template content is required'),
  body('variables').optional().isArray().withMessage('Variables must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, content, variables } = req.body;
    const template = new SMSTemplate({
      name,
      content,
      variables,
      societyId: req.user.societyId,
      createdBy: req.user._id
    });

    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get SMS templates
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await SMSTemplate.find({ societyId: req.user.societyId });
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send SMS notification (admin only)
router.post('/send', [auth, admin], [
  body('templateId').notEmpty().withMessage('Template ID is required'),
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('recipients.*').isMongoId().withMessage('Invalid recipient ID'),
  body('variables').optional().isObject().withMessage('Variables must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateId, recipients, variables } = req.body;

    // Get template
    const template = await SMSTemplate.findOne({
      _id: templateId,
      societyId: req.user.societyId
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Get recipients
    const users = await User.find({
      _id: { $in: recipients },
      'preferences.notifications.sms': true,
      phoneNumber: { $exists: true, $ne: null }
    });

    if (users.length === 0) {
      return res.status(400).json({ message: 'No valid recipients found' });
    }

    // Send SMS to each recipient
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          const message = template.formatContent(variables);
          await sendSMS(user.phoneNumber, message);
          return { userId: user._id, status: 'success' };
        } catch (error) {
          console.error(`Failed to send SMS to user ${user._id}:`, error);
          return { userId: user._id, status: 'failed', error: error.message };
        }
      })
    );

    res.json({
      message: 'SMS notifications sent',
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send bulk SMS to society
router.post('/send-bulk', [auth, admin], [
  body('templateId').isMongoId().withMessage('Valid template ID is required'),
  body('roles').optional().isArray().withMessage('Roles must be an array'),
  body('variables').optional().isObject().withMessage('Variables must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateId, roles, variables } = req.body;

    // Get template
    const template = await SMSTemplate.findOne({
      _id: templateId,
      societyId: req.user.societyId
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Build query
    const query = {
      societyId: req.user.societyId,
      'preferences.notifications.sms': true,
      phoneNumber: { $exists: true, $ne: null }
    };

    if (roles && roles.length > 0) {
      query.role = { $in: roles };
    }

    // Get users
    const users = await User.find(query);

    if (users.length === 0) {
      return res.status(400).json({ message: 'No valid recipients found' });
    }

    // Send SMS to each user
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          const message = template.formatContent(variables);
          await sendSMS(user.phoneNumber, message);
          return { userId: user._id, status: 'success' };
        } catch (error) {
          console.error(`Failed to send SMS to user ${user._id}:`, error);
          return { userId: user._id, status: 'failed', error: error.message };
        }
      })
    );

    res.json({
      message: 'Bulk SMS sending completed',
      totalRecipients: users.length,
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update SMS notification preferences
router.put('/preferences', auth, [
  body('enabled').isBoolean().withMessage('Enabled must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    user.preferences.notifications.sms = req.body.enabled;
    await user.save();

    res.json({ message: 'SMS notification preferences updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;