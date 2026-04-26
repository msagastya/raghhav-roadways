import { create } from 'zustand';
import { setAuthTokens, clearAuthTokens, setUser as saveUser, getUser as getSavedUser } from '../lib/auth';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => {
    saveUser(user);
    set({ user, isAuthenticated: true, isLoading: false, error: null });
  },

  setTokens: (accessToken, refreshToken) => {
    setAuthTokens(accessToken, refreshToken);
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { username, password });
      // Backend sets accessToken & refreshToken as httpOnly cookies automatically
      // Response body only contains { user } - tokens are NOT in the response body
      const { user } = response.data.data;

      setAuthTokens(); // Mark as authenticated (tokens are in cookies)
      saveUser(user);

      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: () => {
    clearAuthTokens();
    set({ user: null, isAuthenticated: false, error: null });
  },

  initialize: () => {
    const savedUser = getSavedUser();
    if (savedUser) {
      set({ user: savedUser, isAuthenticated: true, isLoading: false });
    } else {
      clearAuthTokens();
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
