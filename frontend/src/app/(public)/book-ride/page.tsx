/**
 * Book Ride Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { publicApi } from '@/lib/api-client';

interface RideType {
  id: string;
  name: string;
  icon: string;
  estimatedTime: string;
  pricePerKm: number;
}

const RIDE_TYPES: RideType[] = [
  { id: 'economy', name: 'Economy', icon: '🚗', estimatedTime: '5 min', pricePerKm: 8 },
  { id: 'premium', name: 'Premium', icon: '🚙', estimatedTime: '3 min', pricePerKm: 12 },
  { id: 'sharing', name: 'Sharing', icon: '👥', estimatedTime: '10 min', pricePerKm: 5 },
];

export default function BookRidePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRideType, setSelectedRideType] = useState('economy');
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupLat: 0,
    pickupLng: 0,
    dropoffLat: 0,
    dropoffLng: 0,
    notes: '',
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h2>
          <p className="text-gray-600 mb-6">Please sign in to book a ride</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Sign in
          </button>
        </div>
      </div>
    );
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const calculateEstimate = () => {
    // Simple fare calculation (in real app, use actual distance API)
    const distance = Math.random() * 20 + 1; // 1-20 km
    const rideType = RIDE_TYPES.find((r) => r.id === selectedRideType);
    if (rideType) {
      const fare = distance * rideType.pricePerKm;
      setEstimatedFare(Math.round(fare * 100) / 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.pickupLocation || !formData.dropoffLocation) {
      setError('Both pickup and dropoff locations are required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await publicApi.createRide({
        ...formData,
        rideType: selectedRideType,
        estimatedFare: estimatedFare || 0,
      });

      if (response.success && response.data) {
        router.push(`/track-ride/${response.data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book ride');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book a Ride</h1>
          <p className="text-gray-600 mt-2">Enter your pickup and dropoff locations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleLocationChange}
                    placeholder="e.g., Mumbai Central Station"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    disabled={isLoading}
                  />
                </div>

                {/* Dropoff Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dropoff Location
                  </label>
                  <input
                    type="text"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleLocationChange}
                    placeholder="e.g., Bandra Worli Sea Link"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    disabled={isLoading}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleLocationChange}
                    placeholder="e.g., Call on arrival"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    disabled={isLoading}
                  />
                </div>

                {/* Get Estimate Button */}
                <button
                  type="button"
                  onClick={calculateEstimate}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg transition"
                >
                  Get Fare Estimate
                </button>

                {estimatedFare && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Estimated fare</p>
                    <p className="text-2xl font-bold text-blue-600">₹{estimatedFare.toFixed(2)}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !estimatedFare}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition"
                >
                  {isLoading ? 'Booking...' : 'Confirm Ride'}
                </button>
              </div>
            </form>
          </div>

          {/* Ride Types */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Ride Type</h2>
            <div className="space-y-3">
              {RIDE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedRideType(type.id)}
                  className={`w-full p-4 rounded-lg border-2 transition ${
                    selectedRideType === type.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <p className="font-semibold text-gray-900">{type.name}</p>
                  <p className="text-xs text-gray-600">₹{type.pricePerKm}/km</p>
                  <p className="text-xs text-gray-500">{type.estimatedTime} away</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
