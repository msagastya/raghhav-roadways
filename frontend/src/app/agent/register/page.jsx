'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { agentAuthAPI } from '@/lib/agentApi';
import api from '@/lib/api';

export default function AgentRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        mobile: '',
        address: '',
        stateId: '',
        cityId: '',
        pincode: '',
    });

    useEffect(() => {
        fetchStates();
    }, []);

    useEffect(() => {
        if (formData.stateId) {
            fetchCities(formData.stateId);
        } else {
            setCities([]);
        }
    }, [formData.stateId]);

    const fetchStates = async () => {
        try {
            const response = await api.get('/masters/states');
            setStates(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch states:', err);
        }
    };

    const fetchCities = async (stateId) => {
        try {
            const response = await api.get(`/masters/states/${stateId}/cities`);
            setCities(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch cities:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const validateStep1 = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.fullName || !formData.mobile) {
            setError('Please fill in all required fields');
            return false;
        }
        if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
            setError('');
        }
    };

    const handleBack = () => {
        setStep(1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setIsLoading(true);
        setError('');

        try {
            const { confirmPassword, ...submitData } = formData;
            await agentAuthAPI.register(submitData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 p-8 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 mb-6"
                    >
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your account is pending approval. We will notify you once your account is verified.
                    </p>

                    <Link
                        href="/agent/login"
                        className="inline-block w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                    >
                        Go to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

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
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl"
                    animate={{
                        x: [0, -80, 0],
                        y: [0, -60, 0],
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                />

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

            {/* Registration Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl shadow-teal-500/10 border border-white/50 p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30 mb-4"
                        >
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
                        <p className="text-gray-500 mt-1">Join as a vehicle partner</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step >= 1 ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            1
                        </div>
                        <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-teal-500 to-cyan-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step >= 2 ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            2
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100"
                        >
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Confirm password"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none"
                                        placeholder="Your address"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                                        <select
                                            name="stateId"
                                            value={formData.stateId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        >
                                            <option value="">Select</option>
                                            {states.map(state => (
                                                <option key={state.id} value={state.id}>{state.stateName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                                        <select
                                            name="cityId"
                                            value={formData.cityId}
                                            onChange={handleChange}
                                            disabled={!formData.stateId}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none disabled:opacity-50"
                                        >
                                            <option value="">Select</option>
                                            {cities.map(city => (
                                                <option key={city.id} value={city.id}>{city.cityName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        maxLength={6}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        placeholder="6-digit pincode"
                                    />
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                                    >
                                        {isLoading ? 'Registering...' : 'Register'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-6 text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/agent/login" className="text-teal-600 hover:text-teal-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
