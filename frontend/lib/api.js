import axios from 'axios';

// Base API URL configuration: Support VITE_API_URL, NEXT_PUBLIC_API_URL, and fallback
let API_URL = process.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://medicine-backend-xgoz.onrender.com';

// Normalize the base URL by stripping any trailing slash or "/api" suffix
// so that relative paths (which all start with "/api/...") construct correctly.
if (API_URL) {
  API_URL = API_URL.replace(/\/$/, '').replace(/\/api$/, '');
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('medicare_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for unified authentication redirects and robust error standardizing
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // 1. Handle 401 globally — clear token & redirect to login page
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('medicare_token');
      localStorage.removeItem('medicare_user');
      window.location.href = '/login';
    }

    // 2. Production-ready error object normalization to prevent UI crashes
    if (!error.response) {
      // Network failure, server down, or blocked by browser CORS policy
      error.response = {
        status: 0,
        data: {
          success: false,
          message: error.code === 'ECONNABORTED'
            ? 'The server took too long to respond. Please check your connection.'
            : 'Unable to connect to the server. Please verify the backend is running and CORS is configured.',
        },
      };
    } else if (!error.response.data || typeof error.response.data !== 'object') {
      // Server returned a response, but it is not valid JSON
      error.response.data = {
        success: false,
        message: `Server returned an error (${error.response.status}). Please try again.`,
      };
    } else if (!error.response.data.message) {
      // Standardize missing error messages
      error.response.data.message = 'An unexpected server error occurred.';
    }

    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} [Status ${error.response.status}]:`, error.response.data.message);

    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  updateFCMToken: (fcmToken) => api.put('/api/auth/fcm-token', { fcmToken }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userAPI = {
  getPatients: (params) => api.get('/api/users/patients', { params }),
};

// ─── Medicines ───────────────────────────────────────────────────────────────
export const medicineAPI = {
  add: (formData) => api.post('/api/medicines', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getForPatient: (patientId) => api.get(`/api/medicines/patient/${patientId}`),
  getToday: (patientId) => api.get(`/api/medicines/today/${patientId}`),
  getOne: (id) => api.get(`/api/medicines/${id}`),
  update: (id, formData) => api.put(`/api/medicines/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/api/medicines/${id}`),
};

// ─── Logs ────────────────────────────────────────────────────────────────────
export const logAPI = {
  getAll: (params) => api.get('/api/logs', { params }),
  markTaken: (logId) => api.put(`/api/logs/${logId}/take`),
  snooze: (logId) => api.put(`/api/logs/${logId}/snooze`),
  verify: (logId, formData) =>
    api.post(`/api/logs/${logId}/verify`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Dashboard & Analytics ───────────────────────────────────────────────────
export const dashboardAPI = {
  getDashboard: (patientId) => api.get(`/api/dashboard/${patientId}`),
  getAnalytics: (patientId, days = 7) => api.get(`/api/analytics/${patientId}`, { params: { days } }),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (params) => api.get('/api/notifications', { params }),
  markRead: (ids) => api.put('/api/notifications/read', { ids }),
  getFamilyAlerts: () => api.get('/api/notifications/family-alerts'),
  resolveAlert: (alertId) => api.put(`/api/notifications/family-alerts/${alertId}/resolve`),
};

// ─── Cron ────────────────────────────────────────────────────────────────────
export const cronAPI = {
  triggerReminders: () => api.post('/api/cron/reminders'),
};

export default api;
