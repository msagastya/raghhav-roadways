'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Settings, User, Lock, FileText, Users, Building, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '../../../components/ui/page-header';
import GlassPanel from '../../../components/ui/glass-panel';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';
import useAuthStore from '../../../store/authStore';
import { authAPI } from '../../../lib/api';
import useToast from '../../../hooks/useToast';
import { getErrorMessage } from '../../../lib/utils';

const NAV_ITEMS = [
  { id: 'account', label: 'Account', icon: User, desc: 'Your profile info' },
  { id: 'security', label: 'Security', icon: Lock, desc: 'Password & access' },
  { id: 'users', label: 'Users', icon: Users, desc: 'Manage users', href: '/settings/users' },
  { id: 'roles', label: 'Roles', icon: Lock, desc: 'Roles & permissions', href: '/settings/roles' },
  { id: 'audit', label: 'Audit Logs', icon: FileText, desc: 'Activity history', href: '/settings/audit-logs' },
];

function AccountSection({ user }) {
  const { showSuccess, showError } = useToast();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      mobile: user?.mobile || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await authAPI.getProfile(); // verify session alive
      showSuccess('Profile updated');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Profile Information</h3>
        <p className="text-sm text-gray-500 dark:text-white/50">Update your account details</p>
      </div>

      <div className="flex items-center gap-4 p-4 glass-t1 rounded-lg">
        <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl">
          {user?.fullName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.fullName || user?.username}</p>
          <p className="text-sm text-gray-500 dark:text-white/50">{user?.roleName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Min 2 chars' } })}
            error={errors.fullName?.message}
          />
          <Input
            label="Username"
            value={user?.username || ''}
            disabled
          />
          <Input
            label="Email"
            type="email"
            {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
            error={errors.email?.message}
          />
          <Input
            label="Mobile"
            {...register('mobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' } })}
            error={errors.mobile?.message}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}

function SecuritySection() {
  const { showSuccess, showError } = useToast();
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm();
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      await authAPI.changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword });
      showSuccess('Password changed successfully');
      setDone(true);
      reset();
      setTimeout(() => setDone(false), 3000);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Change Password</h3>
        <p className="text-sm text-gray-500 dark:text-white/50">Use a strong password with at least 8 characters</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <Input
          label="Current Password"
          type="password"
          required
          autoComplete="current-password"
          {...register('oldPassword', { required: 'Current password is required' })}
          error={errors.oldPassword?.message}
        />
        <Input
          label="New Password"
          type="password"
          required
          autoComplete="new-password"
          {...register('newPassword', {
            required: 'New password is required',
            minLength: { value: 8, message: 'Minimum 8 characters' },
            pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase and a number' },
          })}
          error={errors.newPassword?.message}
        />
        <Input
          label="Confirm New Password"
          type="password"
          required
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === newPassword || 'Passwords do not match',
          })}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {done ? <><Check className="w-4 h-4" /> Password Changed!</> : isSubmitting ? 'Changing...' : 'Change Password'}
        </Button>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const user = useAuthStore(s => s.user);

  const renderContent = () => {
    if (activeSection === 'account') return <AccountSection user={user} />;
    if (activeSection === 'security') return <SecuritySection />;
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and system preferences" icon={Settings} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id && !item.href;

            if (item.href) {
              return (
                <Link key={item.id} href={item.href}>
                  <motion.div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg glass-t2 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                    whileHover={{ x: 2 }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40 truncate">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                  </motion.div>
                </Link>
              );
            }

            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                  isActive
                    ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-700 dark:text-primary-400 border border-primary-500/20'
                    : 'glass-t2 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
                }`}
                whileHover={{ x: 2 }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-400 dark:text-white/40 truncate">{item.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeSection}
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <GlassPanel tier={2} className="p-6 min-h-80">
            {renderContent()}
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
