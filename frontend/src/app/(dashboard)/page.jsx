'use client';

import { useEffect, useState } from 'react';
import { reportAPI } from '../../lib/api';
import StatsCards from '../../components/dashboard/StatsCards';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import useToast from '../../hooks/useToast';
import { getErrorMessage } from '../../lib/utils';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reportAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Raghhav Roadways Transport Management System</p>
      </div>

      <StatsCards data={dashboardData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">No recent activity to display</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Vehicles</span>
                <span className="text-sm font-semibold text-gray-900">
                  {dashboardData?.activeVehicles || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Parties</span>
                <span className="text-sm font-semibold text-gray-900">
                  {dashboardData?.totalParties || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today's Bookings</span>
                <span className="text-sm font-semibold text-gray-900">
                  {dashboardData?.todayBookings || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
