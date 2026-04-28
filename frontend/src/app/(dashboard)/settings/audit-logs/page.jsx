'use client';

import { useState, useEffect } from 'react';
import { FileText, User, Clock, Search } from 'lucide-react';
import GlassPanel from '../../../../components/ui/glass-panel';
import PageHeader from '../../../../components/ui/page-header';
import StatusBadge from '../../../../components/ui/status-badge';
import { auditAPI } from '../../../../lib/api';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { showError } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await auditAPI.getAll({
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        const d = res.data?.data;
        setLogs(d?.data || []);
        setTotalPages(d?.pagination?.totalPages || 1);
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [currentPage, searchTerm, startDate, endDate]);

  const getActionVariant = (action) => {
    const variants = {
      CREATE: 'booked',
      UPDATE: 'in-transit',
      DELETE: 'cancelled',
      STATUS_CHANGE: 'loaded',
    };
    return variants[action] || 'pending';
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all system changes and user activities"
        icon={FileText}
      />

      {/* Filters */}
      <GlassPanel tier={1} className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user, table, or record ID..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/8 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/8 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/8 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
        </div>
      </GlassPanel>

      {/* Logs */}
      <GlassPanel tier={2} className="p-6">
        {loading ? (
          <div className="h-64 bg-white/60 dark:bg-white/10 rounded-lg animate-pulse" />
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-white/60">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-white/40" />
            <p className="text-lg font-medium">No audit logs found</p>
            <p className="text-sm">Audit logs will appear here as changes are made</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-black/6 dark:border-white/10 rounded-lg p-4 hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={getActionVariant(log.action)} label={log.action} size="xs" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.tableName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-white/60">
                        #{log.recordId}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-white/60">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {log.user?.fullName || 'System'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(log.changedAt)}
                      </div>
                    </div>

                    {log.ipAddress && (
                      <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
                        IP: {log.ipAddress}
                      </p>
                    )}
                  </div>
                </div>

                {log.action === 'UPDATE' && (log.oldValues || log.newValues) && (
                  <details className="mt-3">
                    <summary className="text-sm text-primary-500 cursor-pointer hover:text-primary-600">
                      View changes
                    </summary>
                    <div className="mt-2 bg-white/40 dark:bg-white/5 rounded p-3 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-4">
                        {log.oldValues && (
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Before:</p>
                            <pre className="text-gray-600 dark:text-white/60 whitespace-pre-wrap">
                              {JSON.stringify(log.oldValues, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.newValues && (
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">After:</p>
                            <pre className="text-gray-600 dark:text-white/60 whitespace-pre-wrap">
                              {JSON.stringify(log.newValues, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-lg bg-white/50 dark:bg-white/5 border border-black/6 dark:border-white/8 text-gray-700 dark:text-white/70 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-white/70">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-lg bg-white/50 dark:bg-white/5 border border-black/6 dark:border-white/8 text-gray-700 dark:text-white/70 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
