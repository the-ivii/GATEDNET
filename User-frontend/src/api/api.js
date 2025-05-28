import axios from 'axios';

// This file contains all API calls and mock implementations for the application

// API configuration
const API_URL = 'http://localhost:5001/api';

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
export const login = async (email, password) => {
  try {
    // First, verify the user exists in our database
    const response = await api.post('/auth/verify', {
      email,
      flatNo: password // Using flatNo as password as per requirements
    });
    
    if (!response.data.exists) {
      throw new Error('User not found. Please contact the admin to register your account.');
    }

    // If user exists, return the user data
    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', 'user-token'); // This will be replaced with actual Firebase token later
    
    return { user, token: 'user-token' };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Polls API
export const getActivePolls = async () => {
  try {
    const response = await api.get('/polls');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch polls');
  }
};

export const getPollById = async (id) => {
  try {
    const response = await api.get(`/polls/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch poll');
  }
};

export const castVote = async (pollId, optionIndex) => {
  try {
    const response = await api.post(`/polls/${pollId}/vote`, { optionIndex });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cast vote');
  }
};

// Maintenance API
export const getMaintenanceUpdates = async () => {
  try {
    const response = await api.get('/maintenance');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch maintenance updates');
  }
};

// Notifications API (using reminders)
export const getNotifications = async () => {
  try {
    const response = await api.get('/reminders');
    return response.data.map(reminder => ({
      id: reminder._id,
      title: reminder.title,
      description: reminder.content,
      createdAt: reminder.createdAt,
      read: false
    }));
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

// Amenities API
export const getAmenities = async () => {
  try {
    const response = await api.get('/amenities');
    return response.data.map(amenity => ({
      id: amenity._id,
      name: amenity.name,
      displayName: amenity.name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }));
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch amenities');
  }
};

export const getAmenityBookings = async () => {
  try {
    const response = await api.get('/amenities/my-bookings');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
  }
};

export const checkAmenityAvailability = async (amenityId, date) => {
  try {
    const response = await api.get(`/amenities/${amenityId}/bookings/${date}`);
    return response.data.length === 0; // Available if no bookings exist
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check availability');
  }
};

export const bookAmenity = async (amenityId, date) => {
  try {
    const response = await api.post(`/amenities/${amenityId}/book`, { date });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to book amenity');
  }
};

// Announcements API
export const getAnnouncements = async () => {
  try {
    const response = await api.get('/announcements');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch announcements');
  }
};

export default api;