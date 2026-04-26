'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FileText, ArrowLeft, Check } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { GlassCard } from '@/components/ui/glass-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { invoiceAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await invoiceAPI.getById(params.id);
        const data = response.data.data;
        reset(data);
      } catch (error) {
        toast.error('Failed to load invoice');
        console.error('Fetch error:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchInvoice();
  }, [params.id, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await invoiceAPI.update(params.id, {
        ...data,
        amount: parseFloat(data.amount),
      });

      toast.success('Invoice updated successfully!');
      router.push(`/invoices/${params.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  ];

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin" />
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
      <div className="flex items-center gap-4">
        <Link href={`/invoices/${params.id}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-glass hover:bg-glass-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </Link>
        <SectionHeader
          title="Edit Invoice"
          description="Update invoice details and payment information."
          icon={FileText}
          variant="blue"
          className="mb-0"
        />
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard variant="premium">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    disabled
                    {...register('invoiceNumber')}
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Status
                  </label>
                  <select
                    {...register('paymentStatus')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Party</label>
                  <input
                    type="text"
                    placeholder="Party name/ID"
                    {...register('partyId')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    {...register('amount')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    {...register('invoiceDate')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    {...register('dueDate')}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  placeholder="Invoice items and details"
                  rows="4"
                  {...register('description')}
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                <textarea
                  placeholder="Additional notes or payment instructions"
                  rows="3"
                  {...register('notes')}
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/invoices/${params.id}`} className="flex-1">
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

        <div className="lg:col-span-1">
          <GlassCard variant="blue">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Status Options</h3>
              <div className="space-y-2 text-sm">
                {statusOptions.map((opt) => (
                  <div key={opt.value} className={`p-2 rounded-lg ${opt.color}`}>
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
