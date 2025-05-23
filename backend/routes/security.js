const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { auth } = require('../middleware/auth');
const { requireTwoFactor, checkDefaultPassword } = require('../middleware/security');
const User = require('../models/User');
const { generateToken, sendEmail } = require('../utils/helpers');

// Setup 2FA
router.post('/setup-2fa', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `GatedNet:${user.email}`
    });
    
    // Save secret to user
    user.twoFactorSecret = secret.base32;
    await user.save();
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
    res.json({
      secret: secret.base32,
      qrCode
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', auth, [
  body('token').isLength({ min: 6, max: 6 }).withMessage('Invalid token')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    const { token } = req.body;

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disable 2FA
router.post('/disable-2fa', auth, [
  body('token').isLength({ min: 6, max: 6 }).withMessage('Invalid token')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    const { token } = req.body;

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change default password
router.post('/change-default-password', auth, checkDefaultPassword, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    const { currentPassword, newPassword } = req.body;

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.isDefaultPassword = false;
    user.lastPasswordChange = new Date();
    await user.save();

    // Send email notification
    const emailHtml = `
      <h1>Password Changed</h1>
      <p>Your password has been successfully changed.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    `;
    await sendEmail(user.email, 'Password Changed', emailHtml);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set security questions
router.post('/security-questions', auth, [
  body('questions').isArray({ min: 3, max: 3 }).withMessage('Exactly 3 security questions are required'),
  body('questions.*.question').notEmpty().withMessage('Question is required'),
  body('questions.*.answer').notEmpty().withMessage('Answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    user.securityQuestions = req.body.questions;
    await user.save();

    res.json({ message: 'Security questions set successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify security questions
router.post('/verify-security-questions', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('answers').isArray({ min: 3, max: 3 }).withMessage('Exactly 3 answers are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, answers } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isVerified = user.securityQuestions.every((q, i) => 
      q.answer.toLowerCase() === answers[i].toLowerCase()
    );

    if (!isVerified) {
      return res.status(400).json({ message: 'Invalid answers' });
    }

    // Generate reset token
    const resetToken = generateToken(user._id);

    res.json({ 
      message: 'Security questions verified',
      resetToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Revoke session
router.delete('/sessions/:token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.sessions = user.sessions.filter(session => session.token !== req.params.token);
    await user.save();
    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update theme preference
router.put('/theme', auth, [
  body('theme').isIn(['light', 'dark']).withMessage('Invalid theme')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    user.preferences.theme = req.body.theme;
    await user.save();

    res.json({ message: 'Theme updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 