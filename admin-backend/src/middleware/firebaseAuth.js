const admin = require('firebase-admin');
const Admin = require('../models/Admin');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

// Rate limiter for token verification
const tokenVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many token verification attempts, please try again later' }
});

// In-memory token blacklist (consider using Redis in production)
const tokenBlacklist = new Set();

const firebaseAuth = async (req, res, next) => {
    // Add request ID for tracking
    req.requestId = uuidv4();
    
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'No token provided',
                requestId: req.requestId
            });
        }

        const token = authHeader.split('Bearer ')[1];
        
        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ 
                error: 'Token has been invalidated',
                requestId: req.requestId
            });
        }

        // Apply rate limiting
        await new Promise((resolve, reject) => {
            tokenVerificationLimiter(req, res, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
        
        // Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Check token expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp < currentTime) {
            return res.status(401).json({ 
                error: 'Token has expired',
                requestId: req.requestId
            });
        }
        
        // Get admin details from database
        const adminUser = await Admin.findOne({ email: decodedToken.email });
        
        if (!adminUser) {
            return res.status(403).json({ 
                error: 'Admin not found',
                requestId: req.requestId
            });
        }

        if (!adminUser.isActive) {
            return res.status(403).json({ 
                error: 'Admin account is inactive',
                requestId: req.requestId
            });
        }

        // Attach admin details and token info to request
        req.admin = adminUser;
        req.token = token;
        req.tokenExpiry = decodedToken.exp;
        
        next();
    } catch (error) {
        console.error(`[${req.requestId}] Firebase auth error:`, error);
        
        // Handle specific Firebase auth errors
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ 
                error: 'Token has expired',
                requestId: req.requestId
            });
        }
        
        if (error.code === 'auth/invalid-id-token') {
            return res.status(401).json({ 
                error: 'Invalid token',
                requestId: req.requestId
            });
        }
        
        res.status(401).json({ 
            error: 'Authentication failed',
            requestId: req.requestId
        });
    }
};

// Function to blacklist a token
const blacklistToken = (token) => {
    tokenBlacklist.add(token);
    // Remove from blacklist after token expiry (1 hour)
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 60 * 60 * 1000);
};

module.exports = {
    firebaseAuth,
    blacklistToken
}; 