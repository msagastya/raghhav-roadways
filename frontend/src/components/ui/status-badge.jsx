'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const statusConfig = {
  booked: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-700 dark:text-blue-300',
    glow: 'shadow-blue-500/30',
  },
  loaded: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-700 dark:text-purple-300',
    glow: 'shadow-purple-500/30',
  },
  transit: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-300',
    glow: 'shadow-amber-500/30',
  },
  delivered: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-700 dark:text-green-300',
    glow: 'shadow-green-500/30',
  },
  settled: {
    bg: 'bg-teal-500/20',
    border: 'border-teal-500/30',
    text: 'text-teal-700 dark:text-teal-300',
    glow: 'shadow-teal-500/30',
  },
  cancelled: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-700 dark:text-red-300',
    glow: 'shadow-red-500/30',
  },
  pending: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-700 dark:text-purple-300',
    glow: 'shadow-purple-500/30',
  },
  paid: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-700 dark:text-green-300',
    glow: 'shadow-green-500/30',
  },
  unpaid: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-700 dark:text-red-300',
    glow: 'shadow-red-500/30',
  },
  partial: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    glow: 'shadow-yellow-500/30',
  },
};

export default function StatusBadge({
  status = 'booked',
  label = null,
  className = '',
  showGlow = true,
  size = 'md',
}) {
  const config = statusConfig[status.toLowerCase()] || statusConfig.booked;

  const sizes = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-xs px-3 py-1.5',
    lg: 'text-sm px-4 py-2',
  };

  return (
    <motion.span
      className={cn(
        'inline-block rounded-full border font-medium capitalize transition-all duration-200',
        config.bg,
        config.border,
        config.text,
        sizes[size],
        showGlow && `shadow-lg ${config.glow}`,
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={showGlow ? { scale: 1.05 } : {}}
    >
      {label || status}
    </motion.span>
  );
}
