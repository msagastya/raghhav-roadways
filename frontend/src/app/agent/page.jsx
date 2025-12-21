'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { agentAuthAPI, agentVehicleAPI } from '@/lib/agentApi';
import useAgentAuth from '@/hooks/useAgentAuth';

// Stat Card Component
function StatCard({ title, value, icon, color, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="relative overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-100/50 border border-gray-100 p-5"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={`text-3xl font-bold mt-1 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                        {value}
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}

// Alert Card Component
function AlertCard({ title, items, icon, color }) {
    if (!items || items.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden"
        >
            <div className={`px-5 py-4 bg-gradient-to-r ${color} flex items-center gap-3`}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                    {icon}
                </div>
                <h3 className="text-white font-semibold">{title}</h3>
            </div>
            <ul className="p-4 space-y-3">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                            <p className="font-medium text-gray-800">{item.vehicleNo}</p>
                            <p className="text-sm text-gray-500">{item.type || item.vehicleType}</p>
                        </div>
                        {item.expiryDate && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.isExpired ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                {item.isExpired ? 'Expired' : `Expires ${new Date(item.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

// Quick Action Button
function QuickAction({ href, icon, label, color }) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg hover:scale-105 transition-transform`}
        >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                {icon}
            </div>
            <span className="text-sm font-medium text-center">{label}</span>
        </Link>
    );
}

export default function AgentDashboardPage() {
    const { agent } = useAgentAuth();
    const [stats, setStats] = useState(null);
    const [expiringDocs, setExpiringDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, expiringRes] = await Promise.all([
                agentAuthAPI.getDashboardStats(),
                agentVehicleAPI.getExpiringDocuments(30),
            ]);
            setStats(statsRes.data.data);

            // Flatten expiring documents
            const expiring = [];
            (expiringRes.data.data || []).forEach(vehicle => {
                vehicle.expiringDocuments?.forEach(doc => {
                    expiring.push({
                        vehicleNo: vehicle.vehicleNo,
                        type: doc.type,
                        expiryDate: doc.expiryDate,
                        isExpired: doc.isExpired,
                    });
                });
            });
            setExpiringDocs(expiring);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-24 bg-gray-100 rounded-2xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 p-6 text-white"
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative">
                    <p className="text-white/80 text-sm">{getGreeting()}</p>
                    <h1 className="text-2xl font-bold mt-1">{agent?.fullName || 'Agent'} 👋</h1>
                    <p className="text-white/70 mt-2 text-sm">
                        {stats?.totalVehicles > 0
                            ? `You have ${stats.totalVehicles} vehicle${stats.totalVehicles > 1 ? 's' : ''} registered`
                            : "Add your first vehicle to get started"}
                    </p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Vehicles"
                    value={stats?.totalVehicles || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                    color="from-teal-500 to-cyan-600"
                    delay={0.1}
                />
                <StatCard
                    title="Verified"
                    value={stats?.verifiedVehicles || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="from-emerald-500 to-green-600"
                    delay={0.15}
                />
                <StatCard
                    title="Pending"
                    value={stats?.pendingVerification || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="from-amber-500 to-orange-600"
                    delay={0.2}
                />
                <StatCard
                    title="Doc Alerts"
                    value={expiringDocs.length}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    color="from-red-500 to-rose-600"
                    delay={0.25}
                />
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                    <QuickAction
                        href="/agent/vehicles/new"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                        label="Add Vehicle"
                        color="from-teal-500 to-cyan-600"
                    />
                    <QuickAction
                        href="/agent/availability"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        label="Set Available"
                        color="from-emerald-500 to-green-600"
                    />
                    <QuickAction
                        href="/agent/vehicles"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                        label="My Vehicles"
                        color="from-blue-500 to-indigo-600"
                    />
                </div>
            </motion.div>

            {/* Document Alerts */}
            {expiringDocs.length > 0 && (
                <AlertCard
                    title={`${expiringDocs.length} Document${expiringDocs.length > 1 ? 's' : ''} Expiring Soon`}
                    items={expiringDocs.slice(0, 5)}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    color="from-amber-500 to-orange-500"
                />
            )}

            {/* Empty State */}
            {stats?.totalVehicles === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 px-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">No Vehicles Yet</h3>
                    <p className="text-gray-500 mt-2 mb-6">Add your first vehicle to start receiving trips</p>
                    <Link
                        href="/agent/vehicles/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/20 hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Your First Vehicle
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
