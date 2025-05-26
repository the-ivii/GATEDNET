import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  getProfile: () => api.get(API_ENDPOINTS.AUTH.PROFILE),
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT)
};

// Notification service
export const notificationService = {
  getAll: () => api.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL),
  getUnreadCount: () => api.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD_COUNT),
  markAsRead: (id) => api.put(`${API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ}/${id}`),
  markAllAsRead: () => api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ)
};

// Poll service
export const pollService = {
  getAll: () => api.get(API_ENDPOINTS.POLLS.GET_ALL),
  getActive: () => api.get(API_ENDPOINTS.POLLS.GET_ACTIVE),
  getById: (id) => api.get(`${API_ENDPOINTS.POLLS.GET_BY_ID}/${id}`),
  vote: (pollId, optionIndex) => api.post(`${API_ENDPOINTS.POLLS.VOTE}/${pollId}`, { optionIndex })
};

// Task service
export const taskService = {
  getAll: () => api.get(API_ENDPOINTS.TASKS.GET_ALL),
  getMyTasks: () => api.get(API_ENDPOINTS.TASKS.GET_MY_TASKS),
  getById: (id) => api.get(`${API_ENDPOINTS.TASKS.GET_BY_ID}/${id}`),
  updateStatus: (id, status) => api.put(`${API_ENDPOINTS.TASKS.UPDATE_STATUS}/${id}`, { status }),
  addComment: (id, comment) => api.post(`${API_ENDPOINTS.TASKS.ADD_COMMENT}/${id}`, { comment })
};

// Announcement service
export const announcementService = {
  getAll: () => api.get(API_ENDPOINTS.ANNOUNCEMENTS.GET_ALL),
  getById: (id) => api.get(`${API_ENDPOINTS.ANNOUNCEMENTS.GET_BY_ID}/${id}`)
};

// Amenity service
export const amenityService = {
  getAll: () => api.get(API_ENDPOINTS.AMENITIES.GET_ALL),
  getBookings: () => api.get(API_ENDPOINTS.AMENITIES.GET_BOOKINGS),
  bookAmenity: (amenityId, bookingData) => api.post(`${API_ENDPOINTS.AMENITIES.BOOK}/${amenityId}`, bookingData),
  cancelBooking: (bookingId) => api.delete(`${API_ENDPOINTS.AMENITIES.CANCEL_BOOKING}/${bookingId}`)
};

export default api;