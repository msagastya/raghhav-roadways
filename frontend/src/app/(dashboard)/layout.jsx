'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { cn } from '../../lib/utils';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        )}
      >
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
