'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Truck, Edit, Trash2 } from 'lucide-react';
import { consignmentAPI } from '../../../lib/api';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

const STATUS_FILTERS = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];

const statusColor = {
  Delivered: 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]',
  'In Transit': 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
  Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
};

export default function ConsignmentsPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { fetchConsignments(); }, []);

  const fetchConsignments = async () => {
    try {
      const res = await consignmentAPI.getAll({ limit: 500 });
      setConsignments(res.data?.data?.consignments || []);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, consignment) => {
    e.stopPropagation();
    if (!window.confirm(`Delete GR ${consignment.grNumber}?`)) return;
    try {
      await consignmentAPI.delete(consignment.id);
      showSuccess('Consignment deleted');
      fetchConsignments();
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
    let list = consignments;
    if (statusFilter !== 'All') list = list.filter(c => c.status === statusFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(c =>
        c.grNumber?.toLowerCase().includes(q) ||
        c.vehicleNumber?.toLowerCase().includes(q) ||
        c.fromLocation?.toLowerCase().includes(q) ||
        c.toLocation?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [consignments, statusFilter, debouncedSearch]);

  return (
    <div className="space-y-6 pb-10 animate-warp-in">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest uppercase">CONSIGNMENTS <span className="text-primary-500">/ GRs</span></h1>
          <p className="text-xs font-orbitron text-slate-400 tracking-[0.2em] uppercase mt-1">Total Records: <span className="text-brand-500">{consignments.length}</span></p>
        </div>
        <Link href="/consignments/new">
          <button className="flex items-center gap-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-500 font-orbitron font-bold text-xs px-5 py-2.5 rounded-xl border border-primary-500/50 shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:shadow-[0_0_25px_rgba(0,255,136,0.5)] transition-all uppercase tracking-wider">
            <Plus className="w-4 h-4" />
            New GR
          </button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-sm focus-within:border-primary-500 focus-within:shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-all">
          <Search className="w-4 h-4 text-primary-500/70 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search GR No, vehicle, route..."
            className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-slate-500 font-sans"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "text-xs px-4 py-2 rounded-lg font-orbitron tracking-wider uppercase transition-all whitespace-nowrap border",
                statusFilter === s
                  ? 'bg-brand-500/20 text-brand-500 border-brand-500/50 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                  : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:border-slate-500'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table Card */}
      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.13 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-12 h-12">
               <div className="absolute inset-0 border-2 border-primary-500/20 rounded-full"></div>
               <div className="absolute inset-0 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-xs font-orbitron tracking-widest text-primary-500 uppercase animate-pulse">Scanning Database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <Truck className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm font-orbitron tracking-widest uppercase">No Records Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">GR No.</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">Vehicle</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">Route</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">Contents</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">Freight</th>
                  <th className="px-5 py-4 text-center text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <AnimatePresence>
                  {filtered.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => router.push(`/consignments/${c.id}`)}
                      className="cursor-pointer hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                         <span className="font-orbitron font-bold tracking-wider text-primary-500">{c.grNumber}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                        {formatDate(c.grDate)}
                      </td>
                      <td className="px-5 py-4 text-white font-medium whitespace-nowrap">
                        {c.vehicleNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-300 whitespace-nowrap flex items-center gap-2">
                        {c.fromLocation} <ArrowRight className="w-3 h-3 text-brand-500" /> {c.toLocation}
                      </td>
                      <td className="px-5 py-4 text-slate-400 max-w-xs truncate">
                        {c.description || '—'}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-white">
                        {formatCurrency(c.freightAmount)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-orbitron font-bold tracking-wider uppercase border ${statusColor[c.status] || statusColor.Pending}`}>
                          {c.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/consignments/${c.id}/edit`); }}
                            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)] rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => handleDelete(e, c)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] rounded-lg transition-all"
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
// Add ArrowRight icon import since it's used in the template
import { ArrowRight } from 'lucide-react';
