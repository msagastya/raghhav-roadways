import { cn, getStatusColor } from '../../lib/utils';

export default function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-slate-700/50 dark:text-slate-300 dark:border dark:border-slate-600/50',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300 dark:border dark:border-primary-500/30',
    success: 'bg-green-100 text-green-800 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30',
    danger: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 dark:border dark:border-red-500/30',
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
