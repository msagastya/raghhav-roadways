/**
 * Admin Dashboard Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/contexts/admin-auth-context';

interface DashboardMetrics {
  totalRides: number;
  activeRides: number;
  totalRevenue: number;
  activeUsers: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRides: 0,
    activeRides: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate loading metrics (in real app, fetch from API)
      setTimeout(() => {
        setMetrics({
          totalRides: 1234,
          activeRides: 12,
          totalRevenue: 45678,
          activeUsers: 567,
        });
        setIsLoading(false);
      }, 500);
    }
  }, [isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-slate-900 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {admin?.name} ({admin?.role})</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/settings"
                className="text-gray-600 hover:text-gray-900 px-4 py-2"
              >
                Settings
              </Link>
              <button
                onClick={() => router.push('/admin/logout')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Rides</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalRides}</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Active Rides</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{metrics.activeRides}</p>
            <p className="text-xs text-gray-500 mt-2">Right now</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">₹{metrics.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Active Users</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{metrics.activeUsers}</p>
            <p className="text-xs text-gray-500 mt-2">Platform</p>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">User Management</h2>
            <p className="text-gray-600 text-sm">Manage platform users, view profiles, handle reports</p>
          </Link>

          <Link
            href="/admin/operations"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Operations</h2>
            <p className="text-gray-600 text-sm">Live map, monitor rides, manage requests</p>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics</h2>
            <p className="text-gray-600 text-sm">Revenue, performance metrics, trends</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
