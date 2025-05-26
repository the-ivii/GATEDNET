const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Society = require('../models/Society');
const geolib = require('geolib');

// Base authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin role middleware
const admin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Society admin role middleware
const societyAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'society_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Geofence authentication middleware
const geofenceAuth = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      throw new Error('Location data required');
    }

    const society = await Society.findById(req.user.societyId);
    if (!society) {
      throw new Error('Society not found');
    }

    const distance = geolib.getDistance(
      { latitude, longitude },
      { latitude: society.geofence.center.latitude, longitude: society.geofence.center.longitude }
    );

    if (distance > society.geofence.radius) {
      throw new Error('Location outside society boundaries');
    }

    next();
  } catch (error) {
    res.status(403).json({ message: error.message || 'Geofence authentication failed' });
  }
};

module.exports = {
  auth,
  admin,
  societyAdmin,
  geofenceAuth
};