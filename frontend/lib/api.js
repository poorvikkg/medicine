import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// Handle 401 globally — clear token & redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('medicare_token');
      localStorage.removeItem('medicare_user');
      window.location.href = '/login';
    }
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
