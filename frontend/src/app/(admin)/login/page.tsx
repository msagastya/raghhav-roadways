/**
 * Admin Login Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/contexts/admin-auth-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    adminId: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.adminId || !formData.password) {
      setFormError('Admin ID and password are required');
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.adminId, formData.password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-slate-900 text-white px-4 py-2 rounded-lg mb-4">
            <span className="text-sm font-bold uppercase tracking-wider">Admin Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Raghhav Roadways</h1>
          <p className="text-gray-600 mt-2">Administrator Access</p>
        </div>

        {(formError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin ID
            </label>
            <input
              type="text"
              name="adminId"
              value={formData.adminId}
              onChange={handleChange}
              placeholder="admin_user_1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
              disabled={isLoading}
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
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm mb-3">User?</p>
          <Link
            href="/login"
            className="block w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold py-2 rounded-lg text-center transition"
          >
            Go to User Login
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>For support, contact the system administrator</p>
        </div>
      </div>
    </div>
  );
}
