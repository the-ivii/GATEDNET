export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:50001/api',

  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/me',
    LOGOUT: '/auth/logout'
  },

  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    GET_UNREAD_COUNT: '/notifications/unread/count',
    MARK_AS_READ: '/notifications',
    MARK_ALL_AS_READ: '/notifications/read-all'
  },

  POLLS: {
    GET_ALL: '/polls',
    GET_ACTIVE: '/polls/active',
    GET_BY_ID: '/polls',
    VOTE: '/polls/vote'
  },

  TASKS: {
    GET_ALL: '/tasks',
    GET_MY_TASKS: '/tasks/my-tasks',
    GET_BY_ID: '/tasks',
    UPDATE_STATUS: '/tasks/status',
    ADD_COMMENT: '/tasks/comment'
  },

  ANNOUNCEMENTS: {
    GET_ALL: '/announcements',
    GET_BY_ID: '/announcements'
  },

  AMENITIES: {
    GET_ALL: '/amenities',
    GET_BOOKINGS: '/amenities/bookings',
    BOOK: '/amenities/book',
    CANCEL_BOOKING: '/amenities/bookings'
  }
};

export default API_ENDPOINTS;