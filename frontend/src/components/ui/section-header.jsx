import { motion } from 'framer-motion';

export const SectionHeader = ({ title, subtitle, icon: Icon, children }) => {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-5 h-5 text-primary-500" />}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">{subtitle}</p>
      )}
      {children}
    </motion.div>
  );
};

export default SectionHeader;
