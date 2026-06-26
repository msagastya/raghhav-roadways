'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { reportAPI } from '../../../lib/api';
import dynamic from 'next/dynamic';
import StatsCards from '../../../components/dashboard/StatsCards';
import KPICards from '../../../components/analytics/KPICards';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { CardSkeleton } from '../../../components/ui/skeleton';
import useToast from '../../../hooks/useToast';
import { getErrorMessage, cn } from '../../../lib/utils';
import { Activity, TrendingUp, Clock, Zap, AlertTriangle, FileText, Truck, ArrowRight } from 'lucide-react';

const RevenueChart = dynamic(() => import('../../../components/analytics/RevenueChart'), {
  ssr: false,
  loading: () => <CardSkeleton />
});

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-800 rounded animate-pulse mt-2"></div>
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

  // Prepare KPI data from backend
  const kpis = dashboardData?.kpis ? {
    onTimeDelivery: {
      value: Number(dashboardData.kpis.onTimeDelivery).toFixed(1),
      change: 0
    },
    totalRevenue: {
      value: dashboardData.kpis.totalRevenue,
      change: 0
    },
    activeVehicles: {
      value: dashboardData.kpis.activeVehicles,
      change: 0
    },
    pendingDeliveries: {
      value: dashboardData.kpis.pendingDeliveries,
      change: 0
    },
    completedOrders: {
      value: dashboardData.kpis.completedOrders,
      change: 0
    },
    totalParties: {
      value: dashboardData.kpis.totalParties,
      change: 0
    },
    pendingInvoices: {
      value: dashboardData.kpis.pendingInvoices,
      change: 0
    },
    alerts: {
      value: dashboardData.kpis.totalAlerts,
      change: 0
    },
  } : {};

  // Prepare alerts/tasks from backend
  const alerts = [
    ...(dashboardData?.alerts?.overdueInvoices || []).map(inv => ({
      task: `Invoice ${inv.invoiceNumber} overdue by ${inv.overdueDays} days`,
      priority: inv.overdueDays > 30 ? 'high' : inv.overdueDays > 15 ? 'medium' : 'low',
      type: 'invoice',
      link: `/invoices/${inv.invoiceNumber}`
    })),
    ...(dashboardData?.alerts?.expiringDocuments || []).map(doc => ({
      task: `${doc.documentType} expiring for ${doc.vehicleNo}`,
      priority: doc.daysUntilExpiry < 7 ? 'high' : doc.daysUntilExpiry < 15 ? 'medium' : 'low',
      type: 'document',
      link: `/vehicles/${doc.vehicleId}`
    })),
    ...(dashboardData?.alerts?.pendingAmendments || []).map(amend => ({
      task: `Payment amendment pending: ₹${amend.amount}`,
      priority: 'medium',
      type: 'amendment',
      link: `/payments/amendments/${amend.id}`
    })),
  ].slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-warp-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-1"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 backdrop-blur-md rounded-2xl border border-primary-500/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
            <Zap className="w-6 h-6 text-primary-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-orbitron font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              COMMAND <span className="text-primary-500">CENTER</span>
            </h1>
            <p className="text-primary-500/70 font-orbitron mt-1 text-xs sm:text-sm lg:text-sm tracking-[0.3em] uppercase">
              Raghhav Roadways Operations
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
        <KPICards kpis={kpis} />
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
          <RevenueChart
            data={dashboardData?.charts?.revenueTrend || []}
            trend={0}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="glass-panel h-full flex flex-col">
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-500" />
                  <h3 className="text-sm font-orbitron font-bold tracking-widest uppercase text-slate-300">System Activity</h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_5px_rgba(0,255,136,0.8)]" />
              </div>
            </div>
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
              {dashboardData?.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/50 hover:border-primary-500/30 transition-all group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className={cn(
                        "mt-1 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                        item.type === 'create' ? 'bg-brand-500 text-brand-500' :
                        item.type === 'update' ? 'bg-yellow-500 text-yellow-500' :
                        item.type === 'delete' ? 'bg-red-500 text-red-500' :
                        'bg-primary-500 text-primary-500'
                      )} />
                      <div className="flex-1">
                        <p className="text-sm font-sans text-slate-200 group-hover:text-white transition-colors">{item.description}</p>
                        <p className="text-[10px] font-orbitron tracking-wider text-slate-500 mt-2 uppercase">
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })} • <span className="text-primary-500/70">{item.user}</span>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-sm font-orbitron tracking-widest text-slate-500 uppercase">Awaiting Activity</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="glass-panel h-full flex flex-col">
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-orbitron font-bold tracking-widest uppercase text-slate-300">Priority Alerts</h3>
              </div>
            </div>
            <div className="p-5 flex-1">
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all cursor-pointer group">
                      <span className="text-xs font-sans text-slate-300 group-hover:text-white flex-1">{item.task}</span>
                      <span className={cn(
                        "text-[9px] font-orbitron font-bold tracking-widest px-2 py-1 rounded-sm uppercase ml-3 border",
                        item.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                        item.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                        'bg-primary-500/10 text-primary-500 border-primary-500/30'
                      )}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-12 h-12 rounded-full border border-primary-500/30 flex items-center justify-center mb-3 bg-primary-500/5 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                     <AlertTriangle className="w-5 h-5 text-primary-500" />
                  </div>
                  <p className="text-xs font-orbitron tracking-widest text-slate-500 uppercase">System Nominal</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="glass-panel h-full flex flex-col">
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <h3 className="text-sm font-orbitron font-bold tracking-widest uppercase text-slate-300">Live Telemetry</h3>
              </div>
            </div>
            <div className="p-5 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-full">
                {[
                  { label: 'Active Vehicles', value: dashboardData?.kpis?.activeVehicles || 0, icon: Truck },
                  { label: 'Total Parties', value: dashboardData?.kpis?.totalParties || 0, icon: FileText },
                  { label: "Today's Bookings", value: dashboardData?.today?.bookings || 0, icon: FileText },
                  {
                    label: 'Avg. Delivery',
                    value: dashboardData?.kpis?.avgDeliveryTime ? `${dashboardData.kpis.avgDeliveryTime} D` : 'N/A',
                    icon: Clock
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-800/80 transition-all relative overflow-hidden group"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Icon className="w-5 h-5 text-brand-500/70 mb-3 group-hover:text-brand-500 transition-colors" />
                      <p className="text-2xl font-orbitron font-bold text-white tracking-wider relative z-10">{stat.value}</p>
                      <p className="text-[10px] font-orbitron text-slate-500 mt-2 uppercase tracking-widest relative z-10">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-[10px] font-orbitron text-slate-500 tracking-[0.2em] uppercase pt-4"
      >
        System Inputs: <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-primary-500 ml-2">⌘/Ctrl + K</kbd> COMMAND PALETTE
      </motion.div>
    </div>
  );
}
