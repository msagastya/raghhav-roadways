'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Card({ children, className, animate = false, hover3d = false, ...props }) {
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
        'glass-card rounded-xl',
        'transition-shadow duration-150',
        'relative overflow-hidden',
        className
      )}
      {...animationProps}
      {...hoverProps}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('px-4 sm:px-6 py-4 sm:py-5 border-b border-white/20 dark:border-white/10', className)}
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
      className={cn('px-4 sm:px-6 py-4 sm:py-5 border-t border-white/20 dark:border-white/10', className)}
      {...props}
    >
      {children}
    </div>
  );
}
