/**
 * Public User Dashboard Home Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { publicApi } from '@/lib/api-client';

interface Ride {
  id: number;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedFare?: number;
  actualFare?: number;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRides();
    }
  }, [isAuthenticated]);

  const loadRides = async () => {
    try {
      setError('');
      const response = await publicApi.getRideHistory(1, 5);
      if (response.success && response.data?.rides) {
        setRides(response.data.rides);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load rides');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName}!</h1>
              <p className="text-gray-600 mt-1">{user?.email}</p>
            </div>
            <Link
              href="/dashboard/profile"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/book-ride"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book a Ride</h2>
            <p className="text-gray-600">Get a ride in minutes with our quick booking system</p>
          </Link>

          <Link
            href="/dashboard/history"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ride History</h2>
            <p className="text-gray-600">View all your past rides and ratings</p>
          </Link>
        </div>

        {/* Recent Rides */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Rides</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {rides.length === 0 ? (
            <p className="text-gray-600 py-8 text-center">No rides yet. Book your first ride!</p>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <div key={ride.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{ride.pickupLocation}</p>
                      <p className="text-sm text-gray-600">→ {ride.dropoffLocation}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      ride.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : ride.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{new Date(ride.createdAt).toLocaleDateString()}</span>
                    {ride.actualFare && (
                      <span className="font-semibold text-gray-900">₹{ride.actualFare.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/dashboard/history"
            className="text-indigo-600 hover:text-indigo-700 font-semibold mt-4 inline-block"
          >
            View all rides →
          </Link>
        </div>
      </div>
    </div>
  );
}
