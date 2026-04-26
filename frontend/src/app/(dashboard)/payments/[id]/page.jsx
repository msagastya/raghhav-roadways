'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { paymentAPI } from '../../../../lib/api';
import PageHeader from '../../../../components/ui/page-header';
import GlassPanel from '../../../../components/ui/glass-panel';
import StatusBadge from '../../../../components/ui/status-badge';
import useToast from '../../../../hooks/useToast';
import { formatDate, formatCurrency } from '../../../../lib/utils';

export default function PaymentDetailPage() {
  const params = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await paymentAPI.getById(params.id);
        setPayment(res.data?.data);
      } catch (error) {
        showError('Failed to load payment');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="h-64 bg-white/60 dark:bg-white/10 rounded-lg animate-pulse" />;

  if (!payment) return <div className="text-gray-500 dark:text-white/60 text-center py-12">Payment not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Payment #${payment.paymentNumber}`}
        subtitle="Payment Details"
        icon={DollarSign}
        stats={[
          { label: 'Date', value: formatDate(payment.paymentDate, 'dd/MMM/yy') },
          { label: 'Status', value: <StatusBadge status={payment.status?.toLowerCase()} size="xs" /> },
        ]}
      />

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlassPanel tier={2} className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(payment.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">Mode</p>
              <p className="text-sm text-gray-900 dark:text-white">{payment.paymentMode}</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Party</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-900 dark:text-white">{payment.partyName}</p>
            <p className="text-xs text-gray-500 dark:text-white/60">Ref: {payment.reference || '-'}</p>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
