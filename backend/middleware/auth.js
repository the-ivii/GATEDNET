const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        throw new Error();
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

const geofenceAuth = async (req, res, next) => {
  try {
    await auth(req, res, async () => {
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
    });
  } catch (error) {
    res.status(403).json({ message: error.message || 'Geofence authentication failed' });
  }
};

module.exports = {
  auth,
  adminAuth,
  geofenceAuth
}; 