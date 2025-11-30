'use client';

import { useState, useEffect } from 'react';
import { FileText, User, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import Badge from '../../../../components/ui/badge';
import Pagination from '../../../../components/ui/pagination';
import { SearchBar } from '../../../../components/ui/search-filter';
import { DateRangePicker } from '../../../../components/ui/date-picker';
import { PageLoader } from '../../../../components/ui/loading';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    // TODO: Fetch audit logs from API
    setLoading(false);
    // Placeholder data
    setLogs([]);
  }, [currentPage, searchTerm, startDate, endDate]);

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'success',
      UPDATE: 'warning',
      DELETE: 'danger',
      STATUS_CHANGE: 'info',
    };
    return colors[action] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">
          Track all system changes and user activities
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by user, table, or record ID..."
            />
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <PageLoader message="Loading audit logs..." />
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No audit logs found</p>
              <p className="text-sm">Audit logs will appear here as changes are made</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {log.tableName}
                        </span>
                        <span className="text-sm text-gray-500">
                          #{log.recordId}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {log.user?.fullName || 'System'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(log.changedAt), 'dd MMM yyyy, hh:mm a')}
                        </div>
                      </div>

                      {log.ipAddress && (
                        <p className="text-xs text-gray-500 mt-1">
                          IP: {log.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Changes */}
                  {log.action === 'UPDATE' && (log.oldValues || log.newValues) && (
                    <details className="mt-3">
                      <summary className="text-sm text-primary-600 cursor-pointer hover:text-primary-700">
                        View changes
                      </summary>
                      <div className="mt-2 bg-gray-50 rounded p-3 text-xs font-mono">
                        <div className="grid grid-cols-2 gap-4">
                          {log.oldValues && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Before:</p>
                              <pre className="text-gray-600 whitespace-pre-wrap">
                                {JSON.stringify(log.oldValues, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newValues && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">After:</p>
                              <pre className="text-gray-600 whitespace-pre-wrap">
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
          {logs.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
