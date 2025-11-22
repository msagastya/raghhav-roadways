'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  loading = false,
}) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const bgColorClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
  };

  const iconColorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, shadow: 'lg' }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-shadow hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </h3>
          {(subtitle || trendValue) && (
            <div className="flex items-center gap-2">
              {trendValue && (
                <span
                  className={`flex items-center text-sm font-medium ${
                    trend === 'up'
                      ? 'text-green-600 dark:text-green-400'
                      : trend === 'down'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500'
                  }`}
                >
                  {trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                  {trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
                  {trendValue}
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl ${bgColorClasses[color]} flex items-center justify-center`}
          >
            <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Gradient variant
export function GradientStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
}) {
  const gradientClasses = {
    primary: 'from-primary-500 to-primary-700',
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    yellow: 'from-yellow-500 to-yellow-700',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-purple-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${gradientClasses[color]} rounded-xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-1">{value}</h3>
          {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-7 h-7" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
