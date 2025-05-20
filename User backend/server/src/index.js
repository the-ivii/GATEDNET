import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock data for development
const mockData = {
  polls: [
    { 
      _id: '1', 
      title: 'Security Enhancement', 
      votesFor: 45, 
      totalVotes: 100,
      description: 'Should we implement new security measures?'
    },
    { 
      _id: '2', 
      title: 'Parking Allocation', 
      votesFor: 30, 
      totalVotes: 100,
      description: 'Should we change the parking allocation system?'
    }
  ],
  issues: [
    { _id: '1', title: 'Elevator Not Working', status: 'OPEN' },
    { _id: '2', title: 'Power Outage', status: 'RESOLVED' }
  ],
  notifications: [
    { _id: '1', message: 'Reminder: AGM meeting to be held on 1 May, 2025' },
    { _id: '2', message: 'Reminder: New poll created for Security Enhancement' },
    { _id: '3', message: 'Reminder: Parking allocation form will not accept responses after 22 April, 2025 6:00 PM IST.' }
  ],
  bookings: [
    { 
      _id: '1', 
      date: '2024-04-22', 
      amenityName: 'Clubhouse',
      status: 'confirmed',
      time: '6:00 PM - 9:00 PM'
    },
    {
      _id: '2',
      date: '2024-04-25',
      amenityName: 'Tennis Court',
      status: 'pending',
      time: '4:00 PM - 6:00 PM'
    }
  ],
  announcements: [
    { 
      _id: '1', 
      title: 'New Security Measures Implemented',
      description: 'We have implemented new security measures in the society.',
      createdAt: '2024-04-20T10:00:00Z'
    }
  ]
};

// Mock data for notifications
const notifications = [
  {
    _id: '1',
    title: 'New Poll Available',
    message: 'A new poll on "Community Garden Proposal" is now available for voting.',
    createdAt: '2024-03-20T10:00:00Z',
    read: false
  },
  {
    _id: '2',
    title: 'Payment Reminder',
    message: 'Your maintenance payment for March is due in 5 days.',
    createdAt: '2024-03-18T14:30:00Z',
    read: true
  },
  {
    _id: '3',
    title: 'Amenity Booking Confirmed',
    message: 'Your booking of the Community Hall for March 25th has been confirmed.',
    createdAt: '2024-03-15T09:15:00Z',
    read: true
  }
];

// Mock data for updates
const updates = [
  {
    _id: '1',
    title: 'New Playground Equipment',
    description: 'The society has approved installation of new playground equipment next month. The new equipment includes modern swings, slides, and climbing structures.',
    createdAt: '2024-03-20T10:00:00Z',
    image: 'https://example.com/playground.jpg',
    link: 'https://example.com/playground-details'
  },
  {
    _id: '2',
    title: 'Water Supply Interruption',
    description: 'Scheduled water supply interruption on March 25th from 10AM to 2PM for maintenance. Please store water accordingly.',
    createdAt: '2024-03-18T14:30:00Z'
  },
  {
    _id: '3',
    title: 'Annual General Meeting',
    description: 'The AGM is scheduled for April 5th at 6PM in the community hall. All residents are requested to attend.',
    createdAt: '2024-03-15T09:15:00Z',
    link: 'https://example.com/agm-details'
  }
];

// Mock data for user settings
const userSettings = {
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  privacy: {
    showProfile: true,
    showContact: false
  },
  theme: 'light'
};

// API Routes
app.get('/api/polls/active', (req, res) => {
  res.json({ data: mockData.polls });
});

app.post('/api/polls/:id/vote', (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body;
  
  const poll = mockData.polls.find(p => p._id === id);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  if (optionId === 'for') {
    poll.votesFor += 1;
  }
  poll.totalVotes += 1;

  res.json({ data: poll });
});

app.get('/api/issues', (req, res) => {
  res.json({ data: mockData.issues });
});

app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    data: notifications
  });
});

app.get('/api/amenities/bookings', (req, res) => {
  res.json({ data: mockData.bookings });
});

app.post('/api/amenities/bookings/:id/cancel', (req, res) => {
  const { id } = req.params;
  
  const booking = mockData.bookings.find(b => b._id === id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  booking.status = 'cancelled';
  res.json({ data: booking });
});

app.get('/api/announcements', (req, res) => {
  res.json({ data: mockData.announcements });
});

// Mark a notification as read
app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notification = notifications.find(n => n._id === id);
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  notification.read = true;
  
  res.json({
    success: true,
    data: notification
  });
});

// Mark all notifications as read
app.post('/api/notifications/read-all', (req, res) => {
  notifications.forEach(notification => {
    notification.read = true;
  });
  
  res.json({
    success: true,
    data: notifications
  });
});

// Get all updates
app.get('/api/updates', (req, res) => {
  res.json({
    success: true,
    data: updates
  });
});

// Get user settings
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: userSettings
  });
});

// Update notification settings
app.put('/api/settings/notifications', (req, res) => {
  const { type, enabled } = req.body;
  
  if (!type || typeof enabled !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'Invalid request parameters'
    });
  }

  if (!userSettings.notifications.hasOwnProperty(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid notification type'
    });
  }

  userSettings.notifications[type] = enabled;
  
  res.json({
    success: true,
    data: userSettings.notifications
  });
});

// Update privacy settings
app.put('/api/settings/privacy', (req, res) => {
  const { type, enabled } = req.body;
  
  if (!type || typeof enabled !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'Invalid request parameters'
    });
  }

  if (!userSettings.privacy.hasOwnProperty(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid privacy setting type'
    });
  }

  userSettings.privacy[type] = enabled;
  
  res.json({
    success: true,
    data: userSettings.privacy
  });
});

// Update theme
app.put('/api/settings/theme', (req, res) => {
  const { theme } = req.body;
  
  if (!theme || !['light', 'dark'].includes(theme)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid theme value'
    });
  }

  userSettings.theme = theme;
  
  res.json({
    success: true,
    data: { theme: userSettings.theme }
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'GateNet API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});