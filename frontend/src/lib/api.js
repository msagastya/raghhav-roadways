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
  signup: (data) => api.post('/auth/signup', data),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  updateApprovalStatus: (userId, status) => api.put(`/users/${userId}/approval`, { status }),
  updateUserRole: (userId, roleId) => api.put(`/users/${userId}/role`, { roleId }),
  delete: (userId) => api.delete(`/users/${userId}`),
  resetPassword: (userId, newPassword) => api.put(`/users/${userId}/reset-password`, { newPassword }),
};

export const permissionAPI = {
  getAll: () => api.get('/permissions'),
  getRoles: () => api.get('/permissions/roles'),
  getRoleWithPermissions: (roleId) => api.get(`/permissions/roles/${roleId}`),
  updateRolePermissions: (roleId, permissionIds) =>
    api.put(`/permissions/roles/${roleId}/permissions`, { permissionIds }),
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
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.patch(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  addTransaction: (paymentId, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post(`/payments/${paymentId}/transactions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteTransaction: (transactionId) => api.delete(`/payments/transactions/${transactionId}`),
  createAmendment: (data) => api.post('/payments/amendments', data),
  approveAmendment: (id) => api.patch(`/payments/amendments/${id}/approve`),
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

export const mastersAPI = {
  // State-City
  getStates: () => api.get('/masters/states'),
  getCitiesByState: (stateId) => api.get(`/masters/states/${stateId}/cities`),
  getAllCities: () => api.get('/masters/cities'),
  addCity: (data) => api.post('/masters/cities', data),
  searchCities: (params) => api.get('/masters/cities/search', { params }),

  // Consignor/Consignee
  getConsignorConsignees: (params) => api.get('/masters/consignor-consignees', { params }),
  getConsignorConsigneeById: (id) => api.get(`/masters/consignor-consignees/${id}`),
  createConsignorConsignee: (data) => api.post('/masters/consignor-consignees', data),
  updateConsignorConsignee: (id, data) => api.patch(`/masters/consignor-consignees/${id}`, data),
  deleteConsignorConsignee: (id) => api.delete(`/masters/consignor-consignees/${id}`),
  searchConsignorConsignees: (params) => api.get('/masters/consignor-consignees/search', { params }),

  // Invoice Party
  getInvoiceParties: (params) => api.get('/masters/invoice-parties', { params }),
  getInvoicePartyById: (id) => api.get(`/masters/invoice-parties/${id}`),
  createInvoiceParty: (data) => api.post('/masters/invoice-parties', data),
  updateInvoiceParty: (id, data) => api.patch(`/masters/invoice-parties/${id}`, data),
  deleteInvoiceParty: (id) => api.delete(`/masters/invoice-parties/${id}`),
  searchInvoiceParties: (params) => api.get('/masters/invoice-parties/search', { params }),

  // Vehicle Owner/Broker
  getVehicleOwners: (params) => api.get('/masters/vehicle-owners', { params }),
  getVehicleOwnerById: (id) => api.get(`/masters/vehicle-owners/${id}`),
  createVehicleOwner: (data) => api.post('/masters/vehicle-owners', data),
  updateVehicleOwner: (id, data) => api.patch(`/masters/vehicle-owners/${id}`, data),
  deleteVehicleOwner: (id) => api.delete(`/masters/vehicle-owners/${id}`),
  searchVehicleOwners: (params) => api.get('/masters/vehicle-owners/search', { params }),
  addVehicleToOwner: (ownerId, data) => api.post(`/masters/vehicle-owners/${ownerId}/vehicles`, data),
  updateOwnerVehicle: (ownerId, vehicleId, data) => api.patch(`/masters/vehicle-owners/${ownerId}/vehicles/${vehicleId}`, data),
  deleteOwnerVehicle: (ownerId, vehicleId) => api.delete(`/masters/vehicle-owners/${ownerId}/vehicles/${vehicleId}`),
};
