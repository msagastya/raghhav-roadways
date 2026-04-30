'use client';

import { useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import PageTransition from '../../components/layout/PageTransition';
import useAuth from '../../hooks/useAuth';
import useUIStore from '../../store/uiStore';
import { cn } from '../../lib/utils';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary-400/30 rounded-full blur-xl animate-pulse"></div>
            <img
              src="/logo.png"
              alt="Loading"
              className="w-20 h-20 object-contain rounded-xl shadow-lg relative z-10 animate-pulse"
            />
          </div>
          {/* Loading Spinner */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-primary-100"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative">
      {/* Full-screen Logo Watermark Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt=""
            className="w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] object-contain opacity-[0.04] dark:opacity-[0.03] select-none"
            draggable={false}
          />
        </div>
        {/* Subtle gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.02] via-transparent to-primary-600/[0.02]" />
      </div>

      <Sidebar isOpen={sidebarOpen} />
      <div
        className={cn(
          'transition-all duration-300 min-h-screen relative z-10',
          sidebarHovered || sidebarOpen ? 'md:ml-72' : 'md:ml-20'
        )}
      >
        <Header />
        <main className="p-3 sm:p-4 lg:p-6 xl:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
