import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setTokens, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setTokens,
    logout,
  };
}
