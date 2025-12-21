'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import useAgentAuth from '@/hooks/useAgentAuth';

// Sidebar navigation items
const navItems = [
    {
        name: 'Dashboard',
        href: '/agent',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: 'My Vehicles',
        href: '/agent/vehicles',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
    },
    {
        name: 'Availability',
        href: '/agent/availability',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        name: 'Trip History',
        href: '/agent/trips',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
    },
    {
        name: 'Profile',
        href: '/agent/profile',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

export default function AgentDashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { agent, isAuthenticated, isLoading, logout } = useAgentAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/agent/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogout = () => {
        logout();
        router.push('/agent/login');
    };

    // Don't show layout for login/register pages
    if (pathname === '/agent/login' || pathname === '/agent/register') {
        return children;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-xl animate-pulse" />
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg relative z-10">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-teal-100" />
                        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-teal-600 animate-spin" />
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100">
                <div className="flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            Agent Portal
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{agent?.fullName?.split(' ')[0]}</span>
                    </div>
                </div>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 backdrop-blur-xl bg-white/90 border-r border-gray-100 z-50">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 h-20 border-b border-gray-100">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            Agent Portal
                        </span>
                        <p className="text-xs text-gray-400">Raghhav Roadways</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/agent' && pathname.startsWith(item.href));
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/20'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                            {agent?.fullName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{agent?.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{agent?.agentCode}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full mt-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64">
                <main className="p-4 pt-20 lg:pt-8 lg:p-8 min-h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 border-t border-gray-100 px-2 pb-safe">
                <div className="flex items-center justify-around h-16">
                    {navItems.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/agent' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${isActive ? 'text-teal-600' : 'text-gray-400'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-teal-50' : ''}`}>
                                    {item.icon}
                                </div>
                                <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
