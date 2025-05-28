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
  amenityBookings: [],
  announcements: [],
  
  // UI state
  activePollModal: null,
  activeAmenityModal: false,
  isLoading: false,
  error: null,
  
  // Actions
  // Action: Handles user login and authentication
  login: async (name, flat) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login(name, flat);
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
  
  // Action: Fetches full user details if incomplete (kept for structure, but login now ensures email)
  fetchUserDetails: async () => {
    const state = get();
    console.log('Fetching user details. Current user state:', state.user);
    // This action might not be strictly necessary if login always provides email
    if (state.isAuthenticated && !state.user?.email) {
      console.log('Attempting to fetch user details (simulated)');
      set({ isLoading: true, error: null });
      try {
        // Simulate fetching user details with email
        const currentUser = state.user || {};
        // Assume we fetched the full user details, including email
        const fetchedUserDetails = { ...currentUser, email: currentUser.email || 'fetched.user@example.com' }; // Simulate fetched email
        set({ user: fetchedUserDetails, isLoading: false });
        localStorage.setItem('user', JSON.stringify(fetchedUserDetails));
      } catch (error) {
        console.error('Error fetching user details:', error);
        set({
          error: error.response?.data?.message || error.message || 'Failed to fetch user details',
          isLoading: false,
        });
      }
    }
  },
  
  fetchActivePolls: async () => {
    set({ isLoading: true, error: null });
    try {
      const polls = await api.getActivePolls();
      console.log('Fetched polls in store:', polls);
      set({ activePolls: polls || [], isLoading: false }); // Ensure activePolls is always an array
    } catch (error) {
      console.error('Error fetching polls in store:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch polls',
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
  
  fetchAmenityBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await api.getAmenities(); // getAmenities returns bookings from backend
      set({ amenityBookings: bookings || [], isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch amenity bookings',
        isLoading: false,
      });
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
    set({ isLoading: true, error: null });
    try {
      const memberId = get().user?._id;
      if (!memberId) {
         throw new Error('User not logged in.');
      }
      const res = await api.castVote(pollId, optionIndex, memberId);
      console.log('Vote cast response:', res.data);
      await get().fetchActivePolls(); // Refresh polls after voting
      set({ isLoading: false });
    } catch (error) {
       console.error('Error casting vote in store:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to cast vote',
        isLoading: false,
      });
    }
  },
}));

export default useStore;