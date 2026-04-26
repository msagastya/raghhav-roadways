'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Spinner Component
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} ${className}`}
    >
      <Loader2 className="w-full h-full text-primary-600" />
    </motion.div>
  );
};

// Full Page Loading
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-brand-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Spinner size="xl" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-600 font-medium"
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
};

// Inline Loading (for buttons, cards, etc.)
export const InlineLoader = ({ message, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Spinner size="sm" />
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
};

// Skeleton Loader
export const SkeletonLoader = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 bg-gray-200',
    text: 'h-4 bg-gray-200 rounded',
    title: 'h-8 bg-gray-200 rounded w-1/3',
    avatar: 'h-12 w-12 bg-gray-200 rounded-full',
    card: 'h-48 bg-gray-200 rounded-lg',
    button: 'h-10 bg-gray-200 rounded-lg w-32',
  };

  return (
    <motion.div
      className={`${variants[variant]} ${className} overflow-hidden relative`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
};

// Table Loading Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <SkeletonLoader key={j} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Card Loading Skeleton
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <SkeletonLoader variant="title" />
      <SkeletonLoader variant="text" className="w-2/3" />
      <SkeletonLoader variant="text" className="w-full" />
      <SkeletonLoader variant="text" className="w-4/5" />
      <div className="flex gap-2 mt-4">
        <SkeletonLoader variant="button" />
        <SkeletonLoader variant="button" />
      </div>
    </div>
  );
};

// Loading Overlay (for forms, modals)
export const LoadingOverlay = ({ message = 'Processing...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
    >
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-3 text-gray-700 font-medium">{message}</p>
      </div>
    </motion.div>
  );
};

export default Spinner;
