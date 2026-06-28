'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { authAPI, warmupAPI } from '../../../lib/api';
import useAuthStore from '../../../store/authStore';
import useToast from '../../../hooks/useToast';
import { getErrorMessage } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [slowLogin, setSlowLogin] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    warmupAPI();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setSlowLogin(false);
    const slowTimer = window.setTimeout(() => setSlowLogin(true), 3500);
    try {
      const response = await authAPI.login(formData);
      const { user, accessToken, refreshToken } = response.data.data;

      setTokens(accessToken, refreshToken);
      setUser(user);

      showSuccess('Login successful!');
      window.location.href = '/consignments';
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      window.clearTimeout(slowTimer);
      setLoading(false);
      setSlowLogin(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative animate-warp-in z-10">
      <div className="absolute inset-0 bg-primary-500/10 blur-[80px] rounded-full z-[-1]"></div>
      
      <div className="bg-slate-950/95 backdrop-blur-xl border border-primary-500/30 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-[0_0_40px_rgba(0,255,136,0.15)]">
        
        {/* Animated Corner Chrome Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-500 rounded-tl-3xl opacity-50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-500 rounded-tr-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-500 rounded-bl-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-500 rounded-br-3xl opacity-50"></div>
        
        {/* Animated Top Bar Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500 shadow-[0_0_15px_rgba(0,255,136,1)] animate-neon-pulse" />

        <div className="text-center mb-8 relative">
          <motion.div
            className="w-24 h-24 mx-auto mb-4 relative rounded-2xl flex items-center justify-center overflow-hidden border border-primary-500/40 shadow-[0_0_20px_rgba(0,255,136,0.2)] bg-slate-900/50 backdrop-blur-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(0,255,136,0.4)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
             <div className="absolute inset-0 bg-primary-500/10 animate-neon-pulse z-0" />
             <Image src="/logo.png" alt="Raghhav Roadways Logo" fill className="object-contain p-3 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-white tracking-widest uppercase mb-1">
            Raghhav <span className="text-brand-500">Roadways</span>
          </h2>
          <p className="text-xs font-orbitron text-primary-500/80 tracking-[0.3em] uppercase">
            Security Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-orbitron text-slate-400 tracking-wider uppercase ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500/70" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-all font-sans"
                placeholder="Enter identifier..."
                autoComplete="off"
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-orbitron text-slate-400 tracking-wider uppercase ml-1">Passcode</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500/70" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-all font-sans"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500/10 border border-primary-500/50 text-primary-500 hover:bg-primary-500/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] rounded-xl py-3.5 font-orbitron font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 group mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <div className="h-6 mt-4 relative flex items-center justify-center">
          <AnimatePresence initial={false}>
            {slowLogin && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-center text-[10px] font-orbitron text-brand-500 tracking-wider absolute w-full"
              >
                SYSTEM WAKING UP... PLEASE HOLD
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[10px] font-orbitron text-slate-500 tracking-[0.2em] uppercase flex items-center justify-center gap-2">
          <Lock className="w-3 h-3" /> Encrypted Connection
        </p>
      </div>
    </div>
  );
}
