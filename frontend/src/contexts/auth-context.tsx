/**
 * Authentication Context - Manages auth state for public users
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  publicApi,
  storeTokens,
  clearTokens,
  getAccessToken,
  initializeTokens,
} from '@/lib/api-client';

interface User {
  id: number;
  email: string;
  fullName: string;
  mobile?: string;
  profilePhotoUrl?: string;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      initializeTokens('public');
      const token = getAccessToken();

      if (token) {
        const response = await publicApi.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          clearTokens('public');
        }
      }
    } catch (err) {
      clearTokens('public');
    } finally {
      setIsLoading(false);
    }
  }

  async function register(data: {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  }) {
    try {
      setError(null);
      const response = await publicApi.register(data);

      if (response.success && response.data) {
        storeTokens(
          response.data.accessToken,
          response.data.refreshToken,
          'public'
        );
        setUser(response.data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  }

  async function login(email: string, password: string) {
    try {
      setError(null);
      const response = await publicApi.login({ email, password });

      if (response.success && response.data) {
        storeTokens(
          response.data.accessToken,
          response.data.refreshToken,
          'public'
        );
        setUser(response.data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  }

  async function logout() {
    try {
      await publicApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      clearTokens('public');
    }
  }

  async function updateProfile(data: any) {
    try {
      setError(null);
      const response = await publicApi.updateProfile(data);

      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      throw err;
    }
  }

  async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    try {
      setError(null);
      await publicApi.changePassword(data);
    } catch (err: any) {
      setError(err.message || 'Password change failed');
      throw err;
    }
  }

  function clearError() {
    setError(null);
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
