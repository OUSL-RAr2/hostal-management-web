// API Configuration for Hostel Management Web App

export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: '/api/auth/sign-in',
      SIGN_UP: '/api/auth/sign-up',
      SIGN_OUT: '/api/auth/sign-out',
    },
    QR: {
      GENERATE: '/api/qr/generate',
      GET_ACTIVE: '/api/qr/active',
      SCAN: '/api/qr/scan',
      MY_LOGS: '/api/qr/my-logs',
      STUDENTS_STATUS: '/api/qr/students-status',
      STATISTICS: '/api/qr/statistics',
    },
    DASHBOARD: {
      GET_DATA: '/api/dashboard/data',
      GET_ROOM_INFO: '/api/dashboard/room-info',
      GET_ACTIVITIES: '/api/dashboard/activities',
    },
    ROOMS: {
      GET_ALL: '/api/rooms',
      CREATE: '/api/rooms',
      UPDATE: '/api/rooms',
      DELETE: '/api/rooms',
    },
    USERS: {
      GET_ALL: '/api/users',
      GET_PROFILE: '/api/users/profile',
      UPDATE: '/api/users',
    },
    BOOKINGS: {
      GET_ALL: '/api/bookings',
      CREATE: '/api/bookings',
      UPDATE: '/api/bookings',
    },
    COMPLAINTS: {
      GET_ALL: '/api/complaints',
      CREATE: '/api/complaints',
      UPDATE: '/api/complaints',
    },
  },
};

// Helper function to build full URL
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
