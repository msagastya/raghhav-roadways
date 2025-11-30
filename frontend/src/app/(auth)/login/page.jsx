'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Truck, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { authAPI } from '../../../lib/api';
import useAuthStore from '../../../store/authStore';
import useToast from '../../../hooks/useToast';
import { getErrorMessage } from '../../../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const floatingVariants = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    try {
      const response = await authAPI.login(formData);
      const { user, accessToken, refreshToken } = response.data.data;

      setTokens(accessToken, refreshToken);
      setUser(user);

      showSuccess('Login successful!');
      router.push('/');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto"
    >
      {/* Decorative Elements - Hidden on larger screens to reduce clutter */}
      <motion.div
        className="absolute top-10 left-10 w-16 h-16 md:w-20 md:h-20 lg:w-16 lg:h-16 bg-primary-400/20 rounded-full blur-xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-24 h-24 md:w-32 md:h-32 lg:w-24 lg:h-24 bg-brand-400/20 rounded-full blur-xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <Card className="w-full relative overflow-hidden backdrop-blur-sm bg-white/90">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-brand-500/10 pointer-events-none" />

        <CardHeader className="text-center relative">
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center mb-6"
          >
            {/* Animated Logo */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-primary-400/30 rounded-2xl blur-xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <img
                src="/logo.png"
                alt="Raghhav Roadways Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-32 lg:h-32 object-contain rounded-2xl shadow-2xl relative z-10 border-2 border-white/50"
              />
            </motion.div>

            {/* Animated Title */}
            <motion.div
              variants={itemVariants}
              className="space-y-0 mt-4"
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-brand font-bold tracking-wider uppercase leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #1a4d2e 0%, #2d6b45 50%, #1a4d2e 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                RAGHHAV
              </motion.h1>
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-brand font-bold tracking-wider uppercase leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #1a4d2e 0%, #2d6b45 50%, #1a4d2e 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ROADWAYS
              </motion.h1>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4 text-primary-500" />
            <p className="text-gray-600 text-sm font-medium">Transport Management System</p>
            <Sparkles className="w-4 h-4 text-primary-500" />
          </motion.div>
        </CardHeader>

        <CardContent className="relative">
          <motion.form
            variants={containerVariants}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <motion.div variants={itemVariants}>
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                required
                autoFocus
                placeholder="Enter your username"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder="Enter your password"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full group relative overflow-hidden"
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </>
                  )}
                </span>
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New to Raghhav Roadways?</span>
              </div>
            </div>
            <motion.a
              href="/signup"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create an account
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </CardContent>
      </Card>

      {/* Footer */}
      <motion.p
        variants={itemVariants}
        className="mt-6 text-center text-xs text-gray-500"
      >
        Secure login powered by advanced encryption
      </motion.p>
    </motion.div>
  );
}
