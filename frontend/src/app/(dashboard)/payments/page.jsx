'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, Trash2, IndianRupee, FileText } from 'lucide-react';
import { paymentAPI } from '../../../lib/api';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage, cn } from '../../../lib/utils';

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getAll({ limit: 50 });
      setPayments(response.data?.data?.payments || []);
    } catch (error) {
      showError(getErrorMessage(error));
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (payment) => {
    router.push(`/payments/${payment.id}`);
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Are you sure you want to delete payment ${payment.paymentNumber}?`)) {
      return;
    }

    try {
      await paymentAPI.delete(payment.id);
      showSuccess('Payment deleted successfully');
      fetchPayments();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-warp-in">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 backdrop-blur-md rounded-2xl border border-primary-500/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
            <IndianRupee className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-orbitron font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              PAYMENT <span className="text-primary-500">LEDGER</span>
            </h1>
            <p className="text-primary-500/70 font-orbitron mt-1 text-xs tracking-[0.3em] uppercase">
              {payments.length} Total Records
            </p>
          </div>
        </div>
        <Link href="/payments/new" className="w-full sm:w-auto">
          <button className="neon-button border-primary-500/50 shadow-[0_0_15px_rgba(0,255,136,0.2)] w-full justify-center">
            <Plus className="w-4 h-4" />
            RECORD PAYMENT
          </button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-panel overflow-hidden border-slate-800"
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="text-sm font-orbitron font-bold text-slate-300 tracking-widest">TRANSACTION HISTORY</h3>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin mb-4" />
            <p className="text-xs font-orbitron text-primary-500 tracking-widest uppercase animate-pulse">Initializing Data Stream...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-orbitron font-bold text-slate-400 tracking-widest uppercase">No Payments Found</p>
            <Link href="/payments/new">
              <button className="mt-4 neon-button border-primary-500/50 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                <Plus className="w-4 h-4" />
                INITIATE PAYMENT
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Payment No</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Party</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Invoice</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Total Amount</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Paid Amount</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Balance</th>
                  <th className="px-5 py-4 text-center text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-950/20">
                <AnimatePresence>
                  {payments.map((payment, index) => {
                    const getStatusStyle = (status) => {
                      switch (status) {
                        case 'Completed': return 'bg-primary-500/10 text-primary-500 border-primary-500/30 shadow-[0_0_10px_rgba(0,255,136,0.2)]';
                        case 'Partial': return 'bg-brand-500/10 text-brand-500 border-brand-500/30 shadow-[0_0_10px_rgba(0,212,255,0.2)]';
                        case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
                        default: return 'bg-slate-800 text-slate-400 border-slate-700';
                      }
                    };

                    return (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-800/50 transition-colors group"
                      >
                        <td className="px-5 py-4 font-orbitron font-bold text-primary-500 whitespace-nowrap">
                          {payment.paymentNumber}
                        </td>
                        <td className="px-5 py-4 text-slate-300 font-sans whitespace-nowrap">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="px-5 py-4 text-white font-sans font-medium whitespace-nowrap">
                          {payment.partyName || '-'}
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-orbitron tracking-wider whitespace-nowrap">
                          {payment.invoiceNumber || '-'}
                        </td>
                        <td className="px-5 py-4 text-right font-orbitron font-bold text-slate-300 tracking-wider">
                          {formatCurrency(payment.totalAmount)}
                        </td>
                        <td className="px-5 py-4 text-right font-orbitron font-bold text-primary-500 tracking-wider drop-shadow-[0_0_5px_rgba(0,255,136,0.3)]">
                          {formatCurrency(payment.paidAmount)}
                        </td>
                        <td className="px-5 py-4 text-right font-orbitron font-bold text-red-500 tracking-wider drop-shadow-[0_0_5px_rgba(239,68,68,0.3)]">
                          {formatCurrency(payment.balanceAmount)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-orbitron font-bold tracking-widest uppercase border",
                            getStatusStyle(payment.paymentStatus)
                          )}>
                            {payment.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2 transition-opacity">
                            <button
                              onClick={() => handleView(payment)}
                              className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 hover:border-brand-500/30 border border-transparent rounded-lg transition-all"
                              title="View payment details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(payment)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent rounded-lg transition-all"
                              title="Delete payment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
