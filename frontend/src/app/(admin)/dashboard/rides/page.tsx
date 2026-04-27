'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Search, Filter, Download } from 'lucide-react';

interface RideData {
  id: string;
  userId: string;
  driverId: string;
  pickupLocation: string;
  dropLocation: string;
  rideType: string;
  fare: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  rating?: number;
}

interface RideMetrics {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  averageFare: number;
  totalRevenue: number;
  dailyRidesTrend: Array<{ date: string; rides: number }>;
  rideTypeDistribution: Array<{ type: string; count: number }>;
}

export default function AdminRidesPage() {
  const router = useRouter();
  const { adminUser, adminToken } = useAdminAuth();
  const [rides, setRides] = useState<RideData[]>([]);
  const [metrics, setMetrics] = useState<RideMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }
    fetchRides();
    fetchMetrics();
  }, [adminUser, currentPage, filterStatus]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterStatus && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await apiClient.adminApi.get(`/rides?${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      setRides(response.data.rides || []);
    } catch (error) {
      console.error('Failed to fetch rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await apiClient.adminApi.get('/rides/metrics', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await apiClient.adminApi.get('/rides/export', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rides-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  if (!adminUser) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rides Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all rides</p>
          </div>
          <Button onClick={handleDownloadReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Total Rides</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.totalRides}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{metrics.completedRides}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-3xl font-bold text-red-600">{metrics.cancelledRides}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Avg Fare</p>
                <p className="text-3xl font-bold text-purple-600">₹{metrics.averageFare.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-700">₹{metrics.totalRevenue.toFixed(0)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Daily Rides Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.dailyRidesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rides" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rides by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.rideTypeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-60">
                <Input
                  placeholder="Search by ride ID, user, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={filterStatus || ''}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="ongoing">Ongoing</option>
              </select>
              <Button onClick={() => fetchRides()}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rides Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rides</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading rides...</p>
            ) : rides.length === 0 ? (
              <p className="text-center py-8 text-gray-600">No rides found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Ride ID</th>
                      <th className="text-left px-4 py-3 font-semibold">Route</th>
                      <th className="text-left px-4 py-3 font-semibold">Type</th>
                      <th className="text-left px-4 py-3 font-semibold">Fare</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                      <th className="text-left px-4 py-3 font-semibold">Date</th>
                      <th className="text-left px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map((ride) => (
                      <tr key={ride.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm">{ride.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-sm">{ride.pickupLocation.slice(0, 20)}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{ride.rideType}</td>
                        <td className="px-4 py-3 font-bold">₹{ride.fare.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={ride.status === 'completed' ? 'default' : 'outline'}>
                            {ride.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(ride.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/dashboard/rides/${ride.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {rides.length > 0 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">Page {currentPage}</span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
