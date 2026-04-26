'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Package, ArrowLeft, Check } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { GlassCard } from '@/components/ui/glass-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { consignmentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditConsignmentPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  const status = watch('status');

  useEffect(() => {
    const fetchConsignment = async () => {
      try {
        const response = await consignmentAPI.getById(params.id);
        const data = response.data.data;
        reset(data);
      } catch (error) {
        toast.error('Failed to load consignment');
        console.error('Fetch error:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchConsignment();
  }, [params.id, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await consignmentAPI.update(params.id, {
        ...data,
        amount: parseFloat(data.amount),
        weight: parseFloat(data.weight),
      });

      toast.success('Consignment updated successfully!');
      router.push(`/consignments/${params.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update consignment');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in-transit', label: 'In Transit', color: 'bg-blue-100 text-blue-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href={`/consignments/${params.id}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-glass hover:bg-glass-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </Link>
        <SectionHeader
          title="Edit Consignment"
          description="Update consignment details and tracking information."
          icon={Package}
          variant="primary"
          className="mb-0"
        />
      </div>

      {/* Form Section */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <GlassCard variant="premium">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* GR Number & Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    GR Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., GR-2024-001"
                    disabled
                    {...register('grNumber', { required: 'GR Number is required' })}
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Consignor & Consignee Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Consignor
                  </label>
                  <input
                    type="text"
                    placeholder="Consignor name/ID"
                    {...register('consignorId')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Consignee
                  </label>
                  <input
                    type="text"
                    placeholder="Consignee name/ID"
                    {...register('consigneeId')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Origin & Destination Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Origin
                  </label>
                  <input
                    type="text"
                    placeholder="Origin city/location"
                    {...register('origin')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="Destination city/location"
                    {...register('destination')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Vehicle & Driver Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle ID
                  </label>
                  <input
                    type="text"
                    placeholder="Vehicle registration/ID"
                    {...register('vehicleId')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Driver ID
                  </label>
                  <input
                    type="text"
                    placeholder="Driver name/ID"
                    {...register('driverId')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Amount & Weight Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    {...register('amount')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    {...register('weight')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Items Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Items Description
                </label>
                <input
                  type="text"
                  placeholder="Description of items being shipped"
                  {...register('items')}
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              {/* Notes Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Additional notes or special instructions"
                  rows="4"
                  {...register('notes')}
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/consignments/${params.id}`} className="flex-1">
                  <PremiumButton variant="outline" className="w-full">
                    Cancel
                  </PremiumButton>
                </Link>
                <PremiumButton
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  icon={Check}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </PremiumButton>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard variant="blue">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Status Guide</h3>
              <div className="space-y-2 text-sm">
                {statusOptions.map((opt) => (
                  <div
                    key={opt.value}
                    className={`p-2 rounded-lg ${
                      status === opt.value
                        ? opt.color
                        : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                    } transition-all`}
                  >
                    <strong>{opt.label}</strong>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </motion.div>
  );
}
