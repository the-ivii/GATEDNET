const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Poll = require('./models/Poll');
const Notification = require('./models/Notification');
const Maintenance = require('./models/Maintenance');
const AmenityBooking = require('./models/AmenityBooking');
const Dispute = require('./models/Dispute');
const Event = require('./models/Event');

let io;

// Initialize socket.io
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error('Authentication error: ' + error.message));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);
    
    // Join society room
    const societyRoom = `society-${socket.user.societyId}`;
    socket.join(societyRoom);
    
    // Join personal room for direct messages
    const userRoom = `user-${socket.user._id}`;
    socket.join(userRoom);
    
    // Handle real-time poll updates
    socket.on('join-poll', (pollId) => {
      const pollRoom = `poll-${pollId}`;
      socket.join(pollRoom);
    });
    
    socket.on('leave-poll', (pollId) => {
      const pollRoom = `poll-${pollId}`;
      socket.leave(pollRoom);
    });
    
    // Handle real-time maintenance updates
    socket.on('join-maintenance', (maintenanceId) => {
      const maintenanceRoom = `maintenance-${maintenanceId}`;
      socket.join(maintenanceRoom);
    });
    
    socket.on('leave-maintenance', (maintenanceId) => {
      const maintenanceRoom = `maintenance-${maintenanceId}`;
      socket.leave(maintenanceRoom);
    });
    
    // Handle real-time dispute updates
    socket.on('join-dispute', (disputeId) => {
      const disputeRoom = `dispute-${disputeId}`;
      socket.join(disputeRoom);
    });
    
    socket.on('leave-dispute', (disputeId) => {
      const disputeRoom = `dispute-${disputeId}`;
      socket.leave(disputeRoom);
    });
    
    // Handle real-time document collaboration
    socket.on('join-document', (documentId) => {
      const documentRoom = `document-${documentId}`;
      socket.join(documentRoom);
    });
    
    socket.on('leave-document', (documentId) => {
      const documentRoom = `document-${documentId}`;
      socket.leave(documentRoom);
    });
    
    socket.on('document-change', (data) => {
      const documentRoom = `document-${data.documentId}`;
      socket.to(documentRoom).emit('document-updated', data);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
    });
  });
  
  return io;
};

// Emit event to a specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

// Emit event to a society
const emitToSociety = (societyId, event, data) => {
  if (io) {
    io.to(`society-${societyId}`).emit(event, data);
  }
};

// Emit event to everyone in a poll room
const emitToPoll = (pollId, event, data) => {
  if (io) {
    io.to(`poll-${pollId}`).emit(event, data);
  }
};

// Emit event to everyone in a maintenance room
const emitToMaintenance = (maintenanceId, event, data) => {
  if (io) {
    io.to(`maintenance-${maintenanceId}`).emit(event, data);
  }
};

// Emit event to everyone in a dispute room
const emitToDispute = (disputeId, event, data) => {
  if (io) {
    io.to(`dispute-${disputeId}`).emit(event, data);
  }
};

// Emit event to everyone in a document room
const emitToDocument = (documentId, event, data) => {
  if (io) {
    io.to(`document-${documentId}`).emit(event, data);
  }
};

// Helper function for poll vote updates
const updatePollVotes = async (pollId, optionIndex, userId) => {
  try {
    const poll = await Poll.findById(pollId);
    
    if (!poll) {
      return { success: false, message: 'Poll not found' };
    }
    
    // Check if user already voted
    if (poll.voters.includes(userId)) {
      return { success: false, message: 'User already voted' };
    }
    
    // Update poll option votes
    poll.options[optionIndex].votes += 1;
    poll.voters.push(userId);
    await poll.save();
    
    // Emit real-time update
    const results = poll.getResults();
    emitToPoll(pollId, 'poll-updated', { pollId, results });
    
    return { success: true, data: results };
  } catch (error) {
    console.error('Error updating poll votes:', error);
    return { success: false, message: error.message };
  }
};

// Get socket.io instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initSocket,
  emitToUser,
  emitToSociety,
  emitToPoll,
  emitToMaintenance,
  emitToDispute,
  emitToDocument,
  updatePollVotes,
  getIO
}; 