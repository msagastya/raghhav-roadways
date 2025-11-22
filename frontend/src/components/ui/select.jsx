import { cn } from '../../lib/utils';

export default function Select({
  label,
  error,
  options = [],
  className,
  containerClassName,
  children,
  ...props
}) {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {label}
          {props.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm dark:shadow-dark-sm',
          'bg-white dark:bg-slate-800/80 text-gray-900 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-500/50',
          'disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed',
          'transition-all duration-200',
          error && 'border-red-500 dark:border-red-500/50 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        {/* Support both children and options prop */}
        {children ? children : options.map((option) => (
          <option key={option.value} value={option.value} className="dark:bg-slate-800 dark:text-slate-100">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
