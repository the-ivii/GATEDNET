const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const logger = require('./utils/logger');
const { initSocket } = require('./socket');
const schedule = require('node-schedule');
const Event = require('./models/Event');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pollRoutes = require('./routes/polls');
const maintenanceRoutes = require('./routes/maintenance');
const amenityRoutes = require('./routes/amenities');
const notificationRoutes = require('./routes/notifications');
const societyRoutes = require('./routes/societies');
const documentRoutes = require('./routes/documents');
const disputeRoutes = require('./routes/disputes');
const eventRoutes = require('./routes/events');
const supportRoutes = require('./routes/support');
const exportRoutes = require('./routes/exports');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = initSocket(server);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/exports', exportRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Schedule tasks for time-based reminders
schedule.scheduleJob('0 * * * *', async () => {
  try {
    logger.info('Running hourly event reminder check');
    
    const now = new Date();
    
    // Find upcoming events within the next reminder period
    const events = await Event.find({
      startDate: { $gt: now },
      status: 'upcoming',
      remindersSent: false,
      'reminder.isEnabled': true
    }).populate('attendees.user');
    
    const { emitToUser } = require('./socket');
    
    events.forEach(async (event) => {
      // Check if it's time to send reminder
      const reminderTime = new Date(event.startDate.getTime() - (event.reminder.time * 60 * 60 * 1000));
      
      if (now >= reminderTime) {
        logger.info(`Sending reminders for event: ${event.title}`);
        
        // Send reminders to attendees
        event.attendees.forEach(attendee => {
          if (attendee.status === 'attending' || attendee.status === 'maybe') {
            emitToUser(attendee.user._id, 'event-reminder', {
              eventId: event._id,
              title: event.title,
              startDate: event.startDate,
              location: event.location
            });
          }
        });
        
        // Mark reminders as sent
        event.remindersSent = true;
        await event.save();
      }
    });
  } catch (error) {
    logger.error('Error in event reminder scheduler:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Export the server for testing purposes
module.exports = { app, server }; 