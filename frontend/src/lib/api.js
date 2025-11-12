import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
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
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const consignmentAPI = {
  getAll: (params) => api.get('/consignments', { params }),
  getById: (id) => api.get(`/consignments/${id}`),
  create: (data) => api.post('/consignments', data),
  update: (id, data) => api.patch(`/consignments/${id}`, data),
  updateStatus: (id, data) => api.patch(`/consignments/${id}/status`, data),
  delete: (id) => api.delete(`/consignments/${id}`),
  uploadChallan: (id, file) => {
    const formData = new FormData();
    formData.append('challan', file);
    return api.post(`/consignments/${id}/upload-challan`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadNote: (id) => api.get(`/consignments/${id}/download-note`, { responseType: 'blob' }),
};

export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.patch(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  download: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
};

export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  createAmendment: (data) => api.post('/payment-amendments', data),
  approveAmendment: (id) => api.patch(`/payment-amendments/${id}/approve`),
};

export const partyAPI = {
  getAll: (params) => api.get('/parties', { params }),
  getById: (id) => api.get(`/parties/${id}`),
  create: (data) => api.post('/parties', data),
  update: (id, data) => api.patch(`/parties/${id}`, data),
  delete: (id) => api.delete(`/parties/${id}`),
};

export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.patch(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getDaily: (date) => api.get('/reports/daily', { params: { date } }),
  getMonthlyStatement: (params) => api.get('/reports/monthly-statement', { params }),
  getVehicleSettlement: (params) => api.get('/reports/vehicle-settlement', { params }),
};
