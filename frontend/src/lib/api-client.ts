/**
 * API Client - Handles all HTTP requests with token management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  isAdmin?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Initialize tokens from localStorage
 */
export function initializeTokens(userType: 'public' | 'admin' = 'public') {
  if (typeof window !== 'undefined') {
    const prefix = userType === 'admin' ? 'admin_' : '';
    accessToken = localStorage.getItem(`${prefix}accessToken`);
    refreshToken = localStorage.getItem(`${prefix}refreshToken`);
  }
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(
  newAccessToken: string,
  newRefreshToken: string,
  userType: 'public' | 'admin' = 'public'
) {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;

  if (typeof window !== 'undefined') {
    const prefix = userType === 'admin' ? 'admin_' : '';
    localStorage.setItem(`${prefix}accessToken`, newAccessToken);
    localStorage.setItem(`${prefix}refreshToken`, newRefreshToken);
  }
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Clear all tokens
 */
export function clearTokens(userType: 'public' | 'admin' = 'public') {
  accessToken = null;
  refreshToken = null;

  if (typeof window !== 'undefined') {
    const prefix = userType === 'admin' ? 'admin_' : '';
    localStorage.removeItem(`${prefix}accessToken`);
    localStorage.removeItem(`${prefix}refreshToken`);
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(isAdmin: boolean = false): Promise<boolean> {
  if (!refreshToken) {
    return false;
  }

  try {
    const endpoint = isAdmin ? '/admin/auth/refresh' : '/auth/refresh';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const result = await response.json();
    storeTokens(
      result.data.accessToken,
      result.data.refreshToken,
      isAdmin ? 'admin' : 'public'
    );
    return true;
  } catch (error) {
    clearTokens(isAdmin ? 'admin' : 'public');
    return false;
  }
}

/**
 * Main API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { isAdmin = false, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Add authorization token if available
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Make request
  let response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  // If 401, try to refresh token and retry
  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken(isAdmin);
    if (refreshed && accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });
    }
  }

  // Parse response
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

/**
 * Public API Methods
 */
export const publicApi = {
  // Auth endpoints
  register: (payload: {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  }) =>
    apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<any>('/auth/logout', {
      method: 'POST',
      isAdmin: false,
    }),

  getProfile: () =>
    apiRequest<any>('/auth/me', {
      method: 'GET',
    }),

  updateProfile: (payload: any) =>
    apiRequest<any>('/auth/update-profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    apiRequest<any>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Ride endpoints
  createRide: (payload: any) =>
    apiRequest<any>('/rides', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getRide: (rideId: number) =>
    apiRequest<any>(`/rides/${rideId}`, {
      method: 'GET',
    }),

  getActiveRides: () =>
    apiRequest<any>('/rides/active', {
      method: 'GET',
    }),

  getRideHistory: (page: number = 1, limit: number = 10) =>
    apiRequest<any>(`/rides/history?page=${page}&limit=${limit}`, {
      method: 'GET',
    }),

  cancelRide: (rideId: number, reason: string) =>
    apiRequest<any>(`/rides/${rideId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  // Rating endpoints
  submitRating: (rideId: number, payload: any) =>
    apiRequest<any>(`/rides/${rideId}/ratings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Payment endpoints
  createOrder: (rideId: number, amount: number) =>
    apiRequest<any>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ rideId, amount }),
    }),

  verifyPayment: (payload: any) =>
    apiRequest<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

/**
 * Admin API Methods
 */
export const adminApi = {
  login: (payload: { adminId: string; password: string }) =>
    apiRequest<any>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      isAdmin: true,
    }),

  logout: () =>
    apiRequest<any>('/admin/auth/logout', {
      method: 'POST',
      isAdmin: true,
    }),

  getProfile: () =>
    apiRequest<any>('/admin/auth/me', {
      method: 'GET',
      isAdmin: true,
    }),

  changePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    apiRequest<any>('/admin/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
      isAdmin: true,
    }),
};
