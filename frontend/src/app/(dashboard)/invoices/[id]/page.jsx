'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';
import { invoiceAPI } from '../../../../lib/api';
import PageHeader from '../../../../components/ui/page-header';
import GlassPanel from '../../../../components/ui/glass-panel';
import StatusBadge from '../../../../components/ui/status-badge';
import useToast from '../../../../hooks/useToast';
import { formatDate, formatCurrency } from '../../../../lib/utils';

export default function InvoiceDetailPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await invoiceAPI.getById(params.id);
        setInvoice(res.data?.data);
      } catch (error) {
        showError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="h-64 bg-white/60 dark:bg-white/10 rounded-lg animate-pulse" />;

  if (!invoice) return <div className="text-gray-500 dark:text-white/60 text-center py-12">Invoice not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice #${invoice.invoiceNumber}`}
        subtitle="Invoice Details"
        icon={Receipt}
        stats={[
          { label: 'Date', value: formatDate(invoice.invoiceDate, 'dd/MMM/yy') },
          { label: 'Status', value: <StatusBadge status={invoice.status?.toLowerCase()} size="xs" /> },
        ]}
      />

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlassPanel tier={2} className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Party Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">Name</p>
              <p className="text-sm text-gray-900 dark:text-white">{invoice.partyName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">GSTIN</p>
              <p className="text-sm font-mono text-gray-700 dark:text-white/80">{invoice.gstin || '-'}</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-white/60">Total:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-white/60">Paid:</span>
              <span className="font-mono text-green-600 dark:text-green-400">{formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-black/8 dark:border-white/10 pt-2">
              <span className="text-gray-500 dark:text-white/60">Balance:</span>
              <span className="font-mono font-bold text-orange-400">{formatCurrency(invoice.pendingAmount)}</span>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
