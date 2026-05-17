'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CircleDollarSign,
  Clock3,
  FileText,
  Map,
  PackageCheck,
  PieChart as PieChartIcon,
  Truck,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Badge from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import { reportAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import useToast from '@/hooks/useToast';

const chartColors = ['#16a34a', '#2563eb', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const compactCurrency = (value) => {
  const amount = Number(value || 0);
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

const toArrayDistribution = (value, fallbackLabel = 'Unknown') => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        name: item.status || item.paymentStatus || item.label || item.name || fallbackLabel,
        value: Number(item.count ?? item.value ?? item.total ?? 0),
      }))
      .filter((item) => item.value > 0);
  }

  return Object.entries(value)
    .map(([name, count]) => ({ name, value: Number(count || 0) }))
    .filter((item) => item.value > 0);
};

function EmptyChart({ icon: Icon = BarChart3, label = 'No data available' }) {
  return (
    <div className="flex h-72 flex-col items-center justify-center text-center">
      <Icon className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <p className="font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">New records will appear here automatically.</p>
    </div>
  );
}

function MetricCard({ title, value, detail, icon: Icon, tone, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="rounded-xl border border-white/20 bg-white/45 p-4 shadow-sm backdrop-blur-md dark:bg-white/10 dark:border-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
        </div>
        <div className={`rounded-lg p-2 ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
      <p className="text-green-700 dark:text-green-400">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function BasicTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {item.dataKey === 'amount' ? formatCurrency(item.value) : Number(item.value || 0).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await reportAPI.getDashboard();
        setDashboardData(response.data?.data || null);
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [showError]);

  const analytics = useMemo(() => {
    const charts = dashboardData?.charts || {};
    const revenue = charts.revenueTrend || [];
    const topRoutes = (charts.topRoutes || []).slice(0, 7);
    const paymentStatus = toArrayDistribution(charts.paymentStatusDistribution, 'Payment');
    const consignmentStatus = toArrayDistribution(charts.consignmentStatusDistribution, 'Consignment');
    const totalRevenue = Number(dashboardData?.kpis?.totalRevenue || 0);
    const routeRevenue = topRoutes.reduce((sum, route) => sum + Number(route.amount || 0), 0);

    return {
      revenue,
      topRoutes,
      paymentStatus,
      consignmentStatus,
      routeRevenue,
      totalRevenue,
      totalTrips: topRoutes.reduce((sum, route) => sum + Number(route.count || 0), 0),
    };
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 rounded-xl bg-white/25 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} />)}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardData?.kpis?.totalRevenue),
      detail: 'All active consignment revenue',
      icon: CircleDollarSign,
      tone: 'bg-green-500/15 text-green-700 dark:text-green-300',
    },
    {
      title: 'Completed Orders',
      value: Number(dashboardData?.kpis?.completedOrders || 0).toLocaleString('en-IN'),
      detail: 'Consignments in the system',
      icon: PackageCheck,
      tone: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    },
    {
      title: 'Active Vehicles',
      value: Number(dashboardData?.kpis?.activeVehicles || 0).toLocaleString('en-IN'),
      detail: 'Available fleet records',
      icon: Truck,
      tone: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
    },
    {
      title: 'Alerts',
      value: Number(dashboardData?.kpis?.totalAlerts || 0).toLocaleString('en-IN'),
      detail: 'Invoices, documents, approvals',
      icon: AlertTriangle,
      tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    },
    {
      title: 'Parties',
      value: Number(dashboardData?.kpis?.totalParties || 0).toLocaleString('en-IN'),
      detail: 'Customer and vendor master',
      icon: Users,
      tone: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    },
    {
      title: 'On-Time Delivery',
      value: `${Number(dashboardData?.kpis?.onTimeDelivery || 0).toFixed(1)}%`,
      detail: 'Delivery performance',
      icon: Clock3,
      tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-green-300/20 bg-green-500/15 p-2 text-green-700 dark:text-green-300">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Visual overview of revenue, routes, fleet, payments, and operational health.
              </p>
            </div>
          </div>
        </div>
        <Badge variant="success" className="w-fit">
          Live dashboard data
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card animate={false} className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Daily revenue movement from recent consignments</p>
              </div>
              <CircleDollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {analytics.revenue.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.revenue} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.65} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={compactCurrency} width={58} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={3} fill="url(#analyticsRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart icon={CircleDollarSign} label="No revenue trend yet" />
            )}
          </CardContent>
        </Card>

        <Card animate={false}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status Split</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Consignment status distribution</p>
              </div>
              <PieChartIcon className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {analytics.consignmentStatus.length > 0 ? (
              <>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.consignmentStatus} dataKey="value" nameKey="name" outerRadius={96} innerRadius={54} paddingAngle={4}>
                        {analytics.consignmentStatus.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<BasicTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {analytics.consignmentStatus.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 rounded-lg bg-white/30 px-2 py-1.5 text-xs dark:bg-white/5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                      <span className="truncate text-gray-700 dark:text-gray-300">{item.name}</span>
                      <span className="ml-auto font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChart icon={PieChartIcon} label="No status data yet" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card animate={false}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Routes</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {analytics.totalTrips.toLocaleString('en-IN')} trips tracked across key routes
                </p>
              </div>
              <Map className="h-5 w-5 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            {analytics.topRoutes.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topRoutes} layout="vertical" margin={{ top: 8, right: 22, left: 24, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#d1d5db" opacity={0.55} />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <YAxis type="category" dataKey="route" tick={{ fontSize: 11 }} stroke="#6b7280" width={116} />
                    <Tooltip content={<BasicTooltip />} />
                    <Bar dataKey="count" name="Trips" radius={[0, 8, 8, 0]}>
                      {analytics.topRoutes.map((route, index) => (
                        <Cell key={route.route} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart icon={Map} label="No route data yet" />
            )}
          </CardContent>
        </Card>

        <Card animate={false}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Route Revenue</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(analytics.routeRevenue)} from top routes
                </p>
              </div>
              <CircleDollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {analytics.topRoutes.length > 0 ? (
              <div className="space-y-3">
                {analytics.topRoutes.map((route, index) => {
                  const percent = analytics.routeRevenue > 0 ? Math.round((Number(route.amount || 0) / analytics.routeRevenue) * 100) : 0;
                  return (
                    <div key={route.route} className="rounded-xl bg-white/35 p-3 dark:bg-white/5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">{route.route}</p>
                        <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(route.amount)}</p>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200/70 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${percent}%`, backgroundColor: chartColors[index % chartColors.length] }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{Number(route.count || 0).toLocaleString('en-IN')} trips</span>
                        <span>{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyChart icon={Map} label="No route revenue yet" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card animate={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Status</h2>
            </div>
          </CardHeader>
          <CardContent>
            {analytics.paymentStatus.length > 0 ? (
              <div className="space-y-3">
                {analytics.paymentStatus.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChart icon={PieChartIcon} label="No payment status data" />
            )}
          </CardContent>
        </Card>

        <Card animate={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Overdue invoices', value: dashboardData?.alerts?.overdueInvoices?.length || 0, tone: 'danger' },
                { label: 'Expiring documents', value: dashboardData?.alerts?.expiringDocuments?.length || 0, tone: 'warning' },
                { label: 'Pending amendments', value: dashboardData?.alerts?.pendingAmendments?.length || 0, tone: 'primary' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg bg-white/35 px-3 py-2 dark:bg-white/5">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  <Badge variant={item.tone}>{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card animate={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentActivity?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 5).map((item, index) => (
                  <div key={`${item.timestamp}-${index}`} className="rounded-lg bg-white/35 px-3 py-2 dark:bg-white/5">
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.description}</p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })} by {item.user}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChart icon={Activity} label="No recent activity" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
