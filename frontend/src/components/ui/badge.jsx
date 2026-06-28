import { cn, getStatusColor } from '../../lib/utils';

export default function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-transparent/50/15 text-gray-200 dark:text-gray-200 backdrop-blur-sm border border-white/20/20',
    primary: 'bg-primary-500/15 text-primary-800 dark:text-primary-200 backdrop-blur-sm border border-primary-300/20',
    success: 'bg-green-500/15 text-green-800 dark:text-green-200 backdrop-blur-sm border border-green-300/20',
    warning: 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-200 backdrop-blur-sm border border-yellow-300/20',
    danger: 'bg-red-500/15 text-red-800 dark:text-red-200 backdrop-blur-sm border border-red-300/20',
  };

  // If variant looks like a status, use getStatusColor
  const statusColor = getStatusColor(variant);
  const colorClass = statusColor !== 'bg-transparent/10 text-gray-200' ? statusColor : variants[variant] || variants.default;

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
