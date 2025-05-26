import { create } from 'zustand';
import * as api from '../api/api';

const useStore = create((set, get) => ({
  // Auth state
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Data
  activePolls: [],
  maintenanceUpdates: [],
  notifications: [],
  amenityBookings: [],
  announcements: [],
  
  // UI state
  activePollModal: null,
  activeAmenityModal: false,
  isLoading: false,
  error: null,
  
  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.login(email, password);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: 'Invalid credentials',
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
      amenityBookings: [],
      announcements: [],
    });
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
      // In a real app, this would call an API
      console.log('Password updated');
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update password', isLoading: false });
    }
  },
  
  fetchActivePolls: async () => {
    set({ isLoading: true, error: null });
    try {
      const polls = await api.getActivePolls();
      set({ activePolls: polls, isLoading: false });
    } catch (error) {
      set({
        error: 'Failed to fetch polls',
        isLoading: false,
      });
    }
  },
  
  fetchMaintenanceUpdates: async () => {
    set({ isLoading: true, error: null });
    try {
      const updates = await api.getMaintenanceUpdates();
      set({ maintenanceUpdates: updates, isLoading: false });
    } catch (error) {
      set({
        error: 'Failed to fetch maintenance updates',
        isLoading: false,
      });
    }
  },
  
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await api.getNotifications();
      set({ notifications, isLoading: false });
    } catch (error) {
      set({
        error: 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },
  
  fetchAmenityBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await api.getAmenityBookings();
      set({ amenityBookings: bookings, isLoading: false });
    } catch (error) {
      set({
        error: 'Failed to fetch amenity bookings',
        isLoading: false,
      });
    }
  },
  
  fetchAnnouncements: async () => {
    set({ isLoading: true, error: null });
    try {
      const announcements = await api.getAnnouncements();
      set({ announcements, isLoading: false });
    } catch (error) {
      set({
        error: 'Failed to fetch announcements',
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
  
  castVote: async (pollId, optionId) => {
    set({ isLoading: true, error: null });
    try {
      await api.castVote(pollId, optionId);
      
      // Optimistically update the UI
      const polls = get().activePolls.map((poll) => {
        if (poll.id === pollId) {
          const updatedOptions = poll.options.map((option) => {
            if (option.id === optionId) {
              return { ...option, votes: option.votes + 1 };
            }
            return option;
          });
          return { ...poll, options: updatedOptions };
        }
        return poll;
      });
      
      set({ activePolls: polls, isLoading: false });
    } catch (error) {
      set({
        error: 'Failed to cast vote',
        isLoading: false,
      });
    }
  },
}));

export default useStore;