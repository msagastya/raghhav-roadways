import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const GlassCard = ({ children, className, ...props }) => {
  return (
    <motion.div
      className={cn('glass-card rounded-xl p-4', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
