'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface RideDetail {
  id: string;
  pickupLocation: string;
  dropLocation: string;
  rideType: string;
  fare: number;
  distance: number;
  duration: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  cancellationReason?: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    rating: number;
    totalRides: number;
    vehicle: {
      type: string;
      number: string;
      color: string;
    };
  };
  payment?: {
    method: string;
    status: string;
    transactionId: string;
  };
  route?: {
    pickupCoordinates: [number, number];
    dropCoordinates: [number, number];
    currentLocation?: [number, number];
  };
}

export default function RideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const [ride, setRide] = useState<RideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!user || !params.id) return;
    fetchRideDetail();
  }, [user, params.id]);

  const fetchRideDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.publicApi.get(`/rides/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRide(response.data.ride);
    } catch (error) {
      console.error('Failed to fetch ride:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    try {
      await apiClient.publicApi.post(
        `/rides/${params.id}/rating`,
        { rating, review },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowRatingModal(false);
      fetchRideDetail();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading ride details...</div>;
  }

  if (!ride) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="mb-4">Ride not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>

        {/* Ride Summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Ride Details</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(ride.createdAt).toLocaleDateString()} at{' '}
                  {new Date(ride.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <Badge variant="outline" className={`${
                ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {ride.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Pickup Location</p>
                <p className="font-semibold">{ride.pickupLocation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Drop Location</p>
                <p className="font-semibold">{ride.dropLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Ride Type</p>
                <p className="font-semibold">{ride.rideType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Distance</p>
                <p className="font-semibold">{ride.distance.toFixed(2)} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{Math.round(ride.duration / 60)} min</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">Fare Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{ride.fare.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        {ride.driver && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <p className="font-bold text-lg">{ride.driver.name}</p>
                  <p className="text-sm text-gray-600">{ride.driver.vehicle}</p>
                  <p className="text-sm text-yellow-600 mt-1">★ {ride.driver.rating} • {ride.driver.totalRides} rides</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{ride.driver.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle Number</p>
                  <p className="font-semibold">{ride.driver.vehicle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Info */}
        {ride.payment && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold">{ride.payment.method}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Status</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {ride.payment.status}
                </Badge>
              </div>
              {ride.payment.transactionId && (
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-600">Transaction ID</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {ride.payment.transactionId}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {ride.status === 'completed' && (
            <Button
              className="flex-1"
              onClick={() => setShowRatingModal(true)}
            >
              Rate Ride
            </Button>
          )}
          {ride.status === 'ongoing' && (
            <Button
              className="flex-1"
              onClick={() => router.push(`/rides/${ride.id}/track`)}
            >
              Track Live
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Rate Your Ride</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Your Rating</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        onClick={() => setRating(i)}
                        className={`text-2xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Your Review</p>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Share your experience..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleSubmitRating}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowRatingModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
