const Admin = require('../models/Admin');
// const { admin, verifyFirebaseConnection } = require('../firebase'); // Keep admin if needed elsewhere, otherwise remove // Removed import

// Admin sign in
const adminSignIn = async (req, res) => {
    try {
        // *** Removed Firebase connection verification ***
        // const isFirebaseConnected = await verifyFirebaseConnection();
        // if (!isFirebaseConnected) {
        //     return res.status(500).json({ error: 'Firebase service unavailable' });
        // }

        const { email, password, name, societyId, role } = req.body;

        // Validate required fields
        if (!email || !password || !name || !societyId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if admin already exists in DB
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin with this email already exists' });
        }

        // *** Removed Firebase user creation and token generation ***
        // Create user in Firebase
        // const userRecord = await admin.auth().createUser({
        //     email,
        //     password,
        //     emailVerified: false
        // });
        // Create custom token for the new user
        // const customToken = await admin.auth().createCustomToken(userRecord.uid, {
        //     email: userRecord.email,
        //     role: role || 'society_admin'
        // });

        // Create admin in database (assuming password is not stored in DB for now)
        const adminUser = new Admin({
            email,
            name,
            societyId,
            role: role || 'society_admin',
            // firebaseUid: userRecord.uid, // Removed Firebase UID
            isActive: true,
            createdAt: new Date()
        });

        await adminUser.save();

        // *** Return a placeholder token (INSECURE without proper auth) ***
        const customToken = 'placeholder_token';

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
        
        // *** Removed Firebase error handling ***
        // if (error.code === 'auth/email-already-exists') {
        //     return res.status(400).json({ error: 'Email already exists' });
        // }
        // if (error.code === 'auth/weak-password') {
        //     return res.status(400).json({ error: 'Password should be at least 6 characters' });
        // }
        // if (error.code === 'auth/invalid-email') {
        //     return res.status(400).json({ error: 'Invalid email format' });
        // }

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
        // *** Removed Firebase connection verification ***
        // const isFirebaseConnected = await verifyFirebaseConnection();
        // if (!isFirebaseConnected) {
        //     return res.status(500).json({ error: 'Firebase service unavailable' });
        // }

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

        // *** Removed Firebase authentication and token generation ***
        // Get the user from Firebase
        // const userRecord = await admin.auth().getUserByEmail(email);
        // Create custom token for the user
        // const customToken = await admin.auth().createCustomToken(userRecord.uid, {
        //     email: userRecord.email,
        //     role: adminUser.role,
        //     adminId: adminUser._id.toString()
        // });
        
        // *** Generate a placeholder token (INSECURE without proper auth) ***
        const customToken = 'placeholder_token';

        console.log('Generated placeholder token for user:', {
            email: adminUser.email,
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
        
        // *** Removed Firebase error handling ***
        // if (error.code === 'auth/user-not-found') {
        //     return res.status(401).json({ error: 'Invalid email or password' });
        // }
        // if (error.code === 'auth/invalid-email') {
        //     return res.status(400).json({ error: 'Invalid email format' });
        // }
        
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