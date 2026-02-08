import { cn, getStatusColor } from '../../lib/utils';

export default function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-gray-500/15 text-gray-800 dark:text-gray-200 backdrop-blur-sm border border-gray-300/20',
    primary: 'bg-primary-500/15 text-primary-800 dark:text-primary-200 backdrop-blur-sm border border-primary-300/20',
    success: 'bg-green-500/15 text-green-800 dark:text-green-200 backdrop-blur-sm border border-green-300/20',
    warning: 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-200 backdrop-blur-sm border border-yellow-300/20',
    danger: 'bg-red-500/15 text-red-800 dark:text-red-200 backdrop-blur-sm border border-red-300/20',
  };

  // If variant looks like a status, use getStatusColor
  const statusColor = getStatusColor(variant);
  const colorClass = statusColor !== 'bg-gray-100 text-gray-800' ? statusColor : variants[variant] || variants.default;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colorClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
