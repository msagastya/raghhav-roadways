'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Truck, Package, Clock, CheckCircle2,
  AlertTriangle, IndianRupee, Users, FileText
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const KPI_CONFIG = {
  onTimeDelivery: { icon: Clock, color: 'blue', label: 'On-Time Delivery', suffix: '%' },
  totalRevenue: { icon: IndianRupee, color: 'green', label: 'Total Revenue', prefix: '₹' },
  activeVehicles: { icon: Truck, color: 'purple', label: 'Active Vehicles' },
  pendingDeliveries: { icon: Package, color: 'yellow', label: 'Pending Deliveries' },
  completedOrders: { icon: CheckCircle2, color: 'emerald', label: 'Completed Orders' },
  totalParties: { icon: Users, color: 'indigo', label: 'Total Parties' },
  pendingInvoices: { icon: FileText, color: 'orange', label: 'Pending Invoices' },
  alerts: { icon: AlertTriangle, color: 'red', label: 'Active Alerts' },
};

const colorClasses = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', glow: 'shadow-blue-500/20' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', glow: 'shadow-green-500/20' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', glow: 'shadow-purple-500/20' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', glow: 'shadow-yellow-500/20' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', glow: 'shadow-emerald-500/20' },
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', glow: 'shadow-indigo-500/20' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', glow: 'shadow-orange-500/20' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', glow: 'shadow-red-500/20' },
};

function formatValue(value, config) {
  if (typeof value !== 'number') return value;
  const formatted = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
  return `${config.prefix || ''}${formatted}${config.suffix || ''}`;
}

export default function KPICards({ kpis = {} }) {
  // Default KPIs if none provided
  const defaultKPIs = {
    onTimeDelivery: { value: 94.5, change: 2.3 },
    totalRevenue: { value: 245000, change: 12.5 },
    activeVehicles: { value: 18, change: 0 },
    pendingDeliveries: { value: 23, change: -5 },
    completedOrders: { value: 156, change: 8 },
    totalParties: { value: 89, change: 3 },
    pendingInvoices: { value: 12, change: -2 },
    alerts: { value: 3, change: 1 },
  };

  const data = Object.keys(kpis).length > 0 ? kpis : defaultKPIs;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {Object.entries(data).map(([key, kpi], index) => {
        const config = KPI_CONFIG[key];
        if (!config) return null;

        const Icon = config.icon;
        const colors = colorClasses[config.color];
        const change = kpi.change || 0;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className={`relative overflow-hidden hover:shadow-lg ${colors.glow} transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-xl ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  {change !== 0 && (
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${
                      change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(change)}%
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatValue(kpi.value, config)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{config.label}</p>
                </div>
                {/* Decorative gradient */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${colors.bg}`} />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
