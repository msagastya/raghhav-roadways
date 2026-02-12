'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Truck, ArrowLeft, Check } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { GlassCard } from '@/components/ui/glass-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { vehicleAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      registrationNumber: '',
      make: '',
      model: '',
      ownerName: '',
      capacity: '',
      status: 'active',
      fitnessExpiry: '',
      insuranceExpiry: '',
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await vehicleAPI.create({
        ...data,
        capacity: parseFloat(data.capacity),
      });
      toast.success('Vehicle created successfully!');
      router.push(`/vehicles/${response.data.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-4">
        <Link href="/vehicles">
          <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded-lg bg-glass hover:bg-glass-hover">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </Link>
        <SectionHeader title="Register Vehicle" description="Add a new vehicle to the fleet." icon={Truck} variant="blue" className="mb-0" />
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard variant="premium">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Registration Number *</label>
                  <input type="text" placeholder="e.g., KA-01-AB-1234" {...register('registrationNumber', { required: 'Required' })} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select {...register('status')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Make</label>
                  <input type="text" placeholder="Vehicle make (e.g., Tata)" {...register('make')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Model</label>
                  <input type="text" placeholder="Vehicle model (e.g., 407)" {...register('model')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Owner Name</label>
                  <input type="text" placeholder="Owner or operator name" {...register('ownerName')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Capacity (Tonnes)</label>
                  <input type="number" placeholder="0.00" step="0.01" {...register('capacity')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fitness Expiry</label>
                  <input type="date" {...register('fitnessExpiry')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Insurance Expiry</label>
                  <input type="date" {...register('insuranceExpiry')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                <textarea placeholder="Additional details or maintenance notes" rows="4" {...register('notes')} className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href="/vehicles" className="flex-1">
                  <PremiumButton variant="outline" className="w-full">Cancel</PremiumButton>
                </Link>
                <PremiumButton type="submit" disabled={loading} loading={loading} icon={Check} className="flex-1">{loading ? 'Registering...' : 'Register Vehicle'}</PremiumButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </motion.div>
    </motion.div>
  );
}
