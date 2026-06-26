'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-primary-500', bgHover: 'hover:bg-primary-500/10', borderHover: 'hover:border-primary-500/30', bgActive: 'bg-primary-500/10', borderActive: 'border-primary-500', shadowActive: 'shadow-[0_0_10px_rgba(0,255,136,0.3)]' },
  { name: 'Consignments', href: '/consignments', icon: FileText, color: 'text-brand-500', bgHover: 'hover:bg-brand-500/10', borderHover: 'hover:border-brand-500/30', bgActive: 'bg-brand-500/10', borderActive: 'border-brand-500', shadowActive: 'shadow-[0_0_10px_rgba(0,212,255,0.3)]' },
  { name: 'Invoices', href: '/invoices', icon: Receipt, color: 'text-primary-500', bgHover: 'hover:bg-primary-500/10', borderHover: 'hover:border-primary-500/30', bgActive: 'bg-primary-500/10', borderActive: 'border-primary-500', shadowActive: 'shadow-[0_0_10px_rgba(0,255,136,0.3)]' },
  { name: 'Payments', href: '/payments', icon: CreditCard, color: 'text-purple-400', bgHover: 'hover:bg-purple-500/10', borderHover: 'hover:border-purple-500/30', bgActive: 'bg-purple-500/10', borderActive: 'border-purple-400', shadowActive: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' },
  { name: 'Parties', href: '/parties', icon: Users, color: 'text-brand-500', bgHover: 'hover:bg-brand-500/10', borderHover: 'hover:border-brand-500/30', bgActive: 'bg-brand-500/10', borderActive: 'border-brand-500', shadowActive: 'shadow-[0_0_10px_rgba(0,212,255,0.3)]' },
  { name: 'Vehicles', href: '/vehicles', icon: Truck, color: 'text-amber-500', bgHover: 'hover:bg-amber-500/10', borderHover: 'hover:border-amber-500/30', bgActive: 'bg-amber-500/10', borderActive: 'border-amber-500', shadowActive: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]' },
  { name: 'Masters', href: '/masters', icon: Database, color: 'text-slate-400', bgHover: 'hover:bg-slate-400/10', borderHover: 'hover:border-slate-400/30', bgActive: 'bg-slate-400/10', borderActive: 'border-slate-400', shadowActive: 'shadow-[0_0_10px_rgba(100,116,139,0.3)]' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'text-brand-500', bgHover: 'hover:bg-brand-500/10', borderHover: 'hover:border-brand-500/30', bgActive: 'bg-brand-500/10', borderActive: 'border-brand-500', shadowActive: 'shadow-[0_0_10px_rgba(0,212,255,0.3)]' },
  { name: 'Reports', href: '/reports', icon: BarChart3, color: 'text-primary-500', bgHover: 'hover:bg-primary-500/10', borderHover: 'hover:border-primary-500/30', bgActive: 'bg-primary-500/10', borderActive: 'border-primary-500', shadowActive: 'shadow-[0_0_10px_rgba(0,255,136,0.3)]' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-slate-400', bgHover: 'hover:bg-slate-400/10', borderHover: 'hover:border-slate-400/30', bgActive: 'bg-slate-400/10', borderActive: 'border-slate-400', shadowActive: 'shadow-[0_0_10px_rgba(100,116,139,0.3)]' },
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
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-30 md:hidden"
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
          'bg-slate-950/90 backdrop-blur-md border-r border-slate-800 transition-all duration-300 ease-in-out',
          expanded ? 'w-64 sm:w-72' : 'w-16 md:w-20'
        )}
        initial={false}
        animate={{ x: 0 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Animated Right Border Breathe */}
        <div className="absolute top-0 right-0 h-full w-[1px] bg-primary-500/30 animate-border-breathe" />

        <div className={cn(
          'flex flex-col h-full overflow-hidden transition-opacity duration-200',
          isOpen || hovered || !expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          {/* Header / Logo */}
          <div
            className={`flex items-center justify-between border-b border-slate-800 transition-all duration-300 ${expanded ? 'h-32 flex-col px-3 sm:px-4 py-4' : 'h-24 px-2 py-3'}`}
          >
            <div className={`flex ${expanded ? 'flex-col items-center w-full' : 'items-center justify-center w-full'} gap-2`}>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={cn(
                  "bg-slate-900 border border-primary-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)] text-primary-500 font-orbitron font-bold",
                  expanded ? 'w-16 h-16 rounded-xl text-3xl' : 'w-11 h-11 rounded-lg text-xl'
                )}>
                  R
                </div>
              </motion.div>
              {!expanded && (
                <motion.div
                  className="absolute top-[62px] left-1/2 -translate-x-1/2 text-[9px] font-orbitron font-bold tracking-widest text-center leading-[0.95] text-primary-500/80"
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
                  className="flex flex-col items-center space-y-0 mt-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <span className="text-xl font-orbitron font-bold text-primary-500 tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] uppercase leading-tight">
                    RAGHHAV
                  </span>
                  <span className="text-sm font-orbitron font-bold text-brand-500 tracking-[0.3em] uppercase leading-tight">
                    ROADWAYS
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 sm:py-6 custom-scrollbar">
            <div className={cn('space-y-2', expanded ? 'px-3 sm:px-4' : 'px-2')}>
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
                        'flex w-full items-center py-2.5 sm:py-3 text-[13px] sm:text-sm rounded-xl transition-all duration-200 relative overflow-hidden font-medium',
                        expanded ? 'px-3' : 'min-h-12 px-0 justify-center',
                        isActive
                          ? `${item.bgActive} ${item.color} ${item.shadowActive} border border-[${item.borderActive}] font-semibold`
                          : `text-slate-400 ${item.bgHover} hover:${item.color} border border-transparent ${item.borderHover}`
                      )}
                      title={!expanded ? item.name : undefined}
                      style={isActive ? { borderColor: 'currentColor' } : {}}
                    >
                      <Icon className={cn("relative z-10 w-5 h-5 flex-shrink-0 transition-colors", isActive ? "" : "opacity-70")} />
                      {expanded && (
                        <motion.span
                          className="relative z-10 ml-3 whitespace-nowrap tracking-wide"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-800 p-3 sm:p-4 bg-slate-900/50">
            {expanded ? (
              <p className="text-xs text-slate-500 text-center font-orbitron tracking-widest uppercase">v1.0.0</p>
            ) : (
              <div className="h-2"></div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
