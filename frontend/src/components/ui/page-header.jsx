'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * PageHeader Component
 * Consistent page title + subtitle + stats + CTA pattern
 */
export default function PageHeader({
  title,
  subtitle = null,
  icon: Icon = null,
  stats = [],
  action = null,
  actionLabel = 'Add New',
  onAction = null,
  className = '',
}) {
  return (
    <motion.div
      className={cn('mb-8', className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <motion.div
              className="p-2.5 bg-primary-500/20 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <Icon className="w-6 h-6 text-primary-400" />
            </motion.div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-white/60 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {action || onAction ? (
          <motion.button
            onClick={onAction}
            className="glass-accent rounded-lg px-4 py-2.5 text-sm font-medium text-primary-700 dark:text-white hover:bg-primary-500/20 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {action || actionLabel}
          </motion.button>
        ) : null}
      </div>

      {/* Stats Row */}
      {stats.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {stats.map((stat, idx) => (
            <motion.button
              key={stat.label}
              onClick={() => stat.onClick?.()}
              className="glass-t1 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="font-bold text-gray-900 dark:text-white">{stat.value}</span>
              <span className="ml-1">{stat.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
