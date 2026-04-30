'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Truck, Edit, Trash2 } from 'lucide-react';
import { consignmentAPI } from '../../../lib/api';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage } from '../../../lib/utils';

const STATUS_FILTERS = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];

const statusColor = {
  Delivered: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/30',
  'In Transit': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/30',
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/30',
  Cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/30',
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

  const filtered = useMemo(() => {
    let list = consignments;
    if (statusFilter !== 'All') list = list.filter(c => c.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.grNumber?.toLowerCase().includes(q) ||
        c.vehicleNumber?.toLowerCase().includes(q) ||
        c.fromLocation?.toLowerCase().includes(q) ||
        c.toLocation?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [consignments, statusFilter, search]);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consignments / GRs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{consignments.length} total records</p>
        </div>
        <Link href="/consignments/new">
          <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all">
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
        <div className="flex items-center gap-2 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search GR No, vehicle, route, contents…"
            className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          />
        </div>
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
        transition={{ duration: 0.35, delay: 0.13 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Truck className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No consignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-black/8 dark:border-white/8 bg-gray-50/80 dark:bg-white/3">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">GR No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contents</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Freight</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                <AnimatePresence>
                  {filtered.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => router.push(`/consignments/${c.id}`)}
                      className="cursor-pointer hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors group"
                    >
                      <td className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400 whitespace-nowrap">
                        {c.grNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(c.grDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        {c.vehicleNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {c.fromLocation} → {c.toLocation}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {c.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(c.freightAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[c.status] || statusColor.Pending}`}>
                          {c.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/consignments/edit/${c.id}`); }}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleDelete(e, c)}
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
