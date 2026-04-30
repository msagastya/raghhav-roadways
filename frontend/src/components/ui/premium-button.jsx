import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const PremiumButton = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/25',
    secondary: 'bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-white/30 dark:border-white/10',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200',
        variants[variant],
        sizes[size],
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default PremiumButton;
