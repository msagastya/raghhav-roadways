/**
 * Admin Authentication Context - Manages auth state for admins
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  adminApi,
  storeTokens,
  clearTokens,
  getAccessToken,
  initializeTokens,
} from '@/lib/api-client';

interface AdminUser {
  id: number;
  adminId: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (adminId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    initializeAdminAuth();
  }, []);

  async function initializeAdminAuth() {
    try {
      initializeTokens('admin');
      const token = getAccessToken();

      if (token) {
        const response = await adminApi.getProfile();
        if (response.success && response.data) {
          setAdmin(response.data);
        } else {
          clearTokens('admin');
        }
      }
    } catch (err) {
      clearTokens('admin');
    } finally {
      setIsLoading(false);
    }
  }

  async function login(adminId: string, password: string) {
    try {
      setError(null);
      const response = await adminApi.login({ adminId, password });

      if (response.success && response.data) {
        storeTokens(
          response.data.accessToken,
          response.data.refreshToken,
          'admin'
        );
        setAdmin(response.data.admin);
      }
    } catch (err: any) {
      setError(err.message || 'Admin login failed');
      throw err;
    }
  }

  async function logout() {
    try {
      await adminApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdmin(null);
      clearTokens('admin');
    }
  }

  async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    try {
      setError(null);
      await adminApi.changePassword(data);
    } catch (err: any) {
      setError(err.message || 'Password change failed');
      throw err;
    }
  }

  function clearError() {
    setError(null);
  }

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    error,
    login,
    logout,
    changePassword,
    clearError,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
