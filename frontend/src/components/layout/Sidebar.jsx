'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import useUIStore from '../../store/uiStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Consignments', href: '/consignments', icon: FileText },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Parties', href: '/parties', icon: Users },
  { name: 'Vehicles', href: '/vehicles', icon: Truck },
  { name: 'Masters', href: '/masters', icon: Database },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const { setSidebarOpen, setSidebarHovered } = useUIStore();
  const [hovered, setHovered] = useState(false);

  // On desktop: sidebar expands on hover, collapses when not hovered
  // On mobile: controlled by isOpen (hamburger menu)
  const expanded = isOpen || hovered;

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    setHovered(true);
    setSidebarHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setSidebarHovered(false);
  };

  const handleNavigation = () => {
    setSidebarOpen(false);
    setHovered(false);
    setSidebarHovered(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
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
          'fixed left-0 top-0 h-full text-white z-40',
          'glass-sidebar transition-all duration-300 ease-in-out',
          expanded ? 'w-64 sm:w-72' : 'w-16 md:w-20'
        )}
        initial={false}
        animate={{ x: 0 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(
          'flex flex-col h-full overflow-hidden transition-opacity duration-200',
          isOpen || hovered || !expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          {/* Header / Logo */}
          <div
            className={`flex items-center justify-between border-b border-white/10 bg-white/5 transition-all duration-300 ${expanded ? 'h-32 sm:h-36 flex-col px-3 sm:px-4 lg:px-6 py-4' : 'h-24 px-2 py-3'}`}
          >
            <div className={`flex ${expanded ? 'flex-col items-center w-full' : 'items-center justify-center w-full'} gap-2`}>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/logo.png"
                  alt="Raghhav Roadways"
                  className={cn(
                    'object-contain drop-shadow-lg transition-all duration-300',
                    expanded ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-xl' : 'w-11 h-11 rounded-lg'
                  )}
                />
              </motion.div>
              {!expanded && (
                <motion.div
                  className="absolute top-[62px] left-1/2 -translate-x-1/2 text-[9px] font-brand font-bold tracking-wide text-center leading-[0.95] text-brand-100"
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="block">RAGHHAV</span>
                  <span className="block">ROADWAYS</span>
                </motion.div>
              )}
              {expanded && (
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
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 sm:py-6 custom-scrollbar">
            <div className={cn('space-y-1', expanded ? 'px-2 sm:px-3' : 'px-2')}>
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavigation}
                    className="block"
                  >
                    <motion.div
                      className={cn(
                        'flex w-full items-center py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 relative overflow-hidden',
                        expanded ? 'px-2 sm:px-3' : 'min-h-10 px-0 justify-center',
                        isActive
                          ? 'bg-white/15 text-white shadow-lg shadow-primary-600/20 border-2 border-primary-400/30 backdrop-blur-sm'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/15'
                      )}
                      title={!expanded ? item.name : undefined}
                    >
                      <Icon className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      {expanded && (
                        <motion.span
                          className="relative z-10 ml-2 sm:ml-3 whitespace-nowrap"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                      {isActive && expanded && (
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

          {/* Footer */}
          <div className="border-t border-white/10 p-3 sm:p-4 bg-white/5">
            {expanded ? (
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
