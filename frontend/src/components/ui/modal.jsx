'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { modalVariants, backdropVariants } from '../../lib/animations';

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-2xl',
    lg: 'max-w-lg sm:max-w-4xl',
    xl: 'max-w-xl sm:max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Animated Backdrop with Blur */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            />

            {/* Animated Modal with 3D Effect */}
            <motion.div
              className={cn(
                'relative glass-modal w-full',
                'rounded-t-3xl sm:rounded-2xl',
                'transform-gpu overflow-hidden',
                sizes[size]
              )}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Glass Shine Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/20 dark:border-white/10 bg-white/10">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 drop-shadow-sm">{title}</h3>
                <motion.button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none rounded-full p-2 hover:bg-white/30 dark:hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-white/20 dark:border-white/10 bg-white/10">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
