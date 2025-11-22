'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Truck,
  Package,
  MapPin,
  CheckCircle,
  Clock,
  Phone,
  User,
  Calendar,
  Box,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_CONFIG = {
  'Booked': { color: 'bg-blue-500', icon: Package, label: 'Booking Confirmed' },
  'Loaded': { color: 'bg-purple-500', icon: Box, label: 'Goods Loaded' },
  'In Transit': { color: 'bg-yellow-500', icon: Truck, label: 'On The Way' },
  'Delivered': { color: 'bg-green-500', icon: CheckCircle, label: 'Delivered' },
  'Settled': { color: 'bg-emerald-600', icon: CheckCircle, label: 'Completed' }
};

export default function TrackingPage() {
  const [grNumber, setGrNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!grNumber.trim()) return;

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const response = await axios.get(`${API_URL}/api/v1/track/${grNumber.trim()}`);
      if (response.data.success) {
        setTrackingData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to find shipment. Please check the GR number.');
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = trackingData?.timeline?.findIndex(
    t => t.status === trackingData.status
  ) ?? -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RAGHHAV ROADWAYS</h1>
                <p className="text-xs text-gray-500">Track Your Shipment</p>
              </div>
            </div>
            <a
              href="tel:+919727466477"
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">+91 9727-466-477</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Your Shipment</h2>
            <p className="text-gray-600">Enter your GR number to track your consignment</p>
          </div>

          <form onSubmit={handleTrack} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={grNumber}
                onChange={(e) => setGrNumber(e.target.value.toUpperCase())}
                placeholder="Enter GR Number (e.g., GR00001)"
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !grNumber.trim()}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Track
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Tracking Results */}
        <AnimatePresence>
          {trackingData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Banner */}
              <div className={`${STATUS_CONFIG[trackingData.status]?.color || 'bg-gray-500'} rounded-2xl p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Current Status</p>
                    <h3 className="text-2xl font-bold">
                      {STATUS_CONFIG[trackingData.status]?.label || trackingData.status}
                    </h3>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    {(() => {
                      const Icon = STATUS_CONFIG[trackingData.status]?.icon || Package;
                      return <Icon className="w-8 h-8" />;
                    })()}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipment Timeline</h3>
                <div className="relative">
                  {trackingData.timeline?.map((step, index) => {
                    const isCompleted = step.completed;
                    const isCurrent = index === currentStatusIndex;
                    const Icon = STATUS_CONFIG[step.status]?.icon || Clock;

                    return (
                      <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                        {/* Timeline Line */}
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isCurrent
                                ? 'bg-primary-500 text-white animate-pulse'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          {index < trackingData.timeline.length - 1 && (
                            <div
                              className={`absolute top-10 w-0.5 h-full ${
                                isCompleted ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <h4 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {STATUS_CONFIG[step.status]?.label || step.status}
                          </h4>
                          {step.timestamp && (
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(step.timestamp).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipment Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Origin & Destination */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Origin</p>
                        <p className="font-medium text-gray-900">{trackingData.origin?.location}</p>
                        <p className="text-sm text-gray-600">{trackingData.origin?.party}</p>
                        <p className="text-xs text-gray-400">{trackingData.origin?.city}, {trackingData.origin?.state}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Destination</p>
                        <p className="font-medium text-gray-900">{trackingData.destination?.location}</p>
                        <p className="text-sm text-gray-600">{trackingData.destination?.party}</p>
                        <p className="text-xs text-gray-400">{trackingData.destination?.city}, {trackingData.destination?.state}</p>
                      </div>
                    </div>
                  </div>

                  {/* Other Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">GR Number</p>
                        <p className="font-semibold text-gray-900">{trackingData.grNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(trackingData.grDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Packages</p>
                        <p className="font-medium text-gray-900">{trackingData.shipmentDetails?.packages || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Weight</p>
                        <p className="font-medium text-gray-900">{trackingData.shipmentDetails?.weight || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase">Vehicle</p>
                      <p className="font-medium text-gray-900">{trackingData.vehicle?.number}</p>
                      {trackingData.vehicle?.driver && (
                        <p className="text-sm text-gray-600">Driver: {trackingData.vehicle.driver}</p>
                      )}
                      {trackingData.vehicle?.driverContact && (
                        <a
                          href={`tel:${trackingData.vehicle.driverContact}`}
                          className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {trackingData.vehicle.driverContact}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Need Help?</h3>
                    <p className="text-white/80 text-sm">Contact us for any queries about your shipment</p>
                  </div>
                  <a
                    href="tel:+919727466477"
                    className="px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!trackingData && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Truck className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Track Your Shipment</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter your GR number above to get real-time updates on your consignment status
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Raghhav Roadways. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PLOT NO. D-407, BLD. NO. D-1, UMANG RESIDENCY, SACHIN, SURAT - 394230
          </p>
        </div>
      </footer>
    </div>
  );
}
