'use client';

import { useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import PageTransition from '../../components/layout/PageTransition';
import useAuth from '../../hooks/useAuth';
import useUIStore from '../../store/uiStore';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { sidebarOpen, sidebarHovered } = useUIStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative z-50">
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative">
            <motion.div 
               className="w-24 h-24 border border-primary-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.15)] bg-slate-900/50 backdrop-blur-md relative overflow-hidden"
               animate={{ y: [-10, 10, -10] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 bg-primary-500/10 animate-neon-pulse z-0" />
              <Image src="/logo.png" alt="Loader Logo" fill className="object-contain p-3 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            </motion.div>
            
            {/* Spinning ring */}
            <motion.div
              className="absolute -inset-4 border-2 border-dashed border-primary-500/40 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          
          <div className="space-y-2 text-center">
            <p className="text-primary-500 font-orbitron font-bold tracking-[0.2em] uppercase text-sm animate-pulse">
              System Initializing
            </p>
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-brand-500 rounded-full shadow-[0_0_5px_rgba(0,212,255,0.8)]"
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen relative text-slate-100 selection:bg-primary-500/30">
      
      {/* Full-screen Logo Watermark Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.03]">
         <motion.div
           animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
           transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
           className="w-[80vw] h-[80vw] max-w-4xl max-h-[80vh] relative"
         >
           <Image src="/logo.png" alt="Watermark" fill className="object-contain grayscale" />
         </motion.div>
      </div>

      <Sidebar isOpen={sidebarOpen} />
      
      <div
        className={cn(
          'ml-16 transition-all duration-300 min-h-screen relative z-10 flex flex-col',
          sidebarHovered || sidebarOpen ? 'md:ml-72' : 'md:ml-20'
        )}
      >
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 relative">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
