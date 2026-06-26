'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Truck, Package, Clock, CheckCircle2,
  AlertTriangle, IndianRupee, Users, FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';

const KPI_CONFIG = {
  onTimeDelivery: { icon: Clock, color: 'brand', label: 'On-Time Delivery', suffix: '%' },
  totalRevenue: { icon: IndianRupee, color: 'primary', label: 'Total Revenue', prefix: '₹' },
  activeVehicles: { icon: Truck, color: 'purple', label: 'Active Vehicles' },
  pendingDeliveries: { icon: Package, color: 'yellow', label: 'Pending Deliveries' },
  completedOrders: { icon: CheckCircle2, color: 'brand', label: 'Completed Orders' },
  totalParties: { icon: Users, color: 'purple', label: 'Total Parties' },
  pendingInvoices: { icon: FileText, color: 'yellow', label: 'Pending Invoices' },
  alerts: { icon: AlertTriangle, color: 'red', label: 'Active Alerts' },
};

const colorClasses = {
  primary: { bg: 'bg-primary-500/10 border-primary-500/30', text: 'text-primary-500', glow: 'shadow-[0_0_15px_rgba(0,255,136,0.15)]' },
  brand: { bg: 'bg-brand-500/10 border-brand-500/30', text: 'text-brand-500', glow: 'shadow-[0_0_15px_rgba(0,212,255,0.15)]' },
  purple: { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
  yellow: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-500', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.15)]' },
  red: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
};

function formatValue(value, config) {
  if (typeof value !== 'number') return value;
  const formatted = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
  return `${config.prefix || ''}${formatted}${config.suffix || ''}`;
}

export default function KPICards({ kpis = {} }) {
  const data = kpis;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(data).map(([key, kpi], index) => {
        const config = KPI_CONFIG[key];
        if (!config) return null;

        const Icon = config.icon;
        const colors = colorClasses[config.color] || colorClasses.primary;
        const change = kpi.change || 0;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={cn("glass-panel relative overflow-hidden group border", colors.bg, colors.glow)}
          >
            <div className="p-4 relative z-10">
              <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-xl border backdrop-blur-md", colors.bg)}>
                  <Icon className={cn("w-5 h-5", colors.text)} />
                </div>
                {change !== 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-orbitron font-bold tracking-wider px-2 py-1 rounded-sm uppercase border",
                    change > 0 ? 'bg-primary-500/10 text-primary-500 border-primary-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'
                  )}>
                    {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(change)}%
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-xl sm:text-2xl font-orbitron font-bold text-white tracking-wider">
                  {formatValue(kpi.value, config)}
                </p>
                <p className="text-[10px] font-orbitron text-slate-400 mt-1 uppercase tracking-widest">{config.label}</p>
              </div>
              
              {/* Decorative line */}
              <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", colors.bg)} />
            </div>
            
            {/* Background glow on hover */}
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", colors.bg)} />
          </motion.div>
        );
      })}
    </div>
  );
}
