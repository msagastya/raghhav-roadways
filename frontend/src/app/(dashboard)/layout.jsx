'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import PageTransition from '../../components/layout/PageTransition';
import CommandPalette from '../../components/shared/CommandPalette';
import useAuth from '../../hooks/useAuth';
import useUIStore from '../../store/uiStore';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useServiceWorker from '../../hooks/useServiceWorker';
import ErrorBoundary from '../../components/shared/ErrorBoundary';
import { cn } from '../../lib/utils';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { sidebarOpen } = useUIStore();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Register service worker
  useServiceWorker();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      {/* Command Palette */}
      <CommandPalette />

      <Sidebar isOpen={sidebarOpen} />
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarOpen ? 'sm:ml-64 lg:ml-72' : 'md:ml-16 lg:ml-20'
        )}
      >
        <Header />
        <main className="p-3 sm:p-4 lg:p-6 xl:p-8">
          <ErrorBoundary>
            <PageTransition>{children}</PageTransition>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
