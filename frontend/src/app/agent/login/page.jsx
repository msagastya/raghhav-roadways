'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { agentAuthAPI } from '@/lib/agentApi';
import useAgentAuthStore from '@/store/agentAuthStore';

export default function AgentLoginPage() {
    const router = useRouter();
    const { setAgent, setTokens } = useAgentAuthStore();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await agentAuthAPI.login(formData);
            const { accessToken, refreshToken, agent } = response.data.data;

            setTokens(accessToken, refreshToken);
            setAgent(agent);

            router.push('/agent');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-100">
                <motion.div
                    className="absolute top-0 left-0 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute top-1/2 right-0 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl"
                    animate={{
                        x: [0, -80, 0],
                        y: [0, -60, 0],
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bottom-0 left-1/3 w-72 h-72 bg-sky-300/30 rounded-full blur-3xl"
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl shadow-teal-500/10 border border-white/50 p-8">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30 mb-4"
                        >
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-800">Agent Portal</h1>
                        <p className="text-gray-500 mt-1">Raghhav Roadways</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100"
                        >
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing In...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                        <span className="text-sm text-gray-400">New here?</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    </div>

                    {/* Register Link */}
                    <Link
                        href="/agent/register"
                        className="block w-full py-3 px-4 text-center bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                        Create Agent Account
                    </Link>

                    {/* Admin Login Link */}
                    <p className="text-center mt-6 text-sm text-gray-500">
                        Admin?{' '}
                        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                            Login here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
