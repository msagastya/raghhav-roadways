'use client';

import { motion } from 'framer-motion';
import { FileText, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

export default function StatsCards({ data, onCardClick }) {
  const stats = [
    {
      name: 'Total Consignments',
      type: 'completed-orders',
      value: data?.kpis?.completedOrders || 0,
      icon: FileText,
      color: 'text-primary-500',
      bg: 'bg-primary-500/10 border-primary-500/30',
      shadow: 'shadow-[0_0_15px_rgba(0,255,136,0.2)]'
    },
    {
      name: 'Total Revenue',
      type: 'revenue',
      value: formatCurrency(data?.kpis?.totalRevenue || 0),
      icon: TrendingUp,
      color: 'text-brand-500',
      bg: 'bg-brand-500/10 border-brand-500/30',
      shadow: 'shadow-[0_0_15px_rgba(0,212,255,0.2)]'
    },
    {
      name: 'Pending Invoices',
      type: 'pending-invoices',
      value: data?.kpis?.pendingInvoices || 0,
      icon: Receipt,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]'
    },
    {
      name: 'Pending Deliveries',
      type: 'pending-deliveries',
      value: data?.kpis?.pendingDeliveries || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10 border-red-500/30',
      shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.name}
            onClick={() => onCardClick && stat.type && onCardClick(stat.type)}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut",
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
            className={cn(
              "glass-panel relative overflow-hidden group border cursor-pointer",
              stat.bg
            )}
          >
            <div className="p-5 lg:p-6 relative z-10">
              {/* Animated Background Gradient */}
              <motion.div
                className={cn("absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300", stat.bg)}
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-orbitron text-slate-400 uppercase tracking-widest truncate">{stat.name}</p>
                  <motion.p
                    className="text-2xl lg:text-3xl font-orbitron font-bold text-white mt-2 tracking-wider drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: index * 0.1 + 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 15
                    }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <motion.div
                  className={cn("relative p-3 rounded-xl border flex-shrink-0 backdrop-blur-md", stat.bg, stat.shadow)}
                  whileHover={{ scale: 1.15, rotate: 360 }}
                  transition={{ duration: 0.8, type: "spring" }}
                >
                  <Icon className={cn("relative w-6 h-6", stat.color)} />
                </motion.div>
              </div>

              {/* Glowing Bottom Border Effect */}
              <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", stat.bg)} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
