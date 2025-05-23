const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Society = require('../models/Society');
const Poll = require('../models/Poll');
const Maintenance = require('../models/Maintenance');
const AmenityBooking = require('../models/AmenityBooking');
const Dispute = require('../models/Dispute');
const Event = require('../models/Event');
const SupportTicket = require('../models/SupportTicket');
const Document = require('../models/Document');
const json2csv = require('json2csv').Parser;
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Helper function to sanitize data for CSV export
const sanitizeData = (data) => {
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Remove sensitive fields
  if (sanitized.password) delete sanitized.password;
  if (sanitized.addressProof) delete sanitized.addressProof;
  if (sanitized.twoFactorSecret) delete sanitized.twoFactorSecret;
  if (sanitized.lockUntil) delete sanitized.lockUntil;
  if (sanitized.sessions) delete sanitized.sessions;
  if (sanitized.fcmTokens) delete sanitized.fcmTokens;
  
  return sanitized;
};

// Export users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({
      societyId: req.user.societyId
    })
    .select('-password -twoFactorSecret -sessions -fcmTokens')
    .lean();
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    
    const sanitizedUsers = users.map(user => {
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        flatNumber: user.flatNumber,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin ? moment(user.lastLogin).format('YYYY-MM-DD HH:mm:ss') : '',
        theme: user.preferences?.theme || 'light',
        language: user.preferences?.language || 'en',
        createdAt: moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss')
      };
      
      return userData;
    });
    
    const fields = Object.keys(sanitizedUsers[0]);
    const json2csvParser = new json2csv({ fields });
    const csv = json2csvParser.parse(sanitizedUsers);
    
    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const fileName = `users_export_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const filePath = path.join(exportDir, fileName);
    
    fs.writeFileSync(filePath, csv);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      
      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export maintenance requests
router.get('/maintenance', adminAuth, async (req, res) => {
  try {
    const { status, category, fromDate, toDate } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (fromDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    }
    
    if (toDate) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(toDate);
      } else {
        query.createdAt = { $lte: new Date(toDate) };
      }
    }
    
    const maintenance = await Maintenance.find(query)
      .populate('reportedBy', 'name email flatNumber')
      .populate('assignedTo', 'name role')
      .lean();
    
    if (maintenance.length === 0) {
      return res.status(404).json({ message: 'No maintenance requests found' });
    }
    
    const sanitizedData = maintenance.map(item => {
      return {
        id: item._id,
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        reportedBy: item.reportedBy?.name || 'Unknown',
        reporterFlat: item.reportedBy?.flatNumber || 'Unknown',
        location: `${item.location?.building || ''} - ${item.location?.floor || ''} - ${item.location?.area || ''}`,
        assignedTo: item.assignedTo?.name || 'Unassigned',
        assigneeRole: item.assignedTo?.role || 'None',
        createdAt: moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        completedAt: item.completedAt ? moment(item.completedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        rating: item.rating?.score || 'Not rated',
        feedback: item.rating?.feedback || '',
        estimatedCost: item.estimatedCost?.amount || 0,
        actualCost: item.actualCost?.amount || 0
      };
    });
    
    const fields = Object.keys(sanitizedData[0]);
    const json2csvParser = new json2csv({ fields });
    const csv = json2csvParser.parse(sanitizedData);
    
    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const fileName = `maintenance_export_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const filePath = path.join(exportDir, fileName);
    
    fs.writeFileSync(filePath, csv);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      
      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export polls and voting data
router.get('/polls', adminAuth, async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    if (status) {
      query.status = status;
    }
    
    if (fromDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    }
    
    if (toDate) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(toDate);
      } else {
        query.createdAt = { $lte: new Date(toDate) };
      }
    }
    
    const polls = await Poll.find(query)
      .populate('createdBy', 'name')
      .lean();
    
    if (polls.length === 0) {
      return res.status(404).json({ message: 'No polls found' });
    }
    
    // First, create a CSV with general poll information
    const pollsData = polls.map(poll => {
      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
      
      return {
        id: poll._id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        createdBy: poll.createdBy?.name || 'Unknown',
        createdAt: moment(poll.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment(poll.endDate).format('YYYY-MM-DD HH:mm:ss'),
        totalVotes: totalVotes,
        totalVoters: poll.voters?.length || 0,
        options: poll.options.length,
        participationRate: totalVotes > 0 ? `${((poll.voters?.length / totalVotes) * 100).toFixed(2)}%` : '0%'
      };
    });
    
    const pollFields = Object.keys(pollsData[0]);
    const pollParser = new json2csv({ fields: pollFields });
    const pollCsv = pollParser.parse(pollsData);
    
    // Now create a CSV with detailed option information
    const optionsData = [];
    polls.forEach(poll => {
      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
      
      poll.options.forEach((option, index) => {
        optionsData.push({
          pollId: poll._id,
          pollTitle: poll.title,
          optionIndex: index + 1,
          optionText: option.text,
          votes: option.votes,
          percentage: totalVotes > 0 ? `${((option.votes / totalVotes) * 100).toFixed(2)}%` : '0%'
        });
      });
    });
    
    const optionFields = Object.keys(optionsData[0]);
    const optionParser = new json2csv({ fields: optionFields });
    const optionCsv = optionParser.parse(optionsData);
    
    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const pollFileName = `polls_export_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const optionFileName = `poll_options_export_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    
    const pollFilePath = path.join(exportDir, pollFileName);
    const optionFilePath = path.join(exportDir, optionFileName);
    
    fs.writeFileSync(pollFilePath, pollCsv);
    fs.writeFileSync(optionFilePath, optionCsv);
    
    // Create a zip file with both CSVs
    const archiver = require('archiver');
    const zipFileName = `polls_export_${moment().format('YYYYMMDD_HHmmss')}.zip`;
    const zipFilePath = path.join(exportDir, zipFileName);
    
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    output.on('close', () => {
      // Send the zip file
      res.download(zipFilePath, zipFileName, (err) => {
        if (err) {
          console.error('Error downloading zip file:', err);
        }
        
        // Delete the files after download
        fs.unlinkSync(pollFilePath);
        fs.unlinkSync(optionFilePath);
        fs.unlinkSync(zipFilePath);
      });
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    
    archive.file(pollFilePath, { name: pollFileName });
    archive.file(optionFilePath, { name: optionFileName });
    
    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export amenity bookings
router.get('/amenity-bookings', adminAuth, async (req, res) => {
  try {
    const { amenityId, status, fromDate, toDate } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    if (amenityId) {
      query.amenityId = amenityId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (fromDate) {
      query.date = { $gte: new Date(fromDate) };
    }
    
    if (toDate) {
      if (query.date) {
        query.date.$lte = new Date(toDate);
      } else {
        query.date = { $lte: new Date(toDate) };
      }
    }
    
    const bookings = await AmenityBooking.find(query)
      .populate('userId', 'name email flatNumber')
      .populate({
        path: 'amenityId',
        select: 'name',
        model: 'Society',
        options: { elemMatch: { _id: '$amenityId' } }
      })
      .lean();
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found' });
    }
    
    // Get amenity names from society
    const society = await Society.findById(req.user.societyId);
    const amenityMap = {};
    
    society.amenities.forEach(amenity => {
      amenityMap[amenity._id.toString()] = amenity.name;
    });
    
    const bookingsData = bookings.map(booking => {
      return {
        id: booking._id,
        amenityName: amenityMap[booking.amenityId?.toString()] || 'Unknown',
        userName: booking.userId?.name || 'Unknown',
        userFlat: booking.userId?.flatNumber || 'Unknown',
        date: moment(booking.date).format('YYYY-MM-DD'),
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        guests: booking.guests || 0,
        purpose: booking.purpose || '',
        paymentStatus: booking.paymentStatus,
        amount: booking.amount || 0,
        createdAt: moment(booking.createdAt).format('YYYY-MM-DD HH:mm:ss')
      };
    });
    
    const fields = Object.keys(bookingsData[0]);
    const json2csvParser = new json2csv({ fields });
    const csv = json2csvParser.parse(bookingsData);
    
    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const fileName = `amenity_bookings_export_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const filePath = path.join(exportDir, fileName);
    
    fs.writeFileSync(filePath, csv);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      
      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export disputes
router.get('/disputes', adminAuth, async (req, res) => {
  try {
    const { status, emotion, fromDate, toDate } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    if (status) {
      query.status = status;
    }
    
    if (emotion) {
      query.emotion = emotion;
    }
    
    if (fromDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    }
    
    if (toDate) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(toDate);
      } else {
        query.createdAt = { $lte: new Date(toDate) };
      }
    }
    
    const disputes = await Dispute.find(query)
      .populate('reportedBy', 'name flatNumber')
      .populate('mediator', 'name role')
      .populate('involvedUsers', 'name flatNumber')
      .lean();
    
    if (disputes.length === 0) {
      return res.status(404).json({ message: 'No disputes found' });
    }
    
    const disputesData = disputes.map(dispute => {
      const involvedNames = dispute.involvedUsers 
        ? dispute.involvedUsers.map(u => u.name).join(', ')
        : '';
      
      return {
        id: dispute._id,
        title: dispute.title,
        description: dispute.description,
        status: dispute.status,
        emotion: dispute.emotion,
        reportedBy: dispute.reportedBy?.name || 'Unknown',
        reporterFlat: dispute.reportedBy?.flatNumber || 'Unknown',
        involvedUsers: involvedNames,
        mediator: dispute.mediator?.name || 'Unassigned',
        mediatorRole: dispute.mediator?.role || 'None',
        isPrivate: dispute.isPrivate ? 'Yes' : 'No',
        comments: dispute.comments?.length || 0,
        createdAt: moment(dispute.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        resolutionDate: dispute.resolutionDate ? moment(dispute.resolutionDate).format('YYYY-MM-DD HH:mm:ss') : '',
        resolutionTime: dispute.resolutionDate 
          ? Math.round((new Date(dispute.resolutionDate) - new Date(dispute.createdAt)) / (1000 * 60 * 60)) + ' hours'
          : 'Not resolved'
      };
    });
    
    const fields = Object.keys(disputesData[0]);
    const json2csvParser = new json2csv({ fields });
    const csv = json2csvParser.parse(disputesData);
    
    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const fileName = `disputes_export_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const filePath = path.join(exportDir, fileName);
    
    fs.writeFileSync(filePath, csv);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      
      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export events and attendance data
router.get('/events', adminAuth, async (req, res) => {
  try {
    const { category, status, fromDate, toDate } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (fromDate) {
      query.startDate = { $gte: new Date(fromDate) };
    }
    
    if (toDate) {
      query.endDate = { $lte: new Date(toDate) };
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'name')
      .populate('attendees.user', 'name flatNumber')
      .lean();
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found' });
    }
    
    // First, create a CSV with general event information
    const eventsData = events.map(event => {
      const attendingCount = event.attendees.filter(a => a.status === 'attending').length;
      const maybeCount = event.attendees.filter(a => a.status === 'maybe').length;
      const notAttendingCount = event.attendees.filter(a => a.status === 'not-attending').length;
      
      return {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        status: event.status,
        location: event.location,
        organizer: event.organizer?.name || 'Unknown',
        startDate: moment(event.startDate).format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment(event.endDate).format('YYYY-MM-DD HH:mm:ss'),
        isPublic: event.isPublic ? 'Yes' : 'No',
        isFeatured: event.isFeatured ? 'Yes' : 'No',
        maxAttendees: event.maxAttendees || 'Unlimited',
        totalAttendees: event.attendees?.length || 0,
        attending: attendingCount,
        maybe: maybeCount,
        notAttending: notAttendingCount,
        comments: event.comments?.length || 0,
        createdAt: moment(event.createdAt).format('YYYY-MM-DD HH:mm:ss')
      };
    });
    
    const eventFields = Object.keys(eventsData[0]);
    const eventParser = new json2csv({ fields: eventFields });
    const eventCsv = eventParser.parse(eventsData);
    
    // Now create a CSV with detailed attendee information
    const attendeesData = [];
    events.forEach(event => {
      event.attendees.forEach(attendee => {
        attendeesData.push({
          eventId: event._id,
          eventTitle: event.title,
          eventDate: moment(event.startDate).format('YYYY-MM-DD'),
          userName: attendee.user?.name || 'Unknown',
          userFlat: attendee.user?.flatNumber || 'Unknown',
          status: attendee.status,
          responseDate: moment(attendee.responseDate).format('YYYY-MM-DD HH:mm:ss')
        });
      });
    });
    
    let attendeeCsv = '';
    if (attendeesData.length > 0) {
      const attendeeFields = Object.keys(attendeesData[0]);
      const attendeeParser = new json2csv({ fields: attendeeFields });
      attendeeCsv = attendeeParser.parse(attendeesData);
    } else {
      attendeeCsv = 'No attendees data available';
    }
    
    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const eventFileName = `events_export_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const attendeeFileName = `event_attendees_export_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    
    const eventFilePath = path.join(exportDir, eventFileName);
    const attendeeFilePath = path.join(exportDir, attendeeFileName);
    
    fs.writeFileSync(eventFilePath, eventCsv);
    fs.writeFileSync(attendeeFilePath, attendeeCsv);
    
    // Create a zip file with both CSVs
    const archiver = require('archiver');
    const zipFileName = `events_export_${moment().format('YYYYMMDD_HHmmss')}.zip`;
    const zipFilePath = path.join(exportDir, zipFileName);
    
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    output.on('close', () => {
      // Send the zip file
      res.download(zipFilePath, zipFileName, (err) => {
        if (err) {
          console.error('Error downloading zip file:', err);
        }
        
        // Delete the files after download
        fs.unlinkSync(eventFilePath);
        fs.unlinkSync(attendeeFilePath);
        fs.unlinkSync(zipFilePath);
      });
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    
    archive.file(eventFilePath, { name: eventFileName });
    archive.file(attendeeFilePath, { name: attendeeFileName });
    
    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export support tickets
router.get('/support-tickets', adminAuth, async (req, res) => {
  try {
    const { status, category, fromDate, toDate } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (fromDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    }
    
    if (toDate) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(toDate);
      } else {
        query.createdAt = { $lte: new Date(toDate) };
      }
    }
    
    const tickets = await SupportTicket.find(query)
      .populate('userId', 'name email flatNumber')
      .populate('assignedTo', 'name role')
      .lean();
    
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'No support tickets found' });
    }
    
    const ticketsData = tickets.map(ticket => {
      const responseTime = ticket.response && ticket.response.length > 1 
        ? Math.round((new Date(ticket.response[1].timestamp) - new Date(ticket.createdAt)) / (1000 * 60 * 60))
        : null;
      
      const resolutionTime = ticket.resolvedAt
        ? Math.round((new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60))
        : null;
      
      return {
        id: ticket._id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        userName: ticket.userId?.name || 'Unknown',
        userFlat: ticket.userId?.flatNumber || 'Unknown',
        assignedTo: ticket.assignedTo?.name || 'Unassigned',
        assigneeRole: ticket.assignedTo?.role || 'None',
        responses: ticket.response?.length || 0,
        ratingScore: ticket.rating?.score || 'Not rated',
        ratingFeedback: ticket.rating?.feedback || '',
        responseTime: responseTime ? `${responseTime} hours` : 'No response',
        resolutionTime: resolutionTime ? `${resolutionTime} hours` : 'Not resolved',
        createdAt: moment(ticket.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        resolvedAt: ticket.resolvedAt ? moment(ticket.resolvedAt).format('YYYY-MM-DD HH:mm:ss') : ''
      };
    });
    
    const fields = Object.keys(ticketsData[0]);
    const json2csvParser = new json2csv({ fields });
    const csv = json2csvParser.parse(ticketsData);
    
    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const fileName = `support_tickets_export_${moment().format('YYYYMMDD_HHmmss')}.csv`;
    const filePath = path.join(exportDir, fileName);
    
    fs.writeFileSync(filePath, csv);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      
      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 