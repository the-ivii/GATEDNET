const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const geolib = require('geolib');
const User = require('../models/User');
const Society = require('../models/Society');
const { generateToken, sendEmail, isValidEmail, isValidPhoneNumber } = require('../utils/helpers');
const { auth } = require('../middleware/auth');

// Register user
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber').custom(value => {
    if (!isValidPhoneNumber(value)) {
      throw new Error('Invalid phone number format');
    }
    return true;
  }),
  body('flatNumber').trim().notEmpty().withMessage('Flat number is required'),
  body('societyId').notEmpty().withMessage('Society ID is required'),
  body('addressProof').notEmpty().withMessage('Address proof is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phoneNumber, flatNumber, societyId, addressProof } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if society exists
    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(400).json({ message: 'Society not found' });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      phoneNumber,
      flatNumber,
      societyId,
      addressProof,
      role: 'resident',
      isVerified: false
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify address
router.post('/verify-address', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const society = await Society.findById(req.user.societyId);

    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }

    const distance = geolib.getDistance(
      { latitude, longitude },
      { latitude: society.geofence.center.latitude, longitude: society.geofence.center.longitude }
    );

    if (distance > society.geofence.radius) {
      return res.status(403).json({ message: 'Location outside society boundaries' });
    }

    res.json({ message: 'Address verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = generateToken(user._id);

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const emailHtml = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    await sendEmail(email, 'Password Reset Request', emailHtml);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all societies
router.get('/society', async (req, res) => {
  try {
    const societies = await Society.find().select('name address');
    res.json(societies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create society
router.post('/society', [
  body('name').trim().notEmpty().withMessage('Society name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('adminEmail').isEmail().withMessage('Valid admin email is required'),
  body('adminName').trim().notEmpty().withMessage('Admin name is required'),
  body('adminPassword').isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters'),
  body('adminPhone').custom(value => {
    if (!isValidPhoneNumber(value)) {
      throw new Error('Invalid phone number format');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, adminEmail, adminName, adminPassword, adminPhone } = req.body;

    // Check if society with same name exists
    let society = await Society.findOne({ name });
    if (society) {
      return res.status(400).json({ message: 'Society already exists' });
    }

    // Create society
    society = new Society({
      name,
      address
    });
    await society.save();

    // Create admin user
    const user = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      phoneNumber: adminPhone,
      societyId: society._id,
      role: 'admin',
      isVerified: true
    });
    await user.save();

    // Update society with admin reference
    society.admin = user._id;
    await society.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      society: {
        id: society._id,
        name: society.name,
        address: society.address
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 