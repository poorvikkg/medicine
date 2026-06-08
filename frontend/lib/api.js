import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateFCMToken: (fcmToken) => api.put('/auth/fcm-token', { fcmToken }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userAPI = {
  getPatients: (params) => api.get('/users/patients', { params }),
};

// ─── Medicines ───────────────────────────────────────────────────────────────
export const medicineAPI = {
  add: (formData) => api.post('/medicines', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getForPatient: (patientId) => api.get(`/medicines/patient/${patientId}`),
  getToday: (patientId) => api.get(`/medicines/today/${patientId}`),
  getOne: (id) => api.get(`/medicines/${id}`),
  update: (id, formData) => api.put(`/medicines/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/medicines/${id}`),
};

// ─── Logs ────────────────────────────────────────────────────────────────────
export const logAPI = {
  getAll: (params) => api.get('/logs', { params }),
  markTaken: (logId) => api.put(`/logs/${logId}/take`),
  snooze: (logId) => api.put(`/logs/${logId}/snooze`),
  verify: (logId, formData) =>
    api.post(`/logs/${logId}/verify`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Dashboard & Analytics ───────────────────────────────────────────────────
export const dashboardAPI = {
  getDashboard: (patientId) => api.get(`/dashboard/${patientId}`),
  getAnalytics: (patientId, days = 7) => api.get(`/analytics/${patientId}`, { params: { days } }),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (ids) => api.put('/notifications/read', { ids }),
  getFamilyAlerts: () => api.get('/notifications/family-alerts'),
  resolveAlert: (alertId) => api.put(`/notifications/family-alerts/${alertId}/resolve`),
};

export default api;
