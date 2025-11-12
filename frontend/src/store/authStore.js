import { create } from 'zustand';
import { setAuthTokens, clearAuthTokens, setUser as saveUser, getUser as getSavedUser } from '../lib/auth';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    saveUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  setTokens: (accessToken, refreshToken) => {
    setAuthTokens(accessToken, refreshToken);
  },

  logout: () => {
    clearAuthTokens();
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
