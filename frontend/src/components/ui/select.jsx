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
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 border border-white/20 rounded-md shadow-sm bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-transparent/10 disabled:cursor-not-allowed',
          '[&>option]:bg-slate-900 [&>option]:text-white',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        {/* Support both children and options prop */}
        {children ? children : options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
