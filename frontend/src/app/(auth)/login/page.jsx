'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Eye, EyeOff, AlertCircle, User, CheckCircle2, ArrowRight } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await login(username, password);
      setLoginSuccess(true);
      // Delay redirect to show success state
      setTimeout(() => {
        router.push('/consignments');
      }, 1200);
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Login failed');
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #f8faf9 0%, #f0f7f2 30%, #eef5f0 60%, #f5f8f6 100%)' }}
    >
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }}
      />

      {/* Logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="relative w-[500px] h-[500px]" style={{ opacity: 0.03 }}>
          <Image src="/logo.png" alt="" fill className="object-contain" priority />
        </div>
      </div>

      {/* Decorative line pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #166534 1px, transparent 1px),
            linear-gradient(#166534 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {loginSuccess ? (
          /* Success State */
          <motion.div
            key="success"
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome back!
            </motion.h2>
            <motion.p
              className="text-gray-500 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Redirecting to your dashboard...
            </motion.p>
            <motion.div
              className="flex items-center justify-center gap-2 text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading dashboard</span>
            </motion.div>
          </motion.div>
        ) : (
          /* Login Form */
          <motion.div
            key="form"
            className="relative z-10 w-full max-w-[440px] mx-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            {/* Branding */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-block mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="w-16 h-16 mx-auto relative drop-shadow-md">
                  <Image src="/logo.png" alt="Raghhav Roadways" fill className="object-contain" priority />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">RAGHHAV ROADWAYS</h1>
              <div className="w-10 h-[2px] bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-2.5 rounded-full" />
              <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mt-2">Transport Management System</p>
            </div>

            {/* Glass Card */}
            <motion.div
              className="rounded-2xl p-7 sm:p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,1)',
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
                <p className="text-gray-500 text-sm mt-1">Enter your credentials to access the system</p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {displayError && (
                  <motion.div
                    className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{displayError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Username</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 bg-gray-50 border border-gray-200 focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100 hover:border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 bg-gray-50 border border-gray-200 focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100 hover:border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 mt-2 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    boxShadow: '0 4px 14px rgba(34,197,94,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                  whileHover={!submitting ? { y: -1, boxShadow: '0 6px 20px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' } : {}}
                  whileTap={!submitting ? { scale: 0.98 } : {}}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Links */}
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid #f0f0f0' }}>
                <p className="text-center text-sm text-gray-500">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                    Sign Up
                  </Link>
                </p>
                <p className="text-center text-xs text-gray-400 mt-2">
                  Forgot your password? Contact your administrator.
                </p>
              </div>
            </motion.div>

            {/* Footer */}
            <p className="text-center text-gray-400 text-xs mt-6">&copy; 2026 Raghhav Roadways. All rights reserved.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
