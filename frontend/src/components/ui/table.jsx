import { cn } from '../../lib/utils';

export function Table({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-white/20 dark:divide-white/10', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead className={cn('bg-white/20 dark:bg-white/5', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={cn('bg-white/10 dark:bg-white/5 divide-y divide-white/15 dark:divide-white/10', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, animate = false, index = 0, ...props }) {
  return (
    <tr
      className={cn('hover:bg-white/20 dark:hover:bg-white/10 transition-colors duration-150', className)}
      {...props}
    >
      {children}
    </tr>
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
