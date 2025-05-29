import { create } from 'zustand';
import * as api from '../api/api';

// Initialize store with default state and actions
const useStore = create((set, get) => ({
  // Auth state
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Data
  activePolls: [],
  maintenanceUpdates: [],
  notifications: [],
  amenities: [],
  amenityBookings: [],
  announcements: [],
  
  // UI state
  activePollModal: null,
  activeAmenityModal: false,
  isLoading: false,
  error: null,
  pollError: null,
  isLoadingAmenities: false,
  amenityError: null,
  
  // Actions
  // Action: Handles user login and authentication
  login: async (email, flat) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login(email, flat);
      console.log('Login response:', res);
      const member = res.member;
      // Explicitly add a mock email for testing purposes
      const userWithEmail = { ...member, email: member.email || 'mockuser@example.com' };
      set({
        user: userWithEmail,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('user', JSON.stringify(userWithEmail));
      localStorage.setItem('token', 'mock-token'); // Optionally set a token if you implement JWT
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message || error);
      set({
        error: error.response?.data?.message || error.message || 'Invalid credentials',
        isLoading: false,
      });
    }
  },
  
  logout: () => {
    api.logout();
    set({
      user: null,
      isAuthenticated: false,
      activePolls: [],
      maintenanceUpdates: [],
      notifications: [],
      amenities: [],
      amenityBookings: [],
      announcements: [],
    });
    // No need to explicitly redirect here, the router should handle based on isAuthenticated state
  },
  
  updateUserSettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would call an API
      const updatedUser = { ...get().user, ...settings };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update settings', isLoading: false });
    }
  },
  
  updatePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await api.updatePassword(currentPassword, newPassword);
      // After successful password update, log out the user
      get().logout();
      set({ isLoading: false });
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to update password', 
        isLoading: false 
      });
      throw error; // Re-throw to handle in the component
    }
  },
  
  // Action: Fetches full user details from backend
  fetchUserDetails: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.getUserProfile();
      set({ user, isLoading: false });
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch user details',
        isLoading: false,
      });
    }
  },
  
  fetchActivePolls: async () => {
    set({ isLoading: true, pollError: null });
    try {
      const polls = await api.getActivePolls();
      console.log('Fetched polls in store:', polls);
      set({ activePolls: polls || [], isLoading: false }); // Ensure activePolls is always an array
    } catch (error) {
      console.error('Error fetching polls in store:', error);
      set({
        pollError: error.response?.data?.message || error.message || 'Failed to fetch polls',
        isLoading: false,
      });
    }
  },
  
  fetchMaintenanceUpdates: async () => {
    set({ isLoading: true, error: null });
    try {
      const updates = await api.getMaintenanceUpdates();
      set({ maintenanceUpdates: updates || [], isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch maintenance updates',
        isLoading: false,
      });
    }
  },
  
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await api.getNotifications();
      set({ notifications: notifications || [], isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },
  
  fetchAmenities: async () => {
    try {
      set({ isLoadingAmenities: true, amenityError: null });
      console.log('Attempting to fetch amenities...');
      const amenities = await api.fetchAmenities();
      console.log('Amenities fetched:', amenities);
      set({ amenities, isLoadingAmenities: false });
    } catch (error) {
      console.error('Error fetching amenities in store:', error);
      set({ amenityError: error.message, isLoadingAmenities: false });
      throw error;
    }
  },
  
  checkAmenityAvailability: async (amenityId, date) => {
    try {
      const availability = await api.checkAmenityAvailability(amenityId, date);
      return availability;
    } catch (error) {
      throw error;
    }
  },
  
  bookAmenity: async (amenityId, date) => {
    try {
      const memberId = get().user?._id;
      if (!memberId) throw new Error('User not logged in');
      const booking = await api.bookAmenity(amenityId, date, memberId);
      // Update the bookings list
      set(state => ({
        amenityBookings: [...state.amenityBookings, booking]
      }));
      return booking;
    } catch (error) {
      throw error;
    }
  },
  
  cancelAmenityBooking: async (bookingId) => {
    try {
      await api.cancelAmenityBooking(bookingId);
      // Remove the cancelled booking from the list
      set(state => ({
        amenityBookings: state.amenityBookings.filter(booking => booking.id !== bookingId)
      }));
    } catch (error) {
      throw error;
    }
  },
  
  fetchAnnouncements: async () => {
    set({ isLoading: true, error: null });
    try {
      const announcements = await api.getAnnouncements();
      set({ announcements: announcements || [], isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch announcements',
        isLoading: false,
      });
    }
  },
  
  togglePollModal: (pollId) => {
    set({ activePollModal: pollId });
  },
  
  toggleAmenityModal: (show) => {
    set({ activeAmenityModal: show });
  },
  
  castVote: async (pollId, optionIndex) => {
    set({ isLoading: true, pollError: null });
    try {
      const memberId = get().user?._id;
      if (!memberId) {
        throw new Error('User not logged in.');
      }
      const res = await api.castVote(pollId, optionIndex, memberId);
      console.log('Vote cast response:', res);
      // Refresh polls after voting
      await get().fetchActivePolls();
      set({ isLoading: false, pollError: null });
      return res;
    } catch (error) {
      console.error('Error casting vote in store:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cast vote';
      set({
        pollError: errorMessage,
        isLoading: false,
      });
      throw error; // Re-throw to handle in the component
    }
  },
  
  fetchAmenityBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await api.getAmenityBookings();
      set({ amenityBookings: bookings || [], isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch bookings',
        isLoading: false,
      });
    }
  },
}));

export default useStore;