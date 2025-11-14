'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Table({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead className={cn('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, animate = false, index = 0, ...props }) {
  const Component = animate ? motion.tr : 'tr';

  const animationProps = animate ? {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: {
      duration: 0.3,
      delay: index * 0.03,
      ease: "easeOut"
    }
  } : {};

  return (
    <Component
      className={cn('hover:bg-gray-50 transition-colors duration-150', className)}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function TableHead({ children, className, ...props }) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)} {...props}>
      {children}
    </td>
  );
}
