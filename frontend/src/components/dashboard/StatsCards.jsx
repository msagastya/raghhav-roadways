'use client';

import { motion } from 'framer-motion';
import { FileText, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { formatCurrency } from '../../lib/utils';

export default function StatsCards({ data }) {
  const stats = [
    {
      name: 'Total Consignments',
      value: data?.totalConsignments || 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(data?.totalRevenue || 0),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      name: 'Pending Invoices',
      value: data?.pendingInvoices || 0,
      icon: Receipt,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      name: 'Pending Deliveries',
      value: data?.pendingDeliveries || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.name}
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
          >
            <Card animate={false} hover3d={false} className="relative overflow-hidden group cursor-pointer">
              <CardContent className="p-4 sm:p-5 lg:p-6">
                {/* Animated Background Gradient */}
                <motion.div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${stat.bg}`}
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />

                <div className="relative z-10 flex items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 truncate">{stat.name}</p>
                    <motion.p
                      className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 drop-shadow-sm"
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
                    className={`relative p-2.5 sm:p-3 lg:p-4 rounded-2xl ${stat.bg} shadow-lg flex-shrink-0`}
                    whileHover={{ scale: 1.15, rotate: 360 }}
                    transition={{ duration: 0.8, type: "spring" }}
                  >
                    {/* Icon Glow Effect */}
                    <div className={`absolute inset-0 rounded-2xl ${stat.bg} blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                    <Icon className={`relative w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${stat.color} drop-shadow-lg`} />
                  </motion.div>
                </div>

                {/* 3D Bottom Border */}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${stat.bg.replace('bg-', 'bg-gradient-to-r from-')} to-transparent`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.6 }}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
