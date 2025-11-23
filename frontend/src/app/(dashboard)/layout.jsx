'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import PageTransition from '../../components/layout/PageTransition';
import useAuth from '../../hooks/useAuth';
import useUIStore from '../../store/uiStore';
import { cn } from '../../lib/utils';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { sidebarOpen } = useUIStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarOpen ? 'sm:ml-64 lg:ml-72' : 'md:ml-16 lg:ml-20'
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
