const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Login attempt limiter
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after an hour'
});

// Security middleware
const securityMiddleware = [
  // Set security HTTP headers
  helmet(),
  
  // Enable CORS
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  }),
  
  // Data sanitization against NoSQL query injection
  mongoSanitize(),
  
  // Data sanitization against XSS
  xss(),
  
  // Prevent parameter pollution
  hpp(),
  
  // Rate limiting
  limiter
];

// Session tracking middleware
const trackSession = async (req, res, next) => {
  if (req.user) {
    try {
      const session = {
        token: req.token,
        device: req.headers['user-agent'],
        ip: req.ip,
        lastActive: new Date()
      };
      
      await req.user.updateOne({
        $push: { 
          sessions: {
            $each: [session],
            $slice: -5 // Keep only last 5 sessions
          }
        }
      });
    } catch (error) {
      console.error('Session tracking error:', error);
    }
  }
  next();
};

// Check for default password
const checkDefaultPassword = async (req, res, next) => {
  if (req.user && req.user.isDefaultPassword) {
    return res.status(403).json({
      message: 'Please change your default password',
      requirePasswordChange: true
    });
  }
  next();
};

// Two-factor authentication middleware
const requireTwoFactor = async (req, res, next) => {
  if (req.user && req.user.twoFactorEnabled && !req.session.twoFactorVerified) {
    return res.status(403).json({
      message: 'Two-factor authentication required',
      requireTwoFactor: true
    });
  }
  next();
};

module.exports = {
  securityMiddleware,
  loginLimiter,
  trackSession,
  checkDefaultPassword,
  requireTwoFactor
}; 