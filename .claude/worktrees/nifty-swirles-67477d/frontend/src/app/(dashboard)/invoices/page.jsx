'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Download, Eye, Trash2, FileText } from 'lucide-react';
import { invoiceAPI } from '../../../lib/api';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage } from '../../../lib/utils';

const STATUS_FILTERS = ['All', 'Pending', 'Partial', 'Paid'];

const statusColor = {
  Paid: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/30',
  Partial: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/30',
  Pending: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/30',
  Overdue: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700/30',
};

export default function InvoicesPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const res = await invoiceAPI.getAll({ limit: 200 });
      setInvoices(res.data?.data?.invoices || []);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (e, invoice) => {
    e.stopPropagation();
    setDownloadingId(invoice.id);
    try {
      const res = await invoiceAPI.download(invoice.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showError('Failed to download PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (e, invoice) => {
    e.stopPropagation();
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    try {
      await invoiceAPI.delete(invoice.id);
      showSuccess('Invoice deleted');
      fetchInvoices();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const filtered = useMemo(() => {
    let list = invoices;
    if (statusFilter !== 'All') list = list.filter(i => i.paymentStatus === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.invoiceNumber?.toLowerCase().includes(q) ||
        i.partyName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, statusFilter, search]);

  const totals = useMemo(() => ({
    total: invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0),
    paid: invoices.reduce((s, i) => s + Number(i.paidAmount || 0), 0),
    balance: invoices.reduce((s, i) => s + Number(i.balanceAmount || 0), 0),
  }), [invoices]);

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices / Bills</h1>
          <p className="text-sm text-gray-500 mt-0.5">{invoices.length} total bills</p>
        </div>
        <Link href="/invoices/new">
          <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all">
            <Plus className="w-4 h-4" />
            New Bill
          </button>
        </Link>
      </motion.div>

      {/* Summary strip */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        {[
          { label: 'Total Billed', value: totals.total, color: 'text-gray-900 dark:text-white' },
          { label: 'Collected', value: totals.paid, color: 'text-green-600 dark:text-green-400' },
          { label: 'Outstanding', value: totals.balance, color: 'text-red-600 dark:text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        {/* Search */}
        <div className="flex items-center gap-2 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bill no, party…"
            className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          />
        </div>

        {/* Status chips */}
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                statusFilter === s
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-black/10 dark:border-white/10 hover:border-primary-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-black/8 dark:border-white/8 bg-gray-50/80 dark:bg-white/3">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Bill No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Party</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                <AnimatePresence>
                  {filtered.map((inv, i) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="cursor-pointer hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors group"
                    >
                      <td className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400 whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(inv.invoiceDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                        {inv.partyName}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${Number(inv.balanceAmount) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {formatCurrency(inv.balanceAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[inv.paymentStatus] || statusColor.Pending}`}>
                          {inv.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/invoices/${inv.id}`); }}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleDownload(e, inv)}
                            disabled={downloadingId === inv.id}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-40"
                            title="Download PDF"
                          >
                            {downloadingId === inv.id
                              ? <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                              : <Download className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={e => handleDelete(e, inv)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
