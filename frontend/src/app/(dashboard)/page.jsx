'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { reportAPI } from '../../lib/api';
import StatsCards from '../../components/dashboard/StatsCards';
import RevenueChart from '../../components/analytics/RevenueChart';
import KPICards from '../../components/analytics/KPICards';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { CardSkeleton } from '../../components/ui/skeleton';
import useToast from '../../hooks/useToast';
import { getErrorMessage } from '../../lib/utils';
import { Activity, TrendingUp, Clock, Zap } from 'lucide-react';

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
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-1"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-0.5 text-xs sm:text-sm lg:text-base">
              Welcome to Raghhav Roadways Transport Management System
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <KPICards kpis={{
          onTimeDelivery: { value: 94.5, change: 2.3 },
          totalRevenue: { value: dashboardData?.totalRevenue || 245000, change: 12.5 },
          activeVehicles: { value: dashboardData?.activeVehicles || 18, change: 0 },
          pendingDeliveries: { value: dashboardData?.pendingDeliveries || 23, change: -5 },
          completedOrders: { value: dashboardData?.totalConsignments || 156, change: 8 },
          totalParties: { value: dashboardData?.totalParties || 89, change: 3 },
          pendingInvoices: { value: dashboardData?.pendingInvoices || 12, change: -2 },
          alerts: { value: 3, change: 1 },
        }} />
      </motion.div>

      {/* Main Stats */}
      <StatsCards data={dashboardData} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <RevenueChart trend={12.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'New consignment created', time: '2 min ago', type: 'create' },
                  { action: 'Invoice #INV-2024-156 paid', time: '15 min ago', type: 'payment' },
                  { action: 'Vehicle MH-12-AB-1234 dispatched', time: '1 hour ago', type: 'dispatch' },
                  { action: 'Party "ABC Traders" added', time: '2 hours ago', type: 'create' },
                  { action: 'Delivery completed for CN-789', time: '3 hours ago', type: 'complete' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'create' ? 'bg-blue-500' :
                      item.type === 'payment' ? 'bg-green-500' :
                      item.type === 'dispatch' ? 'bg-yellow-500' :
                      'bg-primary-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pending Tasks</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { task: 'Generate monthly report', priority: 'high' },
                  { task: 'Follow up on pending payments', priority: 'medium' },
                  { task: 'Vehicle maintenance due', priority: 'low' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.task}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Active Vehicles', value: dashboardData?.activeVehicles || 18 },
                  { label: 'Total Parties', value: dashboardData?.totalParties || 89 },
                  { label: "Today's Bookings", value: dashboardData?.todayBookings || 5 },
                  { label: 'Avg. Delivery Time', value: '2.5 days' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center p-3 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 border border-gray-100 dark:border-gray-700"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-xs text-gray-400 dark:text-gray-500"
      >
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono">Ctrl+K</kbd> for command palette •
        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono ml-1">Ctrl+D</kbd> for dark mode
      </motion.div>
    </div>
  );
}
