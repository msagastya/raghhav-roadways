'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * FormSection Component
 * Collapsible accordion section for forms
 */
export default function FormSection({
  title,
  icon: Icon = null,
  description = null,
  children,
  defaultOpen = true,
  className = '',
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      className={cn('glass-t2 rounded-lg overflow-hidden mb-4', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors"
        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon className="w-5 h-5 text-primary-400 flex-shrink-0" />
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
              {required && (
                <span className="text-xs text-red-400">*</span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-400 dark:text-white/50 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/60 flex-shrink-0" />
        </motion.div>
      </motion.button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-black/6 dark:border-white/10"
          >
            <motion.div
              className="px-4 py-3"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
