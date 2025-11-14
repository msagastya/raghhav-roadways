'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Card({ children, className, animate = true, hover3d = true, ...props }) {
  const Component = animate ? motion.div : 'div';

  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  } : {};

  const hoverProps = hover3d && animate ? {
    whileHover: {
      y: -4,
      scale: 1.01,
      transition: { duration: 0.2, type: 'spring', stiffness: 300 }
    }
  } : {};

  return (
    <Component
      className={cn(
        'bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-lg border border-gray-200/50 backdrop-blur-sm',
        'hover:shadow-2xl hover:border-gray-300/50 transition-all duration-300 transform-gpu',
        'relative overflow-hidden',
        className
      )}
      {...animationProps}
      {...hoverProps}
      {...props}
    >
      {/* 3D Effect Border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200/70', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-4 sm:px-6 py-4 sm:py-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn('px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-200/70', className)}
      {...props}
    >
      {children}
    </div>
  );
}
