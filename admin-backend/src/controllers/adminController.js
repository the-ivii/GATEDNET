const Admin = require('../models/Admin');
const { admin, verifyFirebaseConnection } = require('../firebase');

// Admin sign in
const adminSignIn = async (req, res) => {
    try {
        // Verify Firebase connection first
        const isFirebaseConnected = await verifyFirebaseConnection();
        if (!isFirebaseConnected) {
            return res.status(500).json({ error: 'Firebase service unavailable' });
        }

        const { email, password, name, societyId, role } = req.body;

        // Validate required fields
        if (!email || !password || !name || !societyId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin with this email already exists' });
        }

        // Create user in Firebase
        const userRecord = await admin.auth().createUser({
            email,
            password,
            emailVerified: false
        });

        // Create custom token for the new user
        const customToken = await admin.auth().createCustomToken(userRecord.uid, {
            email: userRecord.email,
            role: role || 'society_admin'
        });

        // Create admin in database
        const adminUser = new Admin({
            email,
            name,
            societyId,
            role: role || 'society_admin',
            firebaseUid: userRecord.uid,
            isActive: true,
            createdAt: new Date()
        });

        await adminUser.save();

        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: adminUser._id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role
            },
            token: customToken
        });
    } catch (error) {
        console.error('Admin sign in error:', error);
        
        // Handle Firebase errors
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ error: 'Password should be at least 6 characters' });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Handle database errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        res.status(500).json({ error: 'Error creating admin account' });
    }
};

// Admin login
const adminLogin = async (req, res) => {
    try {
        // Verify Firebase connection first
        const isFirebaseConnected = await verifyFirebaseConnection();
        if (!isFirebaseConnected) {
            return res.status(500).json({ error: 'Firebase service unavailable' });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find admin in database
        const adminUser = await Admin.findOne({ email });

        if (!adminUser) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        if (!adminUser.isActive) {
            return res.status(403).json({ error: 'Admin account is inactive' });
        }

        // Get the user from Firebase
        const userRecord = await admin.auth().getUserByEmail(email);
        
        // Create custom token for the user
        const customToken = await admin.auth().createCustomToken(userRecord.uid, {
            email: userRecord.email,
            role: adminUser.role,
            adminId: adminUser._id.toString()
        });

        console.log('Generated custom token for user:', {
            uid: userRecord.uid,
            email: userRecord.email,
            hasToken: !!customToken
        });

        // Update last login
        adminUser.lastLogin = new Date();
        await adminUser.save();

        res.status(200).json({
            message: 'Login successful',
            admin: {
                id: adminUser._id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role
            },
            token: customToken
        });
    } catch (error) {
        console.error('Admin login error:', error);
        
        if (error.code === 'auth/user-not-found') {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        res.status(500).json({ error: 'Error during login' });
    }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
    try {
        const admin = req.admin;
        res.status(200).json({
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                societyId: admin.societyId,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({ error: 'Error fetching admin profile' });
    }
};

module.exports = {
    adminSignIn,
    adminLogin,
    getAdminProfile
};