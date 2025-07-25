import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Classes API
export const classesAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
};

// Bookings API
export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

// Payments API
export const paymentsAPI = {
  create: (paymentData) => api.post('/payments', paymentData),
  getUserPayments: () => api.get('/payments/my-payments'),
};

// Process Tracking API
export const processAPI = {
  getAttendance: () => api.get('/member/attendance'), 
  getTrainingSchedule: () => api.get('/member/training-schedule'),
};

// Memberships API
export const membershipsAPI = {
  getAll: () => api.get('/memberships'),
};

// Locations API
export const locationsAPI = {
  getAll: () => api.get('/locations'),
  getById: (id) => api.get(`/locations/${id}`),
};

// Trainers API
export const trainersAPI = {
  getAll: () => api.get('/trainers'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/users'),
  getBookings: () => api.get('/bookings'),
  getPayments: () => api.get('/payments'),
};

export default api;