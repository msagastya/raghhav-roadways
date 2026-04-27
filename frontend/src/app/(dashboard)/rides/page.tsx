'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Ride {
  id: string;
  pickupLocation: string;
  dropLocation: string;
  rideType: string;
  fare: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  driver?: {
    name: string;
    phone: string;
    rating: number;
    vehicle: string;
  };
}

export default function RidesPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled' | 'ongoing'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchRides();
  }, [user, router]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await apiClient.publicApi.get('/rides/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(response.data.rides || []);
    } catch (error) {
      console.error('Failed to fetch rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRideClick = (rideId: string) => {
    router.push(`/rides/${rideId}`);
  };

  const handleCancelRide = async (rideId: string) => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      try {
        await apiClient.publicApi.post(
          `/rides/${rideId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchRides();
      } catch (error) {
        console.error('Failed to cancel ride:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Rides</h1>
          <p className="text-gray-600">View and manage your ride history</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'completed', 'ongoing', 'cancelled'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Rides List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your rides...</p>
          </div>
        ) : rides.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No rides found</p>
              <Button onClick={() => router.push('/book-ride')}>Book a Ride</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rides
              .filter((ride) => filter === 'all' || ride.status.toLowerCase() === filter)
              .map((ride) => (
                <Card
                  key={ride.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleRideClick(ride.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {ride.pickupLocation} → {ride.dropLocation}
                        </CardTitle>
                        <div className="text-sm text-gray-600">
                          <p>Ride Type: <span className="font-semibold">{ride.rideType}</span></p>
                          <p>Date: {new Date(ride.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Fare Amount</p>
                        <p className="text-xl font-bold text-green-600">₹{ride.fare.toFixed(2)}</p>
                      </div>
                      {ride.driver && (
                        <div>
                          <p className="text-sm text-gray-600">Driver</p>
                          <p className="font-semibold">{ride.driver.name}</p>
                          <p className="text-xs text-gray-500">{ride.driver.vehicle}</p>
                          <p className="text-xs text-yellow-600">★ {ride.driver.rating}</p>
                        </div>
                      )}
                    </div>
                    {ride.status.toLowerCase() === 'ongoing' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/rides/${ride.id}/track`);
                          }}
                        >
                          Track Live
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRide(ride.id);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
