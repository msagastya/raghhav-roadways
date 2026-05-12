'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Users, ArrowLeft, Check } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { GlassCard } from '@/components/ui/glass-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { partyAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreatePartyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      partyName: '',
      partyType: 'consignor',
      city: '',
      gstin: '',
      creditLimit: '',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      address: '',
      active: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await partyAPI.create({
        ...data,
        creditLimit: parseFloat(data.creditLimit),
      });
      toast.success('Party created successfully!');
      router.push('/parties');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create party');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4">
        <Link href="/parties">
          <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded-lg bg-glass hover:bg-glass-hover">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </Link>
        <SectionHeader title="Create Party" description="Add a new consignor or consignee." icon={Users} variant="orange" className="mb-0" />
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard variant="premium">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Party Name *</label>
                  <input type="text" placeholder="Company or individual name" {...register('partyName', { required: 'Required' })} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select {...register('partyType')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="consignor">Consignor (Shipper)</option>
                    <option value="consignee">Consignee (Receiver)</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">City</label>
                  <input type="text" placeholder="City name" {...register('city')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">GSTIN</label>
                  <input type="text" placeholder="Goods and Services Tax ID" {...register('gstin')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Person</label>
                  <input type="text" placeholder="Name" {...register('contactPerson')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX" {...register('phoneNumber')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input type="email" placeholder="email@example.com" {...register('email')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Credit Limit (₹)</label>
                  <input type="number" placeholder="0.00" step="0.01" {...register('creditLimit')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Address</label>
                <textarea placeholder="Full address" rows="3" {...register('address')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" {...register('active')} className="w-4 h-4 rounded cursor-pointer" defaultChecked />
                <label htmlFor="active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Status</label>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href="/parties" className="flex-1">
                  <PremiumButton variant="outline" className="w-full">Cancel</PremiumButton>
                </Link>
                <PremiumButton type="submit" disabled={loading} loading={loading} icon={Check} className="flex-1">{loading ? 'Creating...' : 'Create Party'}</PremiumButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </motion.div>
    </motion.div>
  );
}
