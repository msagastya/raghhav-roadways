'use client';

import { useState, useEffect } from 'react';
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
  Pin,
  PinOff,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import useUIStore from '../../store/uiStore';

const navigationSections = [
  {
    section: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/', icon: Home },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { name: 'Consignments', href: '/consignments', icon: FileText },
      { name: 'Invoices', href: '/invoices', icon: Receipt },
      { name: 'Payments', href: '/payments', icon: CreditCard },
    ],
  },
  {
    section: 'MASTER DATA',
    items: [
      { name: 'Parties', href: '/parties', icon: Users },
      { name: 'Vehicles', href: '/vehicles', icon: Truck },
      { name: 'Masters', href: '/masters', icon: Database },
    ],
  },
  {
    section: 'ANALYTICS',
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const { setSidebarOpen } = useUIStore();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const expanded = isOpen || (hovered && !pinned) || pinned;

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header / Logo Section */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
        <div className={cn(
          'flex items-center gap-3 transition-all duration-300',
          (expanded || isMobile) ? 'justify-start w-full' : 'justify-center'
        )}>
          <motion.div
            className="relative flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src="/logo.png"
              alt="Raghhav Roadways"
              className="w-10 h-10 object-contain drop-shadow-lg"
            />
          </motion.div>
          {(expanded || isMobile) && (
            <motion.div
              className="flex flex-col justify-center min-w-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs font-bold text-white/90 tracking-wide uppercase leading-none">
                Raghhav
              </span>
              <span className="text-xs font-bold text-primary-400 tracking-wide uppercase leading-none">
                Roadways
              </span>
            </motion.div>
          )}
        </div>

        {/* Pin Toggle (desktop expanded) */}
        {expanded && !isMobile && (
          <motion.button
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            onClick={() => setPinned(!pinned)}
            title={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </motion.button>
        )}

        {/* Mobile Close */}
        {isMobile && (
          <motion.button
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-2 custom-scrollbar">
        <div className="space-y-6">
          {navigationSections.map((section, sectionIdx) => (
            <div key={section.section}>
              {(expanded || isMobile) && (
                <motion.h3
                  className="text-xs font-bold text-white/50 uppercase tracking-widest px-3 mb-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIdx * 0.05 }}
                >
                  {section.section}
                </motion.h3>
              )}

              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                    >
                      <motion.div
                        className={cn(
                          'flex items-center text-xs font-medium rounded-lg transition-all duration-200 relative overflow-hidden group',
                          (expanded || isMobile)
                            ? 'px-3 py-2.5 h-10'
                            : 'px-2 py-2 h-10 justify-center',
                          isActive
                            ? 'bg-primary-500/20 text-white border-l-[3px] border-primary-500'
                            : 'text-white/70 hover:text-white hover:bg-white/8'
                        )}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (sectionIdx * 0.1) + (itemIdx * 0.03) }}
                        whileHover={{ x: (expanded || isMobile) ? 4 : 0 }}
                        whileTap={{ scale: 0.98 }}
                        title={!(expanded || isMobile) ? item.name : undefined}
                      >
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-transparent"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                          />
                        )}

                        <Icon className={cn(
                          'relative z-10 flex-shrink-0 transition-all duration-200',
                          isActive ? 'w-5 h-5' : 'w-4 h-4',
                          isActive && 'text-primary-400'
                        )} />

                        {(expanded || isMobile) && (
                          <motion.span
                            className="relative z-10 ml-3 whitespace-nowrap text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 p-3">
        {(expanded || isMobile) ? (
          <p className="text-xs text-white/40 text-center">v1.0.0</p>
        ) : (
          <div className="h-1"></div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        className={cn(
          'fixed left-0 top-0 h-full z-50',
          'glass-t4 transition-all duration-300 ease-in-out',
          'border-r border-white/8',
          expanded ? 'w-64' : 'w-18',
          'md:flex hidden md:flex-col'
        )}
        initial={false}
        animate={{ x: 0 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {renderNavContent(false)}
      </motion.div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              'fixed left-0 top-0 h-full z-50',
              'glass-t4 transition-all duration-300 ease-in-out',
              'border-r border-white/8',
              'w-64 flex md:hidden flex-col'
            )}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
          >
            {renderNavContent(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
