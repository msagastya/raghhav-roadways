'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { reportAPI } from '../../lib/api';
import StatsCards from '../../components/dashboard/StatsCards';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { CardSkeleton } from '../../components/ui/skeleton';
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
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-1"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 drop-shadow-sm">Dashboard</h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">Welcome to Raghhav Roadways Transport Management System</p>
      </motion.div>

      <StatsCards data={dashboardData} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card animate={false} hover3d={true}>
            <CardHeader>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 sm:py-12">
                <motion.p
                  className="text-gray-500 text-xs sm:text-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  No recent activity to display
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card animate={false} hover3d={true}>
            <CardHeader>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Quick Stats</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { label: 'Active Vehicles', value: dashboardData?.activeVehicles || 0 },
                  { label: 'Total Parties', value: dashboardData?.totalParties || 0 },
                  { label: "Today's Bookings", value: dashboardData?.todayBookings || 0 }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-transparent hover:from-gray-100 transition-all group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{stat.label}</span>
                    <span className="text-sm sm:text-base lg:text-lg font-bold text-primary-600 drop-shadow-sm">
                      {stat.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
