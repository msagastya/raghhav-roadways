'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  type = 'button',
  ...props
}) {
  const [ripples, setRipples] = useState([]);

  const addRipple = (event) => {
    if (disabled) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const baseStyles = 'relative overflow-hidden inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform-gpu';

  const variants = {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 focus:ring-primary-500 border-2 border-primary-400/30',
    secondary: 'bg-white/30 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-gray-100 border-2 border-white/25 dark:border-white/10 hover:bg-white/45 dark:hover:bg-white/20 hover:-translate-y-0.5 active:translate-y-0 focus:ring-gray-500',
    outline: 'border-2 border-white/30 dark:border-white/15 bg-white/20 dark:bg-white/5 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:border-white/50 dark:hover:border-white/25 hover:bg-white/35 dark:hover:bg-white/15 hover:-translate-y-0.5 active:translate-y-0 focus:ring-gray-500',
    danger: 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 focus:ring-red-500 border-2 border-red-400/30',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-white/25 dark:hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs sm:text-sm',
    md: 'px-4 py-2.5 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base sm:text-lg',
  };

  return (
    <motion.button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      onMouseDown={addRipple}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98, y: 0 }}
      transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Ripple Effect */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
