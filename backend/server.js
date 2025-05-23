const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { initSocket } = require('./socket');
const path = require('path');
const errorHandler = require('./middleware/error');
const { securityMiddleware, trackSession } = require('./middleware/security');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Set default environment variables for testing
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your_jwt_secret_key_here';
}

// Debug environment variables
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize socket.io
initSocket(server);

// Apply security middleware
app.use(securityMiddleware);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session tracking
app.use(trackSession);

// Database connection with retry logic
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Hardcoded MongoDB URI for testing
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://pg9999:Pg9026228280@cluster0.2zmnt.mongodb.net/gatednet';
}

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/polls', require('./routes/polls'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/amenities', require('./routes/amenities'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/notifications/push', require('./routes/notifications/push'));
app.use('/api/notifications/sms', require('./routes/notifications/sms'));
app.use('/api/geofencing', require('./routes/geofencing'));
app.use('/api/security', require('./routes/security'));
app.use('/api/societies', require('./routes/societies'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/disputes', require('./routes/disputes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/support', require('./routes/support'));
app.use('/api/exports', require('./routes/exports'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

// Start server with port fallback
const startServer = async (port) => {
  try {
    await new Promise((resolve, reject) => {
      server.listen(port, () => {
        console.log(`Server running on port ${port}`);
        resolve();
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying ${port + 1}`);
          reject(err);
        } else {
          console.error('Server error:', err);
          reject(err);
        }
      });
    });
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      startServer(port + 1);
    }
  }
};

const PORT = process.env.PORT || 5000;
startServer(PORT); 