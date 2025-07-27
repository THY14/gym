import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'), // Changed from /users/profile
  updateProfile: (data) => api.put('/auth/me', data), // Changed from /users/profile
};

export const classesAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
};

export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export const paymentsAPI = {
  create: (paymentData) => api.post('/payments', paymentData),
  getUserPayments: () => api.get('/payments/my-payments'),
};

export const progressAPI = {
  getAttendance: () => api.get('/checkIns'), // Changed to match checkIns route
  getTrainingSchedule: () => api.get('/bookings/my-bookings'), // Adjusted to use bookings
};

export const membershipsAPI = {
  getAll: () => api.get('/membershipPlans'), // Changed to match membershipPlans route
};

export const locationsAPI = {
  getAll: () => api.get('/gyms'), // Changed to match gyms route
  getById: (id) => api.get(`/gyms/${id}`),
};

export const trainersAPI = {
  getAll: () => api.get('/trainers'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/users'),
  getBookings: () => api.get('/bookings'),
  getPayments: () => api.get('/payments'),
};

export default api;