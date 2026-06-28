'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Download, Eye, Trash2, FileText, UploadCloud, IndianRupee } from 'lucide-react';
import { invoiceAPI } from '../../../lib/api';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage, cn } from '../../../lib/utils';

const STATUS_FILTERS = ['All', 'Pending', 'Partial', 'Paid'];

const statusColor = {
  Paid: 'bg-primary-500/10 text-primary-500 border-primary-500/30',
  Partial: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  Pending: 'bg-red-500/10 text-red-500 border-red-500/30',
  Overdue: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
};

export default function InvoicesPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [downloadingId, setDownloadingId] = useState(null);

  const fileInputRef = useRef(null);

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

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await invoiceAPI.sync(file);
      showSuccess(res.data?.message || 'Invoices synced successfully');
      fetchInvoices();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    let list = invoices;
    if (statusFilter !== 'All') list = list.filter(i => i.paymentStatus === statusFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(i =>
        i.invoiceNumber?.toLowerCase().includes(q) ||
        i.partyName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, statusFilter, debouncedSearch]);

  const totals = useMemo(() => ({
    total: invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0),
    paid: invoices.reduce((s, i) => s + Number(i.paidAmount || 0), 0),
    balance: invoices.reduce((s, i) => s + Number(i.balanceAmount || 0), 0),
  }), [invoices]);

  return (
    <div className="space-y-6 pb-10 animate-warp-in">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 backdrop-blur-md rounded-2xl border border-primary-500/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
            <FileText className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-orbitron font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              INVOICE <span className="text-primary-500">LEDGER</span>
            </h1>
            <p className="text-primary-500/70 font-orbitron mt-1 text-xs tracking-[0.3em] uppercase">
              {invoices.length} Total Records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".xlsx"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="neon-button-outline"
          >
            {uploading ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /> : <UploadCloud className="w-4 h-4" />}
            {uploading ? 'SYNCING...' : 'SYNC EXCEL'}
          </button>
          <Link href="/invoices/new">
            <button className="neon-button">
              <Plus className="w-4 h-4" />
              NEW INVOICE
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Summary strip */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        {[
          { label: 'TOTAL BILLED', value: totals.total, color: 'text-white', borderColor: 'border-slate-800' },
          { label: 'COLLECTED', value: totals.paid, color: 'text-brand-500', borderColor: 'border-brand-500/30' },
          { label: 'OUTSTANDING', value: totals.balance, color: 'text-red-500', borderColor: 'border-red-500/30' },
        ].map(s => (
          <div key={s.label} className={cn("glass-panel p-5 border", s.borderColor)}>
            <p className="text-[10px] font-orbitron text-slate-400 tracking-widest uppercase mb-1">{s.label}</p>
            <p className={cn("text-2xl font-orbitron font-bold tracking-wider", s.color)}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        {/* Search */}
        <div className="flex items-center gap-2 glass-panel border-slate-700 rounded-xl px-4 py-2.5 flex-1 max-w-md focus-within:border-primary-500/50 focus-within:shadow-[0_0_10px_rgba(0,255,136,0.1)] transition-all">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice no, party..."
            className="flex-1 bg-transparent text-sm font-sans outline-none text-white placeholder:text-slate-500 placeholder:font-orbitron placeholder:tracking-widest placeholder:text-xs"
          />
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "text-[10px] font-orbitron font-bold tracking-widest uppercase px-4 py-2 rounded-lg border transition-all",
                statusFilter === s
                  ? 'bg-primary-500/20 text-primary-500 border-primary-500 shadow-[0_0_10px_rgba(0,255,136,0.2)]'
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-600'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="glass-panel overflow-hidden border-slate-800"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin mb-4" />
            <p className="text-xs font-orbitron text-primary-500 tracking-widest uppercase animate-pulse">Initializing Data Stream...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-orbitron font-bold text-slate-400 tracking-widest uppercase">No Invoices Found</p>
            <p className="text-[10px] font-orbitron text-slate-500 mt-2 tracking-widest uppercase">Adjust search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Bill No.</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Party</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Balance</th>
                  <th className="px-5 py-4 text-center text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-950/20">
                <AnimatePresence>
                  {filtered.map((inv, i) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="cursor-pointer hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-5 py-4 font-orbitron font-bold text-primary-500 whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-sans whitespace-nowrap">
                        {formatDate(inv.invoiceDate)}
                      </td>
                      <td className="px-5 py-4 text-white font-sans font-medium">
                        {inv.partyName}
                      </td>
                      <td className="px-5 py-4 text-right font-orbitron font-bold text-white tracking-wider">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className={cn(
                        "px-5 py-4 text-right font-orbitron font-bold tracking-wider",
                        Number(inv.balanceAmount) > 0 ? 'text-red-500' : 'text-primary-500'
                      )}>
                        {formatCurrency(inv.balanceAmount)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-orbitron font-bold tracking-widest uppercase border",
                          statusColor[inv.paymentStatus] || statusColor.Pending
                        )}>
                          {inv.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/invoices/${inv.id}`); }}
                            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 hover:border-primary-500/30 border border-transparent rounded-lg transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => handleDownload(e, inv)}
                            disabled={downloadingId === inv.id}
                            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 hover:border-brand-500/30 border border-transparent rounded-lg transition-all disabled:opacity-40"
                            title="Download PDF"
                          >
                            {downloadingId === inv.id
                              ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                              : <Download className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={e => handleDelete(e, inv)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
