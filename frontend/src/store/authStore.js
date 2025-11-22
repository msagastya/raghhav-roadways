import { create } from 'zustand';
import { setUser as saveUser, getUser as getSavedUser, clearUser } from '../lib/auth';
import { authAPI } from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    saveUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      // Call logout endpoint to clear httpOnly cookies on server
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    clearUser();
    set({ user: null, isAuthenticated: false });
  },

  initialize: () => {
    const savedUser = getSavedUser();
    if (savedUser) {
      set({ user: savedUser, isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
