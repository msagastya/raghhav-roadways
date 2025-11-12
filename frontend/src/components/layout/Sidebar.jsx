'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Receipt,
  CreditCard,
  Users,
  Truck,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Consignments', href: '/consignments', icon: FileText },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Parties', href: '/parties', icon: Users },
  { name: 'Vehicles', href: '/vehicles', icon: Truck },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40',
        isOpen ? 'w-64' : 'w-0 md:w-20'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-800">
          <Truck className="w-8 h-8 text-primary-400" />
          {isOpen && (
            <span className="ml-3 text-lg font-semibold">Raghhav Roadways</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          <p className={cn('text-xs text-gray-500', !isOpen && 'hidden')}>
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
