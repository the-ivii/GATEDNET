import axios from 'axios';

// This file contains all API calls and mock implementations for the application

// In a real application, this would be set via environment variables
const API_URL = 'http://localhost:5001/api/member';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = async (name, flat) => {
  const res = await api.post('/login', { name, flat });
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const updatePassword = async (currentPassword, newPassword) => {
  const res = await api.post('/update-password', { currentPassword, newPassword });
  return res.data;
};

// Polls API
export const getActivePolls = async () => {
  const res = await api.get('/polls');
  return res.data;
};

export const getPollById = async (id) => {
  const polls = await getActivePolls();
  return polls.find(poll => poll.id === id) || null;
};

export const castVote = async (pollId, optionIndex, memberId) => {
  const res = await api.post('/vote', { pollId, optionIndex, memberId });
  return res.data;
};

// Maintenance API
export const getMaintenanceUpdates = async () => {
  const res = await api.get('/maintenances');
  return res.data;
};

// Notifications/Reminders API
export const getNotifications = async () => {
  const res = await api.get('/reminders');
  return res.data;
};

// Amenities API
export const fetchAmenities = async () => {
  try {
    const response = await axios.get(`${API_URL}/amenities`);
    return response.data;
  } catch (error) {
    console.error('Error fetching amenities:', error);
    throw error;
  }
};

export const getAmenityBookings = async () => {
  // Mocked response for demo
  return [
    {
      id: '1',
      amenityId: '1',
      userId: '1',
      date: '2025-04-22',
      startTime: '10:00',
      endTime: '12:00',
      status: 'confirmed',
    },
  ];
};

export const checkAmenityAvailability = async (amenityId, date) => {
  try {
    const response = await axios.get(`${API_URL}/amenities/${amenityId}/availability`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking amenity availability:', error);
    throw error;
  }
};

export const bookAmenity = async (amenityId, date) => {
  try {
    const response = await axios.post(`${API_URL}/amenities/book`, {
      amenityId,
      date
    });
    return response.data;
  } catch (error) {
    console.error('Error booking amenity:', error);
    throw error;
  }
};

export const cancelAmenityBooking = async (bookingId) => {
  try {
    const response = await axios.delete(`${API_URL}/amenities/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling amenity booking:', error);
    throw error;
  }
};

// Announcements API
export const getAnnouncements = async () => {
  const res = await api.get('/announcements');
  return res.data;
};

export default api;