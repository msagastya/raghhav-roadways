import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance for agent portal
const agentApi = axios.create({
    baseURL: `${API_URL}/agent`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add agent auth token
agentApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('agentAccessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors and token refresh
agentApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('agentRefreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/agent/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                localStorage.setItem('agentAccessToken', accessToken);
                localStorage.setItem('agentRefreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return agentApi(originalRequest);
            } catch (refreshError) {
                // Clear tokens and redirect to login
                localStorage.removeItem('agentAccessToken');
                localStorage.removeItem('agentRefreshToken');
                localStorage.removeItem('agentUser');
                window.location.href = '/agent/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default agentApi;

// Agent Auth API
export const agentAuthAPI = {
    register: (data) => agentApi.post('/auth/register', data),
    login: (credentials) => agentApi.post('/auth/login', credentials),
    logout: () => agentApi.post('/auth/logout'),
    getProfile: () => agentApi.get('/auth/me'),
    updateProfile: (data) => agentApi.patch('/auth/profile', data),
    changePassword: (data) => agentApi.post('/auth/change-password', data),
    getDashboardStats: () => agentApi.get('/auth/dashboard'),
};

// Agent Vehicle API
export const agentVehicleAPI = {
    getAll: (params) => agentApi.get('/vehicles', { params }),
    getById: (id) => agentApi.get(`/vehicles/${id}`),
    create: (data) => agentApi.post('/vehicles', data),
    update: (id, data) => agentApi.patch(`/vehicles/${id}`, data),
    delete: (id) => agentApi.delete(`/vehicles/${id}`),
    getExpiringDocuments: (days = 30) =>
        agentApi.get('/vehicles/expiring', { params: { days } }),
    uploadDocument: (vehicleId, type, file) => {
        const formData = new FormData();
        formData.append('document', file);
        return agentApi.post(`/vehicles/${vehicleId}/documents/${type}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Agent Availability API
export const agentAvailabilityAPI = {
    getAll: (params) => agentApi.get('/availability', { params }),
    getCalendar: (vehicleId, month) =>
        agentApi.get(`/availability/calendar/${vehicleId}`, { params: { month } }),
    set: (data) => agentApi.post('/availability', data),
    setBulk: (data) => agentApi.post('/availability/bulk', data),
    update: (id, data) => agentApi.patch(`/availability/${id}`, data),
    delete: (id) => agentApi.delete(`/availability/${id}`),
    toggle: (vehicleId, date) =>
        agentApi.post('/availability/toggle', { vehicleId, date }),
};
