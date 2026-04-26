'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * StatStrip Component
 * Horizontal scrollable KPI bar with stat cards
 */
export default function StatStrip({ stats = [], className = '' }) {
  if (stats.length === 0) return null;

  return (
    <motion.div
      className={cn('flex gap-3 overflow-x-auto pb-2 custom-scrollbar', className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          className="glass-t2 rounded-lg p-3 min-w-max"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <p className="text-xs text-gray-500 dark:text-white/60 mb-1">{stat.label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
          {stat.trend && (
            <p className={cn(
              'text-xs mt-1 font-semibold',
              stat.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            )}>
              {stat.trend > 0 ? '+' : ''}{stat.trend}%
            </p>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
