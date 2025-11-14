'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Input({
  label,
  error,
  className,
  containerClassName,
  ...props
}) {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.input
        className={cn(
          'w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base',
          'border-2 border-gray-300 rounded-lg shadow-md',
          'bg-gradient-to-br from-white to-gray-50/50',
          'transition-all duration-200 transform-gpu',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'focus:shadow-lg focus:scale-[1.01]',
          'hover:border-gray-400 hover:shadow-lg',
          'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:shadow-none',
          'placeholder:text-gray-400',
          error && 'border-red-400 focus:ring-red-500 focus:border-red-500',
          className
        )}
        whileFocus={{ scale: 1.01, y: -1 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
        {...props}
      />
      {error && (
        <motion.p
          className="mt-1.5 text-xs sm:text-sm text-red-600 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
