const express = require('express');
const router = express.Router();
const { adminSignIn, adminLogin, getAdminProfile } = require('../controllers/adminController');
const { firebaseAuth, blacklistToken } = require('../middleware/firebaseAuth');

// Public routes
router.post('/signin', adminSignIn);
router.post('/login', adminLogin);

// Protected routes
router.use(firebaseAuth);

router.get('/profile', getAdminProfile);

router.post('/logout', (req, res) => {
    const token = req.token;
    if (token) {
        blacklistToken(token);
    }
    res.clearCookie("refreshToken");
    res.json({ 
        message: 'Logout successful',
        requestId: req.requestId
    });
});

module.exports = router; 