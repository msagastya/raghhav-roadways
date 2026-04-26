'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Truck,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  AlertCircle,
  AlertOctagon,
  Calendar,
} from 'lucide-react';
import { reportAPI } from '../../lib/api';
import PageHeader from '../../components/ui/page-header';
import StatStrip from '../../components/ui/stat-strip';
import GlassPanel from '../../components/ui/glass-panel';
import StatusBadge from '../../components/ui/status-badge';
import RevenueChart from '../../components/analytics/RevenueChart';
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
      setLoading(true);
      const response = await reportAPI.getDashboard();

      if (response.data?.success && response.data?.data) {
        setDashboardData(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      showError(getErrorMessage(error));
      // Set mock data for demo
      setDashboardData({
        kpis: {
          totalRevenue: '₹24,50,000',
          onTimeDelivery: 94.5,
          activeVehicles: 18,
          pendingDeliveries: 12,
          completedOrders: 487,
          totalParties: 62,
          pendingInvoices: 8,
          totalAlerts: 3,
          avgDeliveryTime: 2.5,
        },
        today: { bookings: 12, collections: '₹3,50,000' },
        alerts: {
          overdueInvoices: [],
          expiringDocuments: [],
          pendingAmendments: [],
        },
        recentActivity: [],
        charts: { revenueTrend: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-white/60 dark:bg-white/10 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/60 dark:bg-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/60 dark:bg-white/10 rounded-lg animate-pulse" />
          <div className="h-64 bg-white/60 dark:bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Prepare alert data
  const alerts = [
    ...(dashboardData?.alerts?.overdueInvoices || []).map((inv) => ({
      id: inv.invoiceNumber,
      title: `Invoice ${inv.invoiceNumber} Overdue`,
      description: `Overdue by ${inv.overdueDays} days`,
      type: 'overdue',
      icon: AlertOctagon,
      badge: 'red',
      href: `/invoices/${inv.invoiceNumber}`,
    })),
    ...(dashboardData?.alerts?.expiringDocuments || []).map((doc) => ({
      id: doc.documentType + doc.vehicleNo,
      title: `${doc.documentType} Expiring`,
      description: `${doc.vehicleNo} expires in ${doc.daysUntilExpiry} days`,
      type: 'expiry',
      icon: Calendar,
      badge: 'yellow',
      href: `/vehicles/${doc.vehicleId}`,
    })),
    ...(dashboardData?.alerts?.pendingAmendments || []).map((amend) => ({
      id: amend.id,
      title: 'Payment Amendment',
      description: `Amount: ₹${amend.amount} pending approval`,
      type: 'amendment',
      icon: AlertCircle,
      badge: 'orange',
      href: `/payments/amendments/${amend.id}`,
    })),
  ];

  // KPI stats for strip
  const kpiStats = [
    {
      label: 'Revenue (Today)',
      value: dashboardData?.today?.collections || '₹0',
      trend: 5,
    },
    {
      label: 'On-Time %',
      value: `${dashboardData?.kpis?.onTimeDelivery || 0}%`,
      trend: 2,
    },
    {
      label: 'Active Vehicles',
      value: dashboardData?.kpis?.activeVehicles || 0,
      trend: 0,
    },
    {
      label: 'Pending Deliveries',
      value: dashboardData?.kpis?.pendingDeliveries || 0,
      trend: -1,
    },
    {
      label: 'Completed Orders',
      value: dashboardData?.kpis?.completedOrders || 0,
      trend: 8,
    },
    {
      label: 'Total Parties',
      value: dashboardData?.kpis?.totalParties || 0,
      trend: 3,
    },
    {
      label: 'Pending Invoices',
      value: dashboardData?.kpis?.pendingInvoices || 0,
      trend: -2,
    },
    {
      label: 'Active Alerts',
      value: alerts.length,
      trend: 0,
    },
  ];

  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Mission Control"
        subtitle="Real-time transport operations dashboard"
        icon={TrendingUp}
        stats={[
          { label: 'Total Revenue', value: dashboardData?.kpis?.totalRevenue || '₹0' },
          { label: 'Fleet Status', value: 'Operational' },
          { label: 'Network Health', value: '98%' },
        ]}
      />

      {/* KPI Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <StatStrip stats={kpiStats} />
      </motion.div>

      {/* Main Charts Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {/* Revenue Trend - Takes 2 columns */}
        <GlassPanel tier={2} className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Trend</h3>
              <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Last 30 days</p>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', '90D'].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 text-xs rounded-lg bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <RevenueChart data={dashboardData?.charts?.revenueTrend || []} trend={0} />
        </GlassPanel>

        {/* Status Ring */}
        <GlassPanel tier={2} className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Booked', value: 45, color: 'bg-blue-500/20' },
              { label: 'In Transit', value: 28, color: 'bg-amber-500/20' },
              { label: 'Delivered', value: 18, color: 'bg-green-500/20' },
              { label: 'Pending', value: 9, color: 'bg-purple-500/20' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-xs text-gray-600 dark:text-white/70 flex-1">{item.label}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </motion.div>

      {/* Alerts & Activity Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {/* Alerts Panel */}
        <GlassPanel tier={2} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Requires Attention</h3>
            </div>
            {alerts.length > 0 && (
              <motion.span
                className="px-2.5 py-1 text-xs font-bold bg-red-500/20 text-red-300 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                {alerts.length}
              </motion.span>
            )}
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {alerts.slice(0, 5).map((alert, idx) => {
                const Icon = alert.icon;
                return (
                  <motion.a
                    key={alert.id}
                    href={alert.href}
                    className="block glass-t1 rounded-lg p-3 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        alert.badge === 'red' ? 'bg-red-500/20' :
                        alert.badge === 'yellow' ? 'bg-yellow-500/20' :
                        'bg-orange-500/20'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{alert.title}</p>
                        <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">{alert.description}</p>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500/30 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-white/60">All systems running smoothly!</p>
            </div>
          )}
        </GlassPanel>

        {/* Recent Activity */}
        <GlassPanel tier={2} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {recentActivity.slice(0, 5).map((item, idx) => {
                const actionColor = {
                  create: 'bg-green-500/20 text-green-600 dark:text-green-400',
                  update: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
                  delete: 'bg-red-500/20 text-red-600 dark:text-red-400',
                  status_change: 'bg-purple-500/20 text-purple-400',
                };

                return (
                  <motion.div
                    key={idx}
                    className="glass-t1 rounded-lg p-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                        actionColor[item.type] || 'bg-white/60 dark:bg-white/10 text-gray-500 dark:text-white/60'
                      }`}>
                        {item.type === 'create' && 'NEW'}
                        {item.type === 'update' && 'UPD'}
                        {item.type === 'delete' && 'DEL'}
                        {item.type === 'status_change' && 'CHG'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.description}</p>
                        <p className="text-xs text-gray-400 dark:text-white/50 mt-0.5">
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 dark:text-white/10 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-white/60">No recent activity yet</p>
            </div>
          )}
        </GlassPanel>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {[
          {
            label: "Today's Bookings",
            value: dashboardData?.today?.bookings || 0,
            icon: CheckCircle,
            color: 'bg-green-500/20',
          },
          {
            label: 'Avg. Delivery Time',
            value: `${dashboardData?.kpis?.avgDeliveryTime || 0} days`,
            icon: Clock,
            color: 'bg-blue-500/20',
          },
          {
            label: 'Total Revenue',
            value: dashboardData?.kpis?.totalRevenue || '₹0',
            icon: DollarSign,
            color: 'bg-purple-500/20',
          },
          {
            label: 'Fleet Utilization',
            value: `${Math.round((dashboardData?.kpis?.activeVehicles || 0) / 20 * 100)}%`,
            icon: Truck,
            color: 'bg-orange-500/20',
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <GlassPanel tier={2} className="p-4 text-center cursor-pointer">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-white/60 mt-1">{stat.label}</p>
              </GlassPanel>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-xs text-gray-400 dark:text-white/40 pt-4"
      >
        Tip: Press <kbd className="px-1.5 py-0.5 mx-0.5 bg-white/50 dark:bg-white/5 border border-black/8 dark:border-white/10 rounded font-mono">Cmd+K</kbd> to search - Use the sidebar to navigate
      </motion.div>
    </div>
  );
}
