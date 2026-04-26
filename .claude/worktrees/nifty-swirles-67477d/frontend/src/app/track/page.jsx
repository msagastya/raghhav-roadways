'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, MapPin, Calendar, Truck, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import Input from '../../components/ui/input';
import Button from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import Badge from '../../components/ui/badge';
import { consignmentAPI } from '../../lib/api';
import { format } from 'date-fns';
import { PageLoader } from '../../components/ui/loading';

const statusIcons = {
  'Booked': Clock,
  'Loaded': Package,
  'In Transit': Truck,
  'Delivered': CheckCircle,
  'Cancelled': AlertCircle,
};

const TrackingTimeline = ({ statusHistory }) => {
  return (
    <div className="relative">
      {statusHistory.map((status, index) => {
        const Icon = statusIcons[status.toStatus] || Clock;
        const isLast = index === statusHistory.length - 1;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 pb-8"
          >
            {/* Line */}
            {!isLast && (
              <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Icon */}
            <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
              isLast ? 'bg-primary-600' : 'bg-gray-400'
            }`}>
              <Icon className="w-4 h-4 text-white" />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{status.toStatus}</h4>
                {isLast && <Badge variant="success">Current</Badge>}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {format(new Date(status.changedAt), 'dd MMM yyyy, hh:mm a')}
              </p>
              {status.remarks && (
                <p className="text-sm text-gray-500 mt-1 italic">{status.remarks}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default function TrackingPage() {
  const [grNumber, setGrNumber] = useState('');
  const [consignment, setConsignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!grNumber.trim()) {
      setError('Please enter a GR number');
      return;
    }

    setLoading(true);
    setError('');
    setConsignment(null);

    try {
      // Search consignments by GR number
      const response = await consignmentAPI.getAll({ search: grNumber, limit: 1 });

      if (response.data.data.length === 0) {
        setError('Consignment not found. Please check the GR number and try again.');
      } else {
        setConsignment(response.data.data[0]);
      }
    } catch (err) {
      setError('Failed to fetch consignment details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-brand-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Track Your Shipment
          </h1>
          <p className="text-gray-600">
            Enter your GR number to track your consignment in real-time
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleTrack} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={grNumber}
                    onChange={(e) => {
                      setGrNumber(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter GR Number (e.g., GR-2024-001)"
                    error={error}
                    className="text-lg"
                  />
                </div>
                <Button type="submit" disabled={loading} className="px-8">
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {consignment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Consignment Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {consignment.grNumber}
                  </h2>
                  <Badge variant={consignment.status === 'Delivered' ? 'success' : 'default'}>
                    {consignment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-semibold text-gray-900">{consignment.fromLocation}</p>
                      <p className="text-sm text-gray-600 mt-1">{consignment.consignor?.partyName}</p>
                    </div>
                  </div>

                  {/* To */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-semibold text-gray-900">{consignment.toLocation}</p>
                      <p className="text-sm text-gray-600 mt-1">{consignment.consignee?.partyName}</p>
                    </div>
                  </div>

                  {/* Booking Date */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Booking Date</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(consignment.grDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-semibold text-gray-900">{consignment.vehicleNumber}</p>
                      <p className="text-sm text-gray-600">{consignment.vehicleType}</p>
                    </div>
                  </div>
                </div>

                {/* Shipment Details */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Packages</p>
                      <p className="font-semibold text-gray-900">{consignment.noOfPackages}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-semibold text-gray-900">
                        {consignment.chargedWeight} {consignment.weightUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-semibold text-gray-900">{consignment.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Mode</p>
                      <p className="font-semibold text-gray-900">{consignment.paymentMode}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">Tracking History</h3>
              </CardHeader>
              <CardContent>
                {consignment.statusHistory && consignment.statusHistory.length > 0 ? (
                  <TrackingTimeline statusHistory={consignment.statusHistory} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No tracking history available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Need Help?</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      For any queries regarding your shipment, please contact us:
                    </p>
                    <p className="text-sm">
                      <strong>Phone:</strong> +91 9727-466-477<br />
                      <strong>Email:</strong> raghhavroadways@gmail.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
