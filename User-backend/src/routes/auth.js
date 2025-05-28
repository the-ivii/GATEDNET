const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, flatNo, name, firebaseUid } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { flatNo }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or flat number already exists' 
      });
    }

    // Create new user
    const user = new User({
      email,
      flatNo,
      name,
      firebaseUid
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify user credentials
router.post('/verify', async (req, res) => {
  try {
    const { email, flatNo } = req.body;

    // Check if user exists with the given email and flat number
    const user = await User.findOne({ 
      email: email,
      flatNo: flatNo
    });

    if (!user) {
      return res.status(200).json({ 
        exists: false,
        message: 'User not found. Please contact the admin to register your account.'
      });
    }

    // Return user data without sensitive information
    const userData = {
      _id: user._id,
      email: user.email,
      flatNo: user.flatNo,
      name: user.name,
      role: user.role
    };

    res.json({
      exists: true,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 