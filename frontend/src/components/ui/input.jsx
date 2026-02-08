'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Input({
  label,
  error,
  className,
  containerClassName,
  autoComplete,
  ...props
}) {
  // Auto-detect autocomplete attribute based on input type/name
  const getAutoComplete = () => {
    if (autoComplete) return autoComplete;
    if (props.type === 'password') return 'current-password';
    if (props.name === 'username') return 'username';
    if (props.name === 'email' || props.type === 'email') return 'email';
    return undefined;
  };
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.input
        className={cn(
          'w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base',
          'border-2 border-white/25 dark:border-white/10 rounded-lg',
          'bg-white/35 dark:bg-white/10 backdrop-blur-sm',
          'transition-all duration-200 transform-gpu',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/60',
          'focus:bg-white/50 dark:focus:bg-white/15 focus:scale-[1.01]',
          'hover:border-white/40 dark:hover:border-white/20 hover:bg-white/45 dark:hover:bg-white/15',
          'disabled:bg-white/10 disabled:cursor-not-allowed',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          error && 'border-red-400/50 focus:ring-red-500/40 focus:border-red-500/60',
          className
        )}
        whileFocus={{ scale: 1.01, y: -1 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
        autoComplete={getAutoComplete()}
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
