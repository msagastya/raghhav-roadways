'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FileText,
  Receipt,
  CreditCard,
  Users,
  Truck,
  BarChart3,
  Settings,
  Database,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import useUIStore from '../../store/uiStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Consignments', href: '/consignments', icon: FileText },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Parties', href: '/parties', icon: Users },
  { name: 'Vehicles', href: '/vehicles', icon: Truck },
  { name: 'Masters', href: '/masters', icon: Database },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const { setSidebarOpen } = useUIStore();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          'fixed left-0 top-0 h-full text-white transition-all duration-300 z-40 shadow-2xl',
          'bg-gradient-to-b from-brand-900/95 via-brand-800/90 to-brand-900/95 backdrop-blur-xl border-r border-brand-600/20',
          isOpen ? 'w-64 sm:w-72' : 'w-0 md:w-16 lg:w-20'
        )}
        initial={false}
        animate={{ x: 0 }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <motion.div
            className={`flex items-center justify-between px-3 sm:px-4 lg:px-6 border-b border-brand-600/20 bg-gradient-to-r from-brand-700/30 to-transparent ${isOpen ? 'h-32 sm:h-36 flex-col py-4' : 'h-16 sm:h-20'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`flex ${isOpen ? 'flex-col items-center w-full' : 'items-center'} gap-2`}>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/logo.png"
                  alt="Raghhav Roadways"
                  className={isOpen ? "w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg" : "w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-lg"}
                />
              </motion.div>
              {isOpen && (
                <motion.div
                  className="flex flex-col items-center space-y-0"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <span className="text-xl sm:text-2xl font-brand font-bold text-brand-100 tracking-wider drop-shadow-lg uppercase leading-tight">
                    RAGHHAV
                  </span>
                  <span className="text-xl sm:text-2xl font-brand font-bold text-brand-100 tracking-wider drop-shadow-lg uppercase leading-tight">
                    ROADWAYS
                  </span>
                </motion.div>
              )}
            </div>
            {isOpen && (
              <motion.button
                className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => setSidebarOpen(false)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </motion.div>

          <nav className="flex-1 overflow-y-auto py-4 sm:py-6 custom-scrollbar">
            <div className="space-y-1 px-2 sm:px-3">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      className={cn(
                        'flex items-center px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 relative overflow-hidden backdrop-blur-sm',
                        isActive
                          ? 'bg-gradient-to-r from-primary-600/90 to-primary-700/90 text-white shadow-lg shadow-primary-600/30 border border-primary-400/30'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
                      )}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: isOpen ? 1.03 : 1.05, x: isOpen ? 6 : 0 }}
                      whileTap={{ scale: 0.98 }}
                      title={!isOpen ? item.name : undefined}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      )}

                      <Icon className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      {isOpen && (
                        <motion.span
                          className="relative z-10 ml-2 sm:ml-3 whitespace-nowrap"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                      {isActive && isOpen && (
                        <motion.div
                          className="ml-auto w-1 h-5 sm:h-6 bg-white rounded-full shadow-lg shadow-white/50"
                          layoutId="activeIndicator"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/10 p-3 sm:p-4 bg-gradient-to-t from-white/5 to-transparent backdrop-blur-sm">
            {isOpen ? (
              <p className="text-xs text-gray-400 text-center">v1.0.0</p>
            ) : (
              <div className="h-2"></div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
